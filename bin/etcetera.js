#!/usr/bin/env node

var updater = require('update-notifier')
var pkg = require('../package.json')

updater({ pkg }).notify()

var
  chalk = require('chalk')
var fs = require('fs')
var path = require('path')
var etcdjs = require('@npmcorp/etcdjs')
var objectify = require('@npmcorp/etcd-result-objectify')
var nunjucks = require('nunjucks')
var argv = require('yargs')
  .usage('configure the named application by filling out its template with data from etcd\n$0 [-d deploydir] [-g hostgroup] [-c template] appname')
  .example('etcetera my-service')
  .example('etcetera -d /mnt/deploys/foozle my-service')
  .option('d', {
    alias: 'deploydir',
    description: 'full path to deploy directory'
  })
  .option('t', {
    alias: 'template',
    default: 'configuration.tmpl',
    description: 'configuration template file name'
  })
  .option('g', {
    alias: 'group',
    description: 'hostgroup, if there is one',
    default: ''
  })
  .option('s', {
    alias: 'silent',
    description: 'do not log helpfully',
    type: 'boolean'
  })
  .option('h', {
    alias: 'host',
    description: 'etcd host to talk to (overrides `.renvrc`)',
    type: 'array'
  })
  .option('e', {
    alias: 'env',
    description: 'etcdrc environment'
  })
  .option('u', {
    alias: 'username',
    description: 'etcd username'
  })
  .option('p', {
    alias: 'password',
    description: 'etcd password'
  })
  .help('help')
  .demand(1)
  .argv

const
  hosts = require('../lib/rc')(argv)
const transform = require('../lib/transform.js')

var app = argv._[0]
var deploydir = argv.d || path.join('/mnt', 'deploys', app)
var inputTmpl = path.join(deploydir, argv.template)
nunjucks.configure({ autoescape: false })

var etcd = etcdjs(hosts)

function log (msg) {
  if (argv.silent) return
  console.log(msg)
}

function writeConfigurationTemplate (tmplname, callback) {
  etcd.get('/', { recursive: true }, function (err, reply) {
    if (err) return callback(err)

    var objectified = objectify(reply.node)
    var transformed = transform(objectified, app, argv.group)
    transformed.it = transformed

    var destname = tmplname.replace('.tmpl', '.toml')
    var tmpl = nunjucks.renderString(fs.readFileSync(tmplname, 'utf8'), transformed)
    log('-- wrote config: ' + chalk.yellow(destname))
    fs.writeFile(destname, tmpl, 'utf8', function (err) {
      callback(err, destname)
    })
  })
}

function dumpFiles (input) {
  require('toml-require').install()
  var config = require(path.resolve(input))

  // now dump the files listed in config.files
  // This is obviously a hacky step forward from existing config.

  var keys = Object.keys(config.files || {})
  keys.forEach(function (k) {
    var fkey = config.files[k]
    var get = argv.group ? getFKey : etcd.get.bind(etcd)
    get(fkey, function (err, result) {
      if (err) {
        log(chalk.red('cannot find key ' + fkey))
        process.exit(1)
      }

      var fname = path.join(deploydir, k)
      fs.writeFile(fname, result.node.value, function (err) {
        if (err) console.error(err)
        else log('-- wrote additional file: ' + fname)
      })
    })
  })
}

function getFKey (fkey, cb) {
  etcd.get(fkey + '.' + argv.group, function (err, result) {
    if (err) {
      return etcd.get(fkey, cb)
    } else {
      return cb(err, result)
    }
  })
}

log('configuring app ' + chalk.blue(app))
log('-- reading template: ' + chalk.blue(inputTmpl))
writeConfigurationTemplate(inputTmpl, function (err, config) {
  if (err) {
    log(chalk.red(err.message) + '; exiting')
    process.exit(1)
  }

  // now we read it & dump any files mentioned
  dumpFiles(config)
})

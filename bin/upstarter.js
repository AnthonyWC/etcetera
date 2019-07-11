#!/usr/bin/env node

var
  path = require('path')
var upstart = require('../lib/upstart')
var argv = require('yargs')
  .usage('generate an upstart file from the provided config\n$0 [-o output] [service-name|configpath]')
  .example('upstarter my-service')
  .example('upstarter -o /etc/whatever /mnt/deploys/my-service/configuration.toml')
  .option('o', {
    alias: 'output',
    default: '/etc/init',
    description: 'where to write the upstart files'
  })
  .option('s', {
    alias: 'silent',
    description: 'do not log helpfully',
    type: 'boolean'
  })
  .option('f', {
    alias: 'filebeat',
    description: 'write to filebeat instead of disk',
    type: 'boolean'
  })
  .help('help')
  .demand(1)
  .argv

var configpath = argv._[0]
if (configpath.indexOf(path.sep) === -1) {
  configpath = path.join('/mnt', 'deploys', configpath, 'configuration.toml')
}

function log (msg) {
  if (argv.silent) return
  console.log(msg)
}

upstart(configpath, argv, log, function (err) {
  if (err) throw err
  process.exit(0)
})

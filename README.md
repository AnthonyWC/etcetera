# etcetera

[![on npm](https://img.shields.io/npm/v/etcetera)](https://www.npmjs.org/package/etcetera) 
[![Coverage Status](https://img.shields.io/coveralls/github/npm/etcetera)](https://coveralls.io/github/npm/etcetera?branch=master)
[![Dependencies](https://img.shields.io/david/npm/etcetera)](https://david-dm.org/npm/etcetera)

Read config from etcd. Fill out templates. Write upstart files. Be our diode electrode  generator oscillator configurator make a circuit with us.

An example template is in `templates/configuration.tmpl`.

## Usage

`npm install -g etcetera`

This will install two commandline tools.

## etcetera

Configure the named application by filling out its template with data from etcd.

```
etcetera [-d deploydir] [-g hostgroup] [-c template] appname
Options:
  --version        Show version number                                 [boolean]
  -d, --deploydir  full path to deploy directory
  -t, --template   configuration template file name
                                                 [default: "configuration.tmpl"]
  -g, --group      hostgroup, if there is one                      [default: ""]
  -s, --silent     do not log helpfully                                [boolean]
  -h, --host       etcd host to talk to (overrides `.renvrc`)            [array]
  -e, --env        etcdrc environment
  -u, --username   etcd username
  -p, --password   etcd password
  --help           Show help                                           [boolean]
Examples:
  etcetera my-service
  etcetera -d /mnt/deploys/foozle my-service
```

## upstarter

Generate an upstart file from the provided config

```
upstarter [-o output] [service-name|configpath]
Options:
  -o, --output  where to write the upstart files          [default: "/etc/init"]
  -s, --silent  do not log helpfully                                   [boolean]
  --help        Show help                                              [boolean]

Examples:
  upstarter my-service
  upstarter -o /etc/whatever /mnt/deploys/my-service/configuration.toml
```

If you don't have a full path in the target for `upstarter`, it will look for a configuration file in `/mnt/deploys/TARGET/configuration.toml`.


## .etcdrc

`etcetera` will read your etcd configuration from any `.etcdrc` files you have sitting around, defaulting with `$HOME/.etcdrc` and falling back to `$HOME/.renvrc` for backwards compatibility

## LICENSE

ISC.

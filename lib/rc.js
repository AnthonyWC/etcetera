const RC = require('rc')

let config

function configure (argv) {
  if (config) return config

  const auth = (argv.username && argv.password)
    ? `${encodeURIComponent(argv.username)}:${encodeURIComponent(argv.password)}@`
    : ''

  // Prefer an etcdrc if we can find one.
  let rc = RC('etcd')
  if (Object.keys(rc).length === 1) {
    // fall back to renvrc
    rc = RC('renv', { hosts: '127.0.0.1:4001', ssl: false }, [])
    var hosts = argv.host || rc.hosts
    if (!Array.isArray(hosts)) hosts = hosts.split(' ')
    hosts = hosts.map(function (h) {
      return (rc.ssl ? 'https://' : 'http://') + auth + h
    })

    config = hosts
  } else {
    var configset = rc[argv.env] || rc
    if (!Array.isArray(configset.hosts)) configset.hosts = [configset.hosts]
    configset.hosts = configset.hosts.map(h => {
      return (configset.ssl ? 'https://' : 'http://') + auth + h
    })

    config = configset.hosts
  }

  console.log(config)
  return config
}

module.exports = configure

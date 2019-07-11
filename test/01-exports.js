'use strict'

require('must')
var etcetera = require('../index')

describe('etcetera', function () {
  it('exports upstart()', function () {
    etcetera.must.have.property('upstart')
    etcetera.upstart.must.be.a.function()
  })
  it('exports transform()', function () {
    etcetera.must.have.property('transform')
    etcetera.transform.must.be.a.function()
  })
})

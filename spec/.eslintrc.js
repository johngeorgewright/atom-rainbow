const base = '../.eslintrc.js'

module.exports = Object.assign({}, base, {
  env: Object.assign({}, base.env, {
    jasmine: true
  }),
  globals: Object.assign({}, base.globasls, {
    waitsForPromise: false
  })
})

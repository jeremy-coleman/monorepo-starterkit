#!/usr/bin/env node
let path = require('path')
let meow = require('meow')

//let start = require('./index')

import { start } from './server-only'

// const findUp = require('find-up');
// const findPkg = cwd => findUp('package.json', {cwd});
// const findPkgSync = cwd => findUp.sync('package.json', {cwd});
// require('update-notifier')({pkg: findUp('package.json')}).notify()

const cli = meow(
  `
  Usage
    $ sucrase-serve <component>

  Options
    --port, -p     Server port
    --raw, -r      Serve raw output with no doctype declaration
    --bundle, -b   Render with bundled javascript
    --noWrap, -n   Opt out of wrapping component in a div
`,
  {
    flags: {
      port: {
        type: 'string',
        alias: 'p',
      },
      raw: {
        type: 'boolean',
        alias: 'r',
      },
      bundle: {
        type: 'boolean',
        alias: 'b',
      },
      noWrap: {
        type: 'boolean',
        default: false,
        alias: 'n',
      },
    },
  },
)

const [file] = cli.input
const filename = path.join(process.cwd(), file)
const opts = Object.assign({}, cli.flags, {
  filename,
  port: parseInt(cli.flags.port || 3000),
})

start(opts)
  .then(server => {
    if (!server.address()) {
      console.log(`failed to start server on ${cli.flags.port || 3000}`)
      process.exit(1)
    }

    const { port } = server.address()
    console.log(`listening on port ${port}`)
  })
  .catch(err => {
    console.log(err)
    process.exit(1)
  })

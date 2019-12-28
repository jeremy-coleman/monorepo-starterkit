//require("sucrase/register")
const fs = require('fs')
const path = require('path')
const { Readable } = require('stream')
const browserify = require('browserify')
const tinyify = require('tinyify')
const http = require('http')
const React = require('react')
const { renderToNodeStream, renderToStaticNodeStream } = require('react-dom/server')
const jsonStringify = require('json-stringify-safe')
const sucrase = require('sucrase')

//----------------------------bundle config -------------------------//
const parse = code =>
  sucrase.transform(code, {
    transforms: ['jsx', 'imports', 'typescript'],
  }).code

const browserifyBundler = (filename, code) => {
  const stream = new Readable()
  stream.push(code)
  stream.push(null)
  const dirname = path.dirname(filename)

  return new Promise((resolve, reject) => {
    browserify(stream, {
      basedir: dirname,
      bundleExternal: false,
      plugin: [tinyify],
    })
      .bundle((err, res) => {
        if (err) reject(err)
        else {
          const script = res.toString()
          resolve(script)
        }
      })
      .pipe(fs.createWriteStream('out.js'))
  })
}

// current doesn't work - trying to just write to a string and let the client do the work
// problem is the require statement in the component (passed in via fs.readFileSync(filename) below this)
// easy-ish fix just not gonna deal with it atm cuz nextjs

const createEntry = component => `
${component}
const props = JSON.parse(
  initial_props.innerHTML
)
const el = React.createElement(App, props)
ReactDOM.hydrate(el, div)
`

const bundle = async filename => {
  return await browserifyBundler(filename, createEntry(parse(fs.readFileSync(filename).toString())))
}

//----------------------------server config -------------------------//

var start = async opts => {
  opts.port = opts.port || 3000
  if (opts.bundle) {
    opts.script = await bundle(opts.filename)
    console.log('bundle size: ' + opts.script.length + ' bytes')
  }
  const App = require(opts.filename)
  const server = http.createServer(handleRequest(App, opts))
  return await server.listen(opts.port)
}

const handleRequest = (App, opts) => async (req, res) => {
  if (!opts.raw && !opts.noWrap) res.write(header)
  if (!opts.noWrap) res.write('<div id=div>')
  const props = Object.assign({}, opts, { req, res })

  delete props.script

  const el = isAsync(App) ? await createAsyncElement(App, props) : React.createElement(App, props)

  const stream = opts.bundle ? renderToNodeStream(el) : renderToStaticNodeStream(el)

  stream.pipe(res, { end: false })

  stream.on('end', async () => {
    if (!opts.noWrap) res.write('</div>')
    if (opts.script) {
      const json = jsonStringify(props)
      res.write(`<script id='initial_props' type='application/json'>${json}</script>`)
      res.write(`<script>${opts.script}</script>`)
    }

    res.end()
  })

  stream.on('error', error => {
    console.error(error)
    res.end()
  })
}

const isAsync = fn => fn.constructor.name === 'AsyncFunction'

const createAsyncElement = async (Component, props) => await Component(props)

const header = `<!DOCTYPE html>
<meta charset='utf-8'>
<meta name='viewport' content='width=device-width,initial-scale=1'>`

export { start }
//module.exports = start

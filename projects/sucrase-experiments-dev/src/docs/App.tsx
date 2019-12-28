const React = require('react')

const App = props => {
  return (
    <React.Fragment>
      <h1>Hello from Sucrase and Browserify</h1>
      <pre>Request URL:{props.req.url}</pre>
    </React.Fragment>
  )
}

module.exports = App

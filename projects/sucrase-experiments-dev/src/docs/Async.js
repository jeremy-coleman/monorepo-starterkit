const React = require('react')
const fetch = require('node-fetch')

const endpoint = `https://jsonplaceholder.typicode.com/posts/1`

const ASync = async props => {
  const res = await fetch(endpoint)
  const data = await res.json()

  return (
    <React.Fragment>
      <h1>Hello</h1>
      <pre>own url:</pre>
      <pre>{props.req.url}</pre>
      <pre>fetching url:</pre>
      <pre>{endpoint}</pre>
      <pre children={JSON.stringify(data, null, 2)} />
    </React.Fragment>
  )
}

module.exports = ASync

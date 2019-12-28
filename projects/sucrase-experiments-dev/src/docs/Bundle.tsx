import React from 'react'
import { useState } from 'react'

const App = props => {
  const [count, useCount] = useState(0)
  const inc = e => useCount(count + 1)

  return (
    <React.Fragment>
      <h1>Hello {props.count}</h1>
      <button children="+" onClick={inc} />
    </React.Fragment>
  )
}
// App.defaultProps = {
//   count: 0
// }

module.exports = App

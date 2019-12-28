import { render } from 'react-dom'
import React from 'react'
import { connect } from 'lape'

import { App } from './app'

let node = document.getElementById('coglite-app-root')

if ((module as any).hot) {
  ;(module as any).hot.accept()
}

const AppRoot = connect(App)

render(<AppRoot />, node)

console.log(React.Component.prototype)

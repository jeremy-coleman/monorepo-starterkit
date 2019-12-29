import 'typeface-roboto'

import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import * as serviceWorker from './serviceWorker'

import config from './api/config'
import authService from './api/authService'
import api from './api/api'

// Init the API service
authService.init({
  useSampleData: config.useSampleData,
})

// Init rest API client
api.init({
  useSampleData: config.useSampleData,
})

ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()

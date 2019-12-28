import { ipcRenderer } from 'electron'
import reducers from './reducers'
import { TASKS } from './actionTypes'

let recentListStorage = JSON.parse(localStorage.getItem('recentList')) || []

export let recentList = recentListStorage.reduce((states, pathname) => {
  ipcRenderer.send('gulp:tasks', { path: pathname })

  return reducers(states, {
    type: TASKS.ADD_BUILD,
    pathname: pathname,
  })
}, {})

export default recentList

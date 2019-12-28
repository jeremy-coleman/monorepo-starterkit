import { TASKS } from './actionTypes'

type State = {
  currentPathname?: any
  pathnameList?: any
  buildList?: any
}

function currentPathname(previousState = '', action) {
  switch (action.type) {
    case TASKS.ADD_BUILD:
      return action.pathname
    case TASKS.SELECT_BUILD:
      return action.pathname
    case TASKS.DELETE_BUILD:
      return previousState === action.pathname ? '' : previousState
    default:
      return previousState
  }
}

function pathnameList(previousState = [], action) {
  switch (action.type) {
    case TASKS.ADD_BUILD:
      return [action.pathname, ...previousState]
    case TASKS.DELETE_BUILD:
      return previousState.filter(item => item !== action.pathname)
    default:
      return previousState
  }
}

function buildList(previousState = [], action) {
  switch (action.type) {
    case TASKS.ADD_BUILD:
      return [
        {
          pathname: action.pathname,
          log: '',
          runnable: true,
          running: false,
          tasks: [],
          task: '',
        },
        ...previousState,
      ]
    case TASKS.DELETE_BUILD:
      return previousState.filter(item => item.pathname !== action.pathname)
    case TASKS.ADD_TASKS:
      return previousState.map(build => {
        if (build.pathname === action.pathname) {
          return {
            pathname: build.pathname,
            log: build.log,
            runnable: build.runnable,
            running: build.running,
            tasks: action.tasks,
            task: '',
          }
        } else {
          return build
        }
      })
    case TASKS.SELECT_TASK:
      return previousState.map(build => {
        if (build.pathname === action.pathname) {
          return {
            pathname: build.pathname,
            log: build.log,
            runnable: build.runnable,
            running: build.running,
            tasks: build.tasks,
            task: action.task,
          }
        } else {
          return build
        }
      })
    case TASKS.START_BUILD:
      return previousState.map(build => {
        if (build.pathname === action.pathname) {
          return {
            pathname: build.pathname,
            log: '',
            runnable: build.runnable,
            running: true,
            tasks: build.tasks,
            task: build.task,
          }
        } else {
          return build
        }
      })
    case TASKS.STOP_BUILD:
      return previousState.map(build => {
        if (build.pathname === action.pathname) {
          return {
            pathname: build.pathname,
            log: build.log,
            runnable: build.runnable,
            running: false,
            tasks: build.tasks,
            task: build.task,
          }
        } else {
          return build
        }
      })
    case TASKS.APPEND_LOG:
      return previousState.map(build => {
        if (build.pathname === action.pathname) {
          return {
            pathname: build.pathname,
            log: build.log + action.log,
            runnable: build.runnable,
            running: build.running,
            tasks: build.tasks,
            task: build.task,
          }
        } else {
          return build
        }
      })

    default:
      return previousState
  }
}

export let reducers = (previousState: State = {}, action) => {
  return {
    currentPathname: currentPathname(previousState.currentPathname, action),
    pathnameList: pathnameList(previousState.pathnameList, action),
    buildList: buildList(previousState.buildList, action),
  }
}

export default reducers

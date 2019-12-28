import { TASKS } from './actionTypes'

export let actionCreator = {
  addBuild(pathname) {
    return {
      type: TASKS.ADD_BUILD,
      pathname,
    }
  },
  selectBuild(pathname) {
    return {
      type: TASKS.SELECT_BUILD,
      pathname,
    }
  },
  deleteBuild(pathname) {
    return {
      type: TASKS.DELETE_BUILD,
      pathname,
    }
  },
  addTasks(pathname, tasks) {
    return {
      type: TASKS.ADD_TASKS,
      pathname,
      tasks,
    }
  },
  selectTask(pathname, task) {
    return {
      type: TASKS.SELECT_TASK,
      pathname,
      task,
    }
  },
  startBuild(pathname) {
    return {
      type: TASKS.START_BUILD,
      pathname,
    }
  },
  stopBuild(pathname) {
    return {
      type: TASKS.STOP_BUILD,
      pathname,
    }
  },
  appendLog(pathname, log) {
    return {
      type: TASKS.APPEND_LOG,
      pathname,
      log,
    }
  },
}

export default actionCreator

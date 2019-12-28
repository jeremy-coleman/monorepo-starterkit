import React, { Component } from 'react'
import { actionCreator } from './actionCreator'
import { BuildList } from './BuildList'
import { Container } from './Container'
import { ipcRenderer, remote } from 'electron'
import fs from 'fs'

const { app, dialog } = remote
import { useEffect } from 'react'

export class App extends Component<any, any> {
  checkGulpfile: (path: any) => boolean
  checkPathnameList: (path: any) => any
  addBuild: () => void
  selectBuild: (pathname: any) => void
  deleteBuild: (pathname: any) => void
  selectTask: (pathname: any, task: any) => void
  startBuild: (pathname: any, task: any) => void
  stopBuild: (pathname: any) => void

  constructor(props) {
    super(props)

    let { dispatch } = this.props
    this.checkGulpfile = path => {
      try {
        return fs.readdirSync(path).some(item => item === 'gulpfile.js')
      } catch (e) {
        return false
      }
    }
    this.checkPathnameList = path => {
      try {
        return this.props.pathnameList.includes(path)
      } catch (e) {
        return false
      }
    }

    this.addBuild = () => {
      const currentWindow = remote.getCurrentWindow()
      dialog.showOpenDialog(currentWindow, { properties: ['openDirectory'] }, args => {
        if (args[0]) {
          if (this.checkPathnameList(args[0])) {
            dialog.showErrorBox('Error', 'Already exists!')
          } else if (!this.checkGulpfile(args[0])) {
            dialog.showErrorBox('Error', 'gulpfile.js not found!')
          } else {
            dispatch(actionCreator.addBuild(args[0]))
            ipcRenderer.send('gulp:tasks', { path: args[0] })
          }
        }
      })
    }

    this.selectBuild = pathname => {
      dispatch(actionCreator.selectBuild(pathname))
    }

    this.deleteBuild = pathname => {
      ipcRenderer.send('gulp:stop', { path: pathname })
      dispatch(actionCreator.deleteBuild(pathname))
    }

    this.selectTask = (pathname, task) => {
      dispatch(actionCreator.selectTask(pathname, task))
    }

    this.startBuild = (pathname, task) => {
      ipcRenderer.send('gulp:start', { task: task, path: pathname })
      dispatch(actionCreator.startBuild(pathname))
    }

    this.stopBuild = pathname => {
      ipcRenderer.send('gulp:stop', { path: pathname })
    }

    ipcRenderer.on('gulp:tasks', function(event, param) {
      dispatch(actionCreator.addTasks(param.path, (param.data && param.data.split('\n')) || []))
    })

    ipcRenderer.on('gulp:console', function(event, param) {
      dispatch(actionCreator.appendLog(param.path, param.data))
    })

    ipcRenderer.on('gulp:error', function(event, param) {
      dispatch(actionCreator.appendLog(param.path, '<span class="red">' + param.data + '</span>'))
    })

    ipcRenderer.on('gulp:terminated', function(event, param) {
      dispatch(actionCreator.stopBuild(param.path))
    })
  }

  // 	document.ondragover = document.ondragleave = document.ondragend = document.ondrop = function (event) {
  // 		event.preventDefault();
  // 		return false;
  // 	};
  // }

  render() {
    let { buildList, pathnameList, currentPathname } = this.props
    let currentBuild = [...buildList].find(item => item.pathname === currentPathname)

    return (
      <div>
        <BuildList
          currentPathname={currentPathname}
          pathnameList={pathnameList}
          addBuild={this.addBuild}
          selectBuild={this.selectBuild}
          deleteBuild={this.deleteBuild}
        />
        <Container
          currentPathname={currentPathname}
          currentBuild={currentBuild}
          selectTask={this.selectTask}
          startBuild={this.startBuild}
          stopBuild={this.stopBuild}
        />
      </div>
    )
  }
}
export default App

import React from 'react'
import Path from './Path'
import { TaskSelect } from './TaskSelect'
import { StartButton } from './StartButton'
import { StopButton } from './StopButton'
import { ConsoleView } from './Console'

export const Container = ({
  currentBuild = {
    pathname: '',
    log: '',
    runnable: false,
    running: false,
    tasks: [],
    task: '',
  },
  ...props
}) => {
  let currentPathname = props.currentPathname
  const { runnable, running, tasks, task, log } = currentBuild

  return (
    <div className="container">
      <div className="bs-docs-section clearfix">
        <div className="row">
          <div className="col-lg-5 col-sm-5">
            <Path currentPathname={currentPathname} />
            <TaskSelect
              currentPathname={currentPathname}
              runnable={runnable}
              running={running}
              tasks={tasks}
              task={task}
              selectTask={props.selectTask}
            />
            <StartButton
              currentPathname={currentPathname}
              runnable={runnable}
              running={running}
              task={task}
              startBuild={props.startBuild}
            />
            <StopButton
              currentPathname={currentPathname}
              runnable={runnable}
              running={running}
              stopBuild={props.stopBuild}
            />
          </div>
          <div className="col-lg-7 col-sm-7">
            <ConsoleView log={log} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Container

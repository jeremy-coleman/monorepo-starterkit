import React from 'react'
import classNames from 'clsx'

export let StartButton = ({ runnable, running, task, startBuild, currentPathname, ...props }) => {
  let run = () => {
    startBuild(currentPathname, task)
  }

  const startButtonClassName = classNames('btn btn-default btn-info btn-block', {
    disabled: !task || !runnable || running,
  })

  return (
    <div className="bs-component">
      <a className={startButtonClassName} onClick={run}>
        <i className="fa fa-play"></i> START
      </a>
    </div>
  )
}

export default StartButton

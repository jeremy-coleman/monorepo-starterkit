import React from 'react'
import classNames from 'clsx'

export let StopButton = ({ stopBuild, currentPathname, runnable, running, ...props }) => {
  const _stopBuild = () => stopBuild(currentPathname)

  const stopButtonClassNames = classNames('btn btn-default btn-danger btn-block', { disabled: !runnable || !running })

  return (
    <div className="bs-component">
      <a className={stopButtonClassNames} onClick={_stopBuild}>
        <i className="fa fa-stop"></i> STOP
      </a>
    </div>
  )
}

export default StopButton

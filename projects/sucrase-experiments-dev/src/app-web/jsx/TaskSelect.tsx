import React from 'react'
import classNames from 'clsx'

// runnable: false,
// running: false,
// tasks: [],
// task: '',
// selectTask

export let TaskSelect = ({ selectTask, runnable, running, currentPathname, task, ...props }) => {
  const _selectTask = event => selectTask(currentPathname, event.target.value)
  const selectClassName = classNames('form-control', { disabled: !runnable || running })

  return (
    <div className="bs-component">
      <select className={selectClassName} value={task} onChange={_selectTask}>
        {props.tasks.map((task, index) => (
          <option key={index}>{task}</option>
        ))}
      </select>
    </div>
  )
}

export default TaskSelect

import React, { Component } from 'react'
import { useRef } from 'react'

export const AddBuild = ({ addBuild, ...props }) => {
  const buttonRef = useRef()
  const _addBuild = () => Promise.all([addBuild(), buttonRef.current.blur()])

  return (
    <div className="btn-group">
      <a href="#" className="btn btn-sm btn-primary" onClick={_addBuild} ref={buttonRef}>
        <i className="fa fa-plus"></i> ADD
      </a>
    </div>
  )
}

export default AddBuild

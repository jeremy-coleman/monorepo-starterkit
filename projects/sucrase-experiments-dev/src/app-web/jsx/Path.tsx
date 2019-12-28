import React from 'react'
export const Path = ({ currentPathname }) => {
  return (
    <div className="bs-component form-group">
      <label className="control-label" htmlFor="path">
        Path
      </label>
      <textarea className="form-control" rows={5} value={currentPathname} readOnly />
    </div>
  )
}

export default Path

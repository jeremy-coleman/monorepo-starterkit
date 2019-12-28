import React from 'react'
import { useRef, useEffect } from 'react'

export let ConsoleView = props => {
  const consoleRef = useRef()
  return <pre className="console" ref={consoleRef} dangerouslySetInnerHTML={{ __html: props.log }} />
}

export default ConsoleView

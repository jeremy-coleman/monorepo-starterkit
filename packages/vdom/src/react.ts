import * as React from 'react'
import * as ReactDOM from 'react-dom'

export class VDOM {
    constructor(dependencyArray = [React, ReactDOM]){
        dependencyArray.forEach(dep => Object.assign(this, dep))
    }
}
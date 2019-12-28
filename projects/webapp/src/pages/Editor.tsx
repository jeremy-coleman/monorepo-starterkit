import React from 'react'
import { styled } from '@material-ui/styles'

import { state } from '@state'

const Root = styled('div')({
  display: 'grid',
  gridTemplateColumns: 200,
  gridTemplateRows: '100px 100px',
  justifyContent: 'center',
  alignContent: 'center',
  width: '100%',
  height: '100%',
})

const Count = styled('div')({
  background: 'azure',
  display: 'grid',
  justifyContent: 'center',
  alignContent: 'center',
  gridColumn: '1 / 2',
  gridRow: '1 / 2',
})

const PastEvents = styled('div')({
  display: 'grid',
  gridColumn: '1 / 2',
  gridRow: '2 / 3',
})

const increment = e => {
  // push is just one operation that you can do on an array, full list for every data type at https://devdocs.io/javascript/
  state.pastCounters.push(state.count)
  state.count = e.clientY
}

export const Editor = () => {
  return (
    <Root>
      {/* onClick is just a one possible event on DOM, full list at https://reactjs.org/docs/events.html */}
      <Count onClick={increment}>{state.count} (click on me)</Count>
      <PastEvents>
        {state.pastCounters.map(count => (
          <span>{count}</span>
        ))}
      </PastEvents>
    </Root>
  )
}

export default Editor

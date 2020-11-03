import React from 'react'
import { styled } from '@material-ui/styles'


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

export function CounterButton(){
  const [count, useCount] = React.useState(0)

  const increment = e => {
    let next = count+1
    useCount(next)
  }

  return (
    <Root>
      <Count onClick={increment}>{count} (click on me)</Count>
      <PastEvents>
          <span>{count}</span>
      </PastEvents>
    </Root>
  )
}

export default CounterButton

import React from 'react'
import { styled } from '@material-ui/styles'

type Props = {
  color: 'green' | 'black'
}

let MyButton = styled('button')((props: Props) => ({
  backgroundColor: (props.color && props.color) || 'green',
}))

let NoPropsButton = styled('button')({
  backgroundColor: 'green',
})

export { MyButton, NoPropsButton }

// tslint:disable: prettier
//let Demo = props => <MyButton onClick={e => console.log('hi')} color={'black'} notaprop="qq" />

let Demo = props => <MyButton onClick={e => console.log('hi')} color={'black'} />
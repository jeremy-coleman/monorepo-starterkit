import React from 'react'
import { styled } from '@material-ui/styles'
import Button from '@material-ui/core/Button'
import { readableColor } from 'polished'

type Props = {
  color: 'green' | 'black'
}

let MyButton = styled(Button as any)((props: Props) => ({
  backgroundColor: (props.color && props.color) || 'green',
  color: readableColor(props.color),
}))

let NoPropsButton = styled(Button)({
  backgroundColor: 'green',
})

export { MyButton, NoPropsButton }

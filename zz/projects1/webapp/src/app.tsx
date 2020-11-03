//import { defaultTheme, Header } from 'coglite/common'
import { defaultTheme, Header } from '@coglite/common'
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core/styles'
import {ThemeProvider} from '@material-ui/core/styles'
import { styled, withTheme } from '@material-ui/styles'
import {state} from './state'
import { configure } from 'mobx'
import React from 'react'

import { MyButton } from './ButtonTest'

// Enable strict mode for MobX. This disallows state changes outside of an action
configure({ enforceActions: "observed" })

const theme = defaultTheme()

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

const styles = (theme: Theme) =>
  createStyles({
    '@global': {
      html: {
        height: '100%',
        boxSizing: 'border-box' as 'border-box',
      },
      '*, *:before, *:after': {
        boxSizing: 'inherit' as 'inherit',
      },
      body: {
        height: '100%',
        margin: 0,
        background: theme.palette.background.default,
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.fontSize,
        color: theme.palette.text.primary,

        // Helps fonts on OSX look more consistent with other systems
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',

        // Use momentum-based scrolling on iOS devices
        WebkitOverflowScrolling: 'touch' as 'touch',
      },
      '#coglite-app-root': {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
    },
    root: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
  })

// push is just one operation that you can do on an array, full list for every data type at https://devdocs.io/javascript/

const increment = e => {
  state.pastCounters.push(state.count)
  state.count = e.clientY
}

type Props = WithStyles<typeof styles> & {}

export const App = withStyles(styles)((props: Props) => {
  return (
    <ThemeProvider theme={theme}>
      <div className={props.classes.root}>
        <Header>Home</Header>
        <Root>
          <Count onClick={increment}>{state.count} (click on me)</Count>
          <PastEvents>
            {state.pastCounters.map(count => (
              <span>{count}</span>
            ))}
          </PastEvents>
          <MyButton onClick={e => console.log('hi')} color={'black'}>my button</MyButton>
        </Root>
      </div>
    </ThemeProvider>
  )
})

export default App

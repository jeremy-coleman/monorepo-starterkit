import { defaultTheme, Header } from '@coglite/common'
import { createStyles, Theme, ThemeProvider, WithStyles, withStyles } from '@material-ui/core/styles'
import { styled } from '@material-ui/styles'
import { configure } from 'mobx'
import React from 'react'
import { CounterButton, MyButton } from './ButtonTest'

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



type Props = WithStyles<typeof styles> & {}

export const App = withStyles(styles)((props: Props) => {
  return (
    <ThemeProvider theme={theme}>
      <div className={props.classes.root}>
        <Header>Home</Header>
        <Root>
          <CounterButton/>
          <MyButton onClick={e => console.log('hi')} color={'black'}>my button</MyButton>
        </Root>
      </div>
    </ThemeProvider>
  )
})

export default App

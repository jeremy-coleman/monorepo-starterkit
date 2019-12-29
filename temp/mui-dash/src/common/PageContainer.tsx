import React from 'react'

import { makeStyles, Theme } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'


interface PageContainerProps {
  children?: any
}

const PageContainer = ({ children }: PageContainerProps) => {
  const classes = useStyles()

  return (
    <Container maxWidth="lg" className={classes.container}>
      {children}
    </Container>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    flex: 1,
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
}))

export default PageContainer

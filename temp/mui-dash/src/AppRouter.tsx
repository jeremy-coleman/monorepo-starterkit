import React, { useEffect } from 'react'
import {
  HashRouter,
  BrowserRouter,
  Route,
  RouteProps,
  Redirect,
  Switch,
} from 'react-router-dom' //
import LinearProgress from '@material-ui/core/LinearProgress'

import config from './api/config'
import authService from 'api/authService'
import { useAppState, useAppStateMethods } from './state/appState'

import DashboardLayout from './layouts/DashboardLayout'

// Import application modules
import Sales from './pages/Sales/Sales'
import Content from './pages/Content'
import Administration from './pages/Administration'

// Import core modules
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import Organization from './pages/Organization'
import NotFound from './pages/NotFound'

// Theme demo module
import Demo from './pages/Demo'

const LoggedInRouter = () => {
  const { loading, error } = useAppState()
  const appStateMethods = useAppStateMethods()

  useEffect(() => {
    appStateMethods.request()
  }, [appStateMethods])

  if (loading) return <LinearProgress />
  if (error) return <p>Error :(</p>

  return (
    <Switch>
      <Route exact path="/" render={() => <Redirect to="/sales/dashboard" />} />
      <RouteWithLayout path={`/sales`} component={Sales} layout={DashboardLayout} />
      <RouteWithLayout path={`/content`} component={Content} layout={DashboardLayout} />
      <RouteWithLayout
        path={`/admin`}
        component={Administration}
        layout={DashboardLayout}
      />
      <RouteWithLayout path={`/profile`} component={Profile} layout={DashboardLayout} />
      <RouteWithLayout
        path={`/account`}
        component={Organization}
        layout={DashboardLayout}
      />
      <RouteWithLayout path={`/demo`} component={Demo} layout={DashboardLayout} />
      <RouteWithLayout component={NotFound} layout={DashboardLayout} />
    </Switch>
  )
}

// Use different router type depending on configuration
const AppRouterComponent: React.ComponentType<any> =
  config.navigationType === 'history' ? BrowserRouter : HashRouter

const AppRouter: React.FC = () => (
  <AppRouterComponent>
    <Switch>
      <Route path="/auth" component={Auth} />
      <RoutePrivate path="/" component={LoggedInRouter} />
    </Switch>
  </AppRouterComponent>
)

const RouteWithLayout = ({ component: Component, layout: Layout, ...rest }: any) => (
  <Route
    {...rest}
    render={props => {
      if (Layout) {
        return (
          <Layout>
            <Component {...props} />
          </Layout>
        )
      } else {
        return <Component {...props} />
      }
    }}
  />
)

// See https://reacttraining.com/react-router/web/example/auth-workflow
const RoutePrivate: React.FC<RouteProps> = ({
  component: Component,
  ...rest
}: RouteProps) => {
  if (!Component) {
    return <Route {...rest} />
  }

  return (
    <Route
      {...rest}
      render={props =>
        authService.isAuthenticated() ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/auth/login',
            }}
          />
        )
      }
    />
  )
}

export default AppRouter

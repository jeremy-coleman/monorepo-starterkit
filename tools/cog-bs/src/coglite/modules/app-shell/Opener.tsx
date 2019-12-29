import { IAppHost } from "coglite/types"
import { observer } from "mobx-react"
import * as React from "react"
import { AppLink, IAppHostProps } from "../host/views"
import { SampleHostAppView } from "./SampleHostAppView"

import './opener.css'

interface IOpenerAppState {
  openHosts: IAppHost[]
}

interface IAppHostDetailsProps {
  host: IAppHost
}

@observer
class AppHostDetails extends React.Component<IAppHostDetailsProps, any> {
  render() {
    return (
      <div>
        <div>Id: {this.props.host.id}</div>
        <div className="opener">Title: {this.props.host.title}</div>
      </div>
    )
  }
}

class OpenerApp extends React.Component<IAppHostProps, IOpenerAppState> {
  constructor(props: IAppHostProps) {
    super(props)
    this.state = { openHosts: [] }
  }
  UNSAFE_componentWillMount() {
    this.props.host.setTitle("Opener")
  }
  private _onHostOpened = (host: IAppHost) => {
    const openHosts = [host].concat(this.state.openHosts)
    this.setState({ openHosts: openHosts })
  }
  render() {
    return (
      <SampleHostAppView host={this.props.host}>
        <div style={{ padding: 8 }}>
          <AppLink host={this.props.host} request={{ path: "/samples/opener" }} open onHostOpened={this._onHostOpened}>
            Open Another Opener
          </AppLink>
        </div>
        <div>
          {this.state.openHosts.map((h) => {
            return <AppHostDetails key={h.id} host={h} />
          })}
        </div>
      </SampleHostAppView>
    )
  }
}

export { OpenerApp }

import { IAppProps } from "coglite/types"
import * as React from "react"

class Help extends React.Component<any, any> {
  render() {
    return (
      <div>
        <div className="default-help">
          <p>
            <strong>Coglite</strong> provides a customisable workspace featuring a range of apps that can be added or removed according to
            your needs.
          </p>
        </div>
      </div>
    )
  }
}

class HelpApp extends React.Component<IAppProps, any> {
  UNSAFE_componentWillMount() {
    this.props.match.host.setTitle("Coglite help")
  }
  render() {
    return <Help />
  }
}

export { HelpApp, Help }
export default HelpApp

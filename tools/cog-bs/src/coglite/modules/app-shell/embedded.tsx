import { IAppHost, IAppProps, IUserProfile } from "coglite/types"
import * as React from "react"
import { ScriptFrame } from "../host/views/ScriptFrame"

class EmbeddedApp extends React.Component<IAppProps, any> {
  get host(): IAppHost {
    return this.props.match.host
  }
  get userProfile(): IUserProfile {
    return this.props.match.userProfile
  }
  render() {
    return (
      <ScriptFrame
        host={this.host}
        //src="http://localhost:8081/analystdesktop/entity/app.js"
        src="http://localhost:1234/"
        //config={Object.assign({}, AppConfig, { userProfile: this.userProfile })}
      />
    )
  }
}

export { EmbeddedApp, EmbeddedApp as default }

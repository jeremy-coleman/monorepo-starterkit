import { ErrorView } from "coglite/shared/components/common/ErrorView"
import { IAppFrame, IAppHostBaseProps, IAppLauncher, IRequest, IUserProfile } from "coglite/types"
import { PathUtils } from "coglite/shared/util"
import * as React from "react"
import { AppFrame } from "./AppFrame"

export interface IScriptFrameProps extends IAppHostBaseProps {
  src: string
  config?: any
  userProfile?: IUserProfile
  defaultRequest?: IRequest
  launcher?: IAppLauncher
}

interface IScriptFrameState {
  error?: any
}

export class ScriptFrame extends React.Component<IScriptFrameProps, IScriptFrameState> {
  private _appFrameRef: IAppFrame
  private _frameWindow: Window
  private _frameDoc: Document
  constructor(props: IScriptFrameProps) {
    super(props)
    this.state = {}
  }
  private _onAppFrameRef = (appFrameRef: IAppFrame) => {
    this._appFrameRef = appFrameRef
  }
  private _onWidgetScriptError = (ev: Event) => {
    this.setState({
      error: {
        message: `Error loading script at ${(ev.target as any).src}`
      }
    })
  }
  private _copyPropsToAppConfig(widgetAppConfig: any) {
    // modify our widget app config with local host/environment stuff
    widgetAppConfig.parent = {
      host: this.props.host,
      config: this.props.config
    }
    const baseUrl = PathUtils.trimSeparatorFromEnd(PathUtils.parent(this.props.src)) + PathUtils.sep
    widgetAppConfig.baseUrl = baseUrl
    widgetAppConfig.publicPath = baseUrl
    widgetAppConfig.userProfile = this.props.userProfile
    widgetAppConfig.defaultRequest = this.props.defaultRequest
    widgetAppConfig.launcher = this.props.launcher
    // TODO: fill in any dependencies - this will be a dependencies
    // object with key to null/undefined
  }
  private _loadScript() {
    const widgetScriptEl = this._frameDoc.createElement("script")
    widgetScriptEl.addEventListener("error", this._onWidgetScriptError)
    widgetScriptEl.src = this.props.src
    this._frameDoc.body.appendChild(widgetScriptEl)
  }
  private _onAppConfigError = (ev: Event) => {
    // we set an app config
    const widgetAppConfig = {}
    this._frameWindow["AppConfig"] = widgetAppConfig
    this._copyPropsToAppConfig(widgetAppConfig)
    this._loadScript()
  }
  private _onAppConfigLoaded = () => {
    let widgetAppConfig = this._frameWindow["AppConfig"]
    if (!widgetAppConfig) {
      widgetAppConfig = {}
      this._frameWindow["AppConfig"] = widgetAppConfig
    }
    this._copyPropsToAppConfig(widgetAppConfig)
    this._loadScript()
  }
  componentDidMount() {
    const frame = this._appFrameRef.frameRef
    const frameWindow = frame.contentWindow
    this._frameWindow = frameWindow
    const frameDoc = frame.contentDocument
    this._frameDoc = frameDoc
    const appConfigScriptUrl = PathUtils.trimSeparatorFromEnd(PathUtils.parent(this.props.src)) + PathUtils.sep + "AppConfig.js"
    const appConfigScriptEl = frameDoc.createElement("script")
    appConfigScriptEl.addEventListener("load", this._onAppConfigLoaded)
    appConfigScriptEl.addEventListener("error", this._onAppConfigError)
    appConfigScriptEl.src = appConfigScriptUrl
    frameDoc.body.appendChild(appConfigScriptEl)
  }
  render() {
    if (this.state.error) {
      return <ErrorView error={this.state.error} />
    }
    return (
      <AppFrame
        host={this.props.host}
        //componentRef={this._onAppFrameRef}
      />
    )
  }
}

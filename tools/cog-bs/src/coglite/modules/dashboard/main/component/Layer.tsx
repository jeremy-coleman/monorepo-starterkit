import {css,memoizeFunction, mergeStyleSets } from "@uifabric/styleguide"
import { ITheme, ZIndexes } from "@uifabric/styleguide"
import {  getDocument,  setPortalAttribute, setVirtualParent } from "@uifabric/styleguide"
import { action, computed, observable } from "mobx"
import { observer } from "mobx-react"
import * as React from "react"
import * as ReactDOM from "react-dom"

//-----------------------------------global helpers -----------------------------//

export class LayerStore {
  //@observable
  _layersByHostId = observable.map<string, React.ComponentType<any>>()

  @observable
  _defaultHostSelector: string | undefined

  @action.bound
  registerLayer(hostId: string, layerRef) {
    this._layersByHostId.set(hostId, layerRef)
  }

  @action.bound
  unregisterLayer(hostId: string) {
    this._layersByHostId.delete(hostId)
  }

  @action.bound
  setDefaultTarget(selector?: string) {
    this._defaultHostSelector = selector
  }

  @computed
  get defaultTarget() {
    return this._defaultHostSelector
  }

  @action.bound
  getHost(hostId) {
    const doc = getDocument()
    if (!doc) {
      return undefined
    }

    if (this._layersByHostId.has(hostId)) {
      return doc.getElementById(hostId) as Node
    } else {
      const defaultHostSelector = this.defaultTarget
      return defaultHostSelector ? (doc.querySelector(defaultHostSelector) as Node) : doc.body
    }
  }
}

const layerStore = new LayerStore()
//-----------------------------------global helpers -----------------------------//

//-----------------------------------Layer types -----------------------------//
export interface ILayerHost {}

export interface ILayerHostProps extends React.HTMLAttributes<HTMLElement> {
  componentRef?: React.RefObject<ILayerHost>
  id?: string
}

export interface ILayer {}

export interface ILayerProps extends React.HTMLAttributes<HTMLDivElement | Layer> {
  componentRef?: React.RefObject<ILayer>
  styles?: any //IStyleFunctionOrObject<ILayerStyleProps, ILayerStyles>;
  theme?: ITheme
  className?: string
  onLayerMounted?: () => void
  onLayerDidMount?: () => void
  onLayerWillUnmount?: () => void
  hostId?: string
  eventBubblingEnabled?: boolean
  insertFirst?: boolean
}

export interface ILayerStyleProps {
  theme?: ITheme
  className?: string
  isNotHost?: boolean
}

//type ILayerStyles = ReturnType<typeof useLayerStyles>

export type ILayerBaseState = {
  hasMounted: boolean
}

//----------------------------------- Layer component styles-----------------------------//

export const LayerStylesheet = mergeStyleSets({
  root: ["cog-Layer"],
  rootNotHost: [
    "cog-Layer",
    "not-host",
    [
      "cog-Layer--fixed",
      {
        position: "fixed",
        zIndex: ZIndexes.Layer,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        visibility: "hidden"
      }
    ]
  ],
  content: ["cog-Layer-content", { visibility: "visible" }]
})

const mapPropsToRootStyles = memoizeFunction((props: ILayerStyleProps) => {
  return (props.isNotHost && LayerStylesheet.rootNotHost) || LayerStylesheet.root
})

export class Layer extends React.Component<ILayerProps, ILayerBaseState> {
  public static defaultProps: ILayerProps = {
    onLayerDidMount: () => undefined,
    onLayerWillUnmount: () => undefined
  }
  private _host: Node
  private _layerElement: HTMLElement | undefined
  private _rootElement = React.createRef<HTMLDivElement>()

  constructor(props: ILayerProps) {
    super(props)
    this.state = {
      hasMounted: false
    }

    if (this.props.hostId) {
      layerStore.registerLayer(this.props.hostId, this)
    }
  }

  public componentWillMount() {
    this._layerElement = this._getLayerElement()
  }

  public componentWillUpdate() {
    if (!this._layerElement) {
      this._layerElement = this._getLayerElement()
    }
  }

  public componentDidMount() {
    this.setState({ hasMounted: true })
    this._setVirtualParent()
    if (this.props.onLayerMounted) {
      this.props.onLayerMounted()
    }
    if (this.props.onLayerDidMount) {
      this.props.onLayerDidMount()
    }
  }

  public componentWillUnmount(): void {
    this._removeLayerElement()
    if (this.props.onLayerWillUnmount) {
      this.props.onLayerWillUnmount()
    }
    if (this.props.hostId) {
      layerStore.unregisterLayer(this.props.hostId)
    }
  }

  public componentDidUpdate(): void {
    this._setVirtualParent()
  }

  //_renderLayerComponent = () =>  (<div className={LayerStylesheet.content}>{this.props.children}</div>)

  public render(): React.ReactNode {
    const { hasMounted } = this.state
    return (
      <span className="cog-layer" ref={this._handleRootElementRef}>
        {this._layerElement &&
          hasMounted &&
          ReactDOM.createPortal(<div className={LayerStylesheet.content}>{this.props.children}</div>, this._layerElement)}
      </span>
    )
  }

  private _handleRootElementRef = () => {
    if (this._rootElement.current) {
      this._setVirtualParent()
    }
  }

  private _setVirtualParent = () => {
    if (this._rootElement && this._rootElement.current && this._layerElement) {
      setVirtualParent(this._layerElement, this._rootElement.current)
    }
  }

  private _getLayerElement = () => {
    const host = layerStore.getHost(this.props.hostId)
    if (host !== this._host) {
      this._removeLayerElement()
    }

    if (host) {
      this._host = host

      if (!this._layerElement) {
        const doc = getDocument()
        if (!doc) {
          return
        }

        this._layerElement = doc.createElement("div")
        this._layerElement.className = mapPropsToRootStyles(this.props)
        //this.classNames.root!;
        setPortalAttribute(this._layerElement)

        this.props.insertFirst ? host.insertBefore(this._layerElement, host.firstChild) : host.appendChild(this._layerElement)
      }
    }

    return this._layerElement
  }

  private _removeLayerElement = () => {
    if (this._layerElement) {
      this.props.onLayerWillUnmount!()

      if (this._layerElement.parentNode) {
        this._layerElement.parentNode.removeChild(this._layerElement)
      }
      this._layerElement = undefined
    }
  }
}

//-----------------------------------React Layer Host component-----------------------------//

export const LayerHost = observer((props: ILayerHostProps) => {
  return <div {...props} className={css("cog-LayerHost", props.className)} />
})

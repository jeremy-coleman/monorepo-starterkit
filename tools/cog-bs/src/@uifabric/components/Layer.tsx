import { classNamesFunction, css, getDocument, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { getGlobalClassNames, ITheme, ZIndexes } from "@uifabric/styleguide"
import { IRefObject, setPortalAttribute, setVirtualParent, warnDeprecations } from "@uifabric/styleguide"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { Fabric } from "./Fabric"

const _layersByHostId: { [hostId: string]: React.Component[] } = {}

let _defaultHostSelector: string | undefined

/**
 * Register a layer for a given host id
 * @param hostId Id of the layer host
 * @param layer Layer instance
 */
export function registerLayer(hostId: string, layer: React.Component) {
  if (!_layersByHostId[hostId]) {
    _layersByHostId[hostId] = []
  }

  _layersByHostId[hostId].push(layer)
}

/**
 * Unregister a layer for a given host id
 * @param hostId Id of the layer host
 * @param layer Layer instance
 */
export function unregisterLayer(hostId: string, layer: React.Component) {
  if (_layersByHostId[hostId]) {
    const idx = _layersByHostId[hostId].indexOf(layer)
    if (idx >= 0) {
      _layersByHostId[hostId].splice(idx, 1)
      if (_layersByHostId[hostId].length === 0) {
        delete _layersByHostId[hostId]
      }
    }
  }
}

/**
 * Used for notifying applicable Layers that a host is available/unavailable and to re-evaluate Layers that
 * care about the specific host.
 */
export function notifyHostChanged(id: string) {
  if (_layersByHostId[id]) {
    _layersByHostId[id].forEach((layer) => layer.forceUpdate())
  }
}

/**
 * Sets the default target selector to use when determining the host in which
 * Layered content will be injected into. If not provided, an element will be
 * created at the end of the document body.
 *
 * Passing in a falsey value will clear the default target and reset back to
 * using a created element at the end of document body.
 */
export function setDefaultTarget(selector?: string) {
  _defaultHostSelector = selector
}

/**
 * Get the default target selector when determining a host
 */
export function getDefaultTarget(): string | undefined {
  return _defaultHostSelector
}

const GlobalClassNames = {
  root: "ms-Layer",
  rootNoHost: "ms-Layer--fixed",
  content: "ms-Layer-content"
}

export const getLayerStyles = (props: ILayerStyleProps): ILayerStyles => {
  const { className, isNotHost, theme } = props
  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  return {
    root: [
      classNames.root,
      theme.fonts.small,
      isNotHost && [
        classNames.rootNoHost,
        {
          position: "fixed",
          zIndex: ZIndexes.Layer,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          visibility: "hidden"
        }
      ],
      className
    ],
    content: [
      classNames.content,
      {
        visibility: "visible"
      }
    ]
  }
}

export type ILayerBaseState = {
  hasMounted: boolean
}

// //@customizable('Layer', ['theme', 'hostId'])
// export class LayerBase1 extends React.Component<ILayerProps, ILayerBaseState> {
//   public static defaultProps: ILayerProps = {
//     onLayerDidMount: () => undefined,
//     onLayerWillUnmount: () => undefined
//   };

//   private _host: Node;
//   private _layerElement: HTMLElement | undefined;
//  // private _rootElement = React.createRef<HTMLDivElement>();
//   private _rootElement: HTMLSpanElement | undefined;

//   constructor(props: ILayerProps) {
//     super(props);

//     this.state = {
//       hasMounted: false
//     };

//     if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
//       warnDeprecations('Layer', props, {
//         onLayerMounted: 'onLayerDidMount'
//       });
//     }

//     if (this.props.hostId) {
//       registerLayer(this.props.hostId, this);
//     }
//   }

//   public componentWillMount(): void {
//     this._layerElement = this._getLayerElement();
//   }

//   public componentWillUpdate(): void {
//     if (!this._layerElement) {
//       this._layerElement = this._getLayerElement();
//     }
//   }

//   public componentDidMount(): void {
//     // We can safely set state immediately because the ref wrapper will make sure the virtual
//     //    parent has been set before componentDidMount is called.
//     this.setState({ hasMounted: true });

//     this._setVirtualParent();

//     const { onLayerDidMount, onLayerMounted } = this.props;
//     if (onLayerMounted) {
//       onLayerMounted();
//     }

//     if (onLayerDidMount) {
//       onLayerDidMount();
//     }
//   }

//   public componentWillUnmount(): void {
//     this._removeLayerElement();

//     const { onLayerWillUnmount, hostId } = this.props;
//     if (onLayerWillUnmount) {
//       onLayerWillUnmount();
//     }

//     if (hostId) {
//       unregisterLayer(hostId, this);
//     }
//   }

//   public componentDidUpdate(): void {
//     this._setVirtualParent();
//   }

//   public render(): React.ReactNode {
//     const classNames = this._getClassNames();
//     const { eventBubblingEnabled } = this.props;
//     const { hasMounted } = this.state;

//     return (
//       <span className="ms-layer" ref={this._handleRootElementRef}>
//         {this._layerElement &&
//           hasMounted &&
//           ReactDOM.createPortal(
//             eventBubblingEnabled ? (
//               <Fabric className={classNames.content}>{this.props.children}</Fabric>
//             ) : (
//               <Fabric
//                 className={classNames.content}
//                 onClick={this._filterEvent}
//                 onContextMenu={this._filterEvent}
//                 onDoubleClick={this._filterEvent}
//                 onDrag={this._filterEvent}
//                 onDragEnd={this._filterEvent}
//                 onDragEnter={this._filterEvent}
//                 onDragExit={this._filterEvent}
//                 onDragLeave={this._filterEvent}
//                 onDragOver={this._filterEvent}
//                 onDragStart={this._filterEvent}
//                 onDrop={this._filterEvent}
//                 onMouseDown={this._filterEvent}
//                 onMouseEnter={this._filterEvent}
//                 onMouseLeave={this._filterEvent}
//                 onMouseMove={this._filterEvent}
//                 onMouseOver={this._filterEvent}
//                 onMouseOut={this._filterEvent}
//                 onMouseUp={this._filterEvent}
//                 onKeyDown={this._filterEvent}
//                 onKeyPress={this._filterEvent}
//                 onKeyUp={this._filterEvent}
//                 onFocus={this._filterEvent}
//                 onBlur={this._filterEvent}
//                 onChange={this._filterEvent}
//                 onInput={this._filterEvent}
//                 onInvalid={this._filterEvent}
//                 onSubmit={this._filterEvent}
//               >
//                 {this.props.children}
//               </Fabric>
//             ),
//             this._layerElement
//           )}
//       </span>
//     );
//   }

//   // /**
//   //  * rootElement wrapper for setting virtual parent as soon as root element ref is available.
//   //  */
//   // private _handleRootElementRef = (ref: HTMLDivElement): void => {
//   //   this._rootElement(ref);
//   //   if (ref) {
//   //     // TODO: Calling _setVirtualParent in this ref wrapper SHOULD allow us to remove
//   //     //    other calls to _setVirtualParent throughout this class. However,
//   //     //    as this is an immediate fix for a P0 issue the existing _setVirtualParent
//   //     //    calls are left for now to minimize potential regression.
//   //     this._setVirtualParent();
//   //   }
//   // };

//   /**
//    * rootElement wrapper for setting virtual parent as soon as root element ref is available.
//    */
//   private _handleRootElementRef = (ref: HTMLSpanElement): void => {
//     this._rootElement = ref;
//     if (ref) {
//       // TODO: Calling _setVirtualParent in this ref wrapper SHOULD allow us to remove
//       //    other calls to _setVirtualParent throughout this class. However,
//       //    as this is an immediate fix for a P0 issue the existing _setVirtualParent
//       //    calls are left for now to minimize potential regression.
//       this._setVirtualParent();
//     }
//   };

//   /**
//    * Helper to stop events from bubbling up out of Layer.
//    */
//   private _filterEvent = (ev: React.SyntheticEvent<HTMLElement>): void => {
//     // We should just be able to check ev.bubble here and only stop events that are bubbling up. However, even though mouseenter and
//     //    mouseleave do NOT bubble up, they are showing up as bubbling. Therefore we stop events based on event name rather than ev.bubble.
//     if (ev.eventPhase === Event.BUBBLING_PHASE && ev.type !== 'mouseenter' && ev.type !== 'mouseleave') {
//       ev.stopPropagation();
//     }
//   };

//   private _getClassNames() {
//     const { className, styles, theme } = this.props;
//     const classNames = getLayerClassNames(styles!, {
//       theme: theme!,
//       className,
//       isNotHost: !this.props.hostId
//     });

//     return classNames;
//   }

//   private _setVirtualParent() {
//     if (this._rootElement && this._rootElement.current && this._layerElement) {
//       setVirtualParent(this._layerElement, this._rootElement.current);
//     }
//   }

//   private _getLayerElement(): HTMLElement | undefined {
//     const host = this._getHost();

//     const classNames = this._getClassNames();

//     if (host !== this._host) {
//       this._removeLayerElement();
//     }

//     if (host) {
//       this._host = host;

//       if (!this._layerElement) {
//         const doc = getDocument();
//         if (!doc) {
//           return;
//         }

//         this._layerElement = doc.createElement('div');
//         this._layerElement.className = classNames.root!;
//         setPortalAttribute(this._layerElement);

//         this.props.insertFirst ? host.insertBefore(this._layerElement, host.firstChild) : host.appendChild(this._layerElement);
//       }
//     }

//     return this._layerElement;
//   }

//   private _removeLayerElement(): void {
//     if (this._layerElement) {
//       this.props.onLayerWillUnmount!();

//       const parentNode = this._layerElement.parentNode;
//       if (parentNode) {
//         parentNode.removeChild(this._layerElement);
//       }
//       this._layerElement = undefined;
//     }
//   }

//   private _getHost(): Node | undefined {
//     const { hostId } = this.props;

//     const doc = getDocument();
//     if (!doc) {
//       return undefined;
//     }

//     if (hostId) {
//       return doc.getElementById(hostId) as Node;
//     } else {
//       const defaultHostSelector = getDefaultTarget();
//       return defaultHostSelector ? (doc.querySelector(defaultHostSelector) as Node) : doc.body;
//     }
//   }
// }


export class LayerBase extends React.Component<ILayerProps, ILayerBaseState> {
  public static defaultProps: ILayerProps = {
    onLayerDidMount: () => undefined,
    onLayerWillUnmount: () => undefined
  }

  private _host: Node
  private _layerElement: HTMLElement | undefined
  private _rootElement: HTMLSpanElement | undefined

  constructor(props: ILayerProps) {
    super(props)

    this.state = {
      hasMounted: false
    }

    if (process.env.NODE_ENV !== "production") {
      warnDeprecations("Layer", props, {
        onLayerMounted: "onLayerDidMount"
      })
    }

    if (this.props.hostId) {
      registerLayer(this.props.hostId, this)
    }
  }

  public UNSAFE_componentWillMount(): void {
    this._layerElement = this._getLayerElement()
  }

  public UNSAFE_componentWillUpdate(): void {
    if (!this._layerElement) {
      this._layerElement = this._getLayerElement()
    }
  }

  public componentDidMount(): void {
    // We can safely set state immediately because the ref wrapper will make sure the virtual
    //    parent has been set before componentDidMount is called.
    this.setState({ hasMounted: true })

    this._setVirtualParent()

    const { onLayerDidMount, onLayerMounted } = this.props
    if (onLayerMounted) {
      onLayerMounted()
    }

    if (onLayerDidMount) {
      onLayerDidMount()
    }
  }

  public componentWillUnmount(): void {
    this._removeLayerElement()

    const { onLayerWillUnmount, hostId } = this.props
    if (onLayerWillUnmount) {
      onLayerWillUnmount()
    }

    if (hostId) {
      unregisterLayer(hostId, this)
    }
  }

  public componentDidUpdate(): void {
    this._setVirtualParent()
  }

  public render(): React.ReactNode {
    const classNames = this._getClassNames()
    const { eventBubblingEnabled } = this.props
    const { hasMounted } = this.state

    return (
      <span className="ms-layer" ref={this._handleRootElementRef}>
        {this._layerElement &&
          hasMounted &&
          ReactDOM.createPortal(
            eventBubblingEnabled ? (
              <Fabric className={classNames.content}>{this.props.children}</Fabric>
            ) : (
              <Fabric
                className={classNames.content}
                onClick={this._filterEvent}
                onContextMenu={this._filterEvent}
                onDoubleClick={this._filterEvent}
                onDrag={this._filterEvent}
                onDragEnd={this._filterEvent}
                onDragEnter={this._filterEvent}
                onDragExit={this._filterEvent}
                onDragLeave={this._filterEvent}
                onDragOver={this._filterEvent}
                onDragStart={this._filterEvent}
                onDrop={this._filterEvent}
                onMouseDown={this._filterEvent}
                onMouseEnter={this._filterEvent}
                onMouseLeave={this._filterEvent}
                onMouseMove={this._filterEvent}
                onMouseOver={this._filterEvent}
                onMouseOut={this._filterEvent}
                onMouseUp={this._filterEvent}
                onKeyDown={this._filterEvent}
                onKeyPress={this._filterEvent}
                onKeyUp={this._filterEvent}
                onFocus={this._filterEvent}
                onBlur={this._filterEvent}
                onChange={this._filterEvent}
                onInput={this._filterEvent}
                onInvalid={this._filterEvent}
                onSubmit={this._filterEvent}
              >
                {this.props.children}
              </Fabric>
            ),
            this._layerElement
          )}
      </span>
    )
  }

  /**
   * rootElement wrapper for setting virtual parent as soon as root element ref is available.
   */
  private _handleRootElementRef = (ref: HTMLSpanElement): void => {
    this._rootElement = ref
    if (ref) {
      // TODO: Calling _setVirtualParent in this ref wrapper SHOULD allow us to remove
      //    other calls to _setVirtualParent throughout this class. However,
      //    as this is an immediate fix for a P0 issue the existing _setVirtualParent
      //    calls are left for now to minimize potential regression.
      this._setVirtualParent()
    }
  }

  /**
   * Helper to stop events from bubbling up out of Layer.
   */
  private _filterEvent = (ev: React.SyntheticEvent<HTMLElement>): void => {
    // We should just be able to check ev.bubble here and only stop events that are bubbling up. However, even though mouseenter and
    //    mouseleave do NOT bubble up, they are showing up as bubbling. Therefore we stop events based on event name rather than ev.bubble.
    if (ev.eventPhase === Event.BUBBLING_PHASE && ev.type !== "mouseenter" && ev.type !== "mouseleave") {
      ev.stopPropagation()
    }
  }

  private _getClassNames() {
    const { className, styles, theme } = this.props
    const classNames = classNamesFunction<ILayerStyleProps, ILayerStyles>()(styles!, {
      theme: theme!,
      className,
      isNotHost: !this.props.hostId
    })

    return classNames
  }

  private _setVirtualParent() {
    if (this._rootElement && this._layerElement) {
      setVirtualParent(this._layerElement, this._rootElement)
    }
  }

  private _getLayerElement(): HTMLElement | undefined {
    const host = this._getHost()

    const classNames = this._getClassNames()

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
        this._layerElement.className = classNames.root!
        setPortalAttribute(this._layerElement)

        this.props.insertFirst ? host.insertBefore(this._layerElement, host.firstChild) : host.appendChild(this._layerElement)
      }
    }

    return this._layerElement
  }

  private _removeLayerElement(): void {
    if (this._layerElement) {
      this.props.onLayerWillUnmount!()

      const parentNode = this._layerElement.parentNode
      if (parentNode) {
        parentNode.removeChild(this._layerElement)
      }
      this._layerElement = undefined
    }
  }

  private _getHost(): Node | undefined {
    const { hostId } = this.props

    const doc = getDocument()
    if (!doc) {
      return undefined
    }

    if (hostId) {
      return doc.getElementById(hostId) as Node
    } else {
      const defaultHostSelector = getDefaultTarget()
      return defaultHostSelector ? (doc.querySelector(defaultHostSelector) as Node) : doc.body
    }
  }
}

export const Layer: React.FunctionComponent<ILayerProps> = styled<ILayerProps, ILayerStyleProps, ILayerStyles>(
  LayerBase,
  getLayerStyles,
  undefined,
  {
    scope: "Layer",
    fields: ["hostId", "theme", "styles"]
  }
)

export class LayerHost1 extends React.Component<ILayerHostProps> {
  public shouldComponentUpdate() {
    return false
  }

  public componentDidMount(): void {
    notifyHostChanged(this.props.id!)
  }

  public componentWillUnmount(): void {
    notifyHostChanged(this.props.id!)
  }

  public render(): JSX.Element {
    return <div {...this.props} className={css("ms-LayerHost", this.props.className)} />
  }
}

export const LayerHost = (props: ILayerHostProps) => {
  React.useEffect(() => {
    notifyHostChanged(props.id!)
    return () => notifyHostChanged(props.id!)
  })
  return <div {...props} className={css("ms-LayerHost", props.className)} />
}

export interface ILayerHost {}

export interface ILayerHostProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Optional callback to access the ILayerHost interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<ILayerHost>

  /**
   * Defines the id for the layer host that Layers can target (using the hostId property.)
   */
  id?: string
}

/**
 * {@docCategory Layer}
 */
export interface ILayer {}

/**
 * {@docCategory Layer}
 */
export interface ILayerProps extends React.HTMLAttributes<HTMLDivElement | LayerBase> {
  /**
   * Optional callback to access the ILayer interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<ILayer>

  /**
   * Call to provide customized styling that will layer on top of the variant rules
   */
  styles?: IStyleFunctionOrObject<ILayerStyleProps, ILayerStyles>

  /**
   * Theme provided by HOC.
   */
  theme?: ITheme

  /**
   * Additional css class to apply to the Layer
   * @defaultvalue undefined
   */
  className?: string

  /** Callback for when the layer is mounted. */
  onLayerMounted?: () => void

  /**
   * Callback for when the layer is mounted.
   */
  onLayerDidMount?: () => void

  /**
   * Callback for when the layer is unmounted.
   */
  onLayerWillUnmount?: () => void

  /**
   * The optional id property provided on a LayerHost that this Layer should render within. The LayerHost does
   * not need to be immediately available but once has been rendered, and if missing, we'll avoid trying
   * to render the Layer content until the host is available. If an id is not provided, we will render the Layer
   * content in a fixed position element rendered at the end of the document.
   */
  hostId?: string

  /**
   * When enabled, Layer allows events to bubble up from Layer content.
   * Traditionally Layer has not had this behavior. This prop preserves backwards compatibility by
   * default while allowing users to opt in to the new event bubbling functionality.
   */
  eventBubblingEnabled?: boolean

  /**
   * Whether the layer should be added as the first child of the host.
   * If true, the layer will be inserted as the first child of the host
   * By default, the layer will be appended at the end to the host
   */
  insertFirst?: boolean
}

/**
 * {@docCategory Layer}
 */
export interface ILayerStyleProps {
  /**
   * Accept theme prop.
   */
  theme: ITheme

  /**
   * Accept custom classNames
   */
  className?: string

  /**
   * Check if Host
   */
  isNotHost?: boolean
}

/**
 * {@docCategory Layer}
 */
export interface ILayerStyles {
  /**
   * Style for the root element when fixed.
   */
  root?: IStyle
  /**
   * Style for the Fabric component.
   */
  content?: IStyle
}

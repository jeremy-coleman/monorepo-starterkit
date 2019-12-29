import { mergeStyleSets, css } from "@uifabric/styleguide"

//import {DefaultPalette as theme} from '@uifabric/styleguide'

import { observer } from "mobx-react"
import { Icon } from "@uifabric/components"
import * as React from "react"
import { WindowResizeType } from "../constants"
import { IWindow } from "../types"
import { ComponentGlobals } from "../ComponentGlobals"
import { theme } from "coglite/shared/theme"
import { HostAppIcon, AppHostContainer } from "coglite/modules/host/views"


const dispatchWindowResizeImmediate = () => {
  ComponentGlobals.ignoreResize = true
  try {
    var event = document.createEvent("Event")
    event.initEvent("resize", true, true)
    window.dispatchEvent(event)
  } finally {
    ComponentGlobals.ignoreResize = false
  }
}

const dispatchWindowResize1 = () => {
  // may need to debounce this in the future
  dispatchWindowResizeImmediate()
}

//export { dispatchWindowResize }

const windowStyles = mergeStyleSets({
  root: {
    backgroundColor: theme.palette.white,
    borderColor: theme.palette.neutralSecondary,
    borderStyle: "solid",
    selectors: {
      "&.content-hidden": {
        height: 28
      },
      "&.animate-position": {
        transition: "top 0.2s ease, right 0.2s ease, bottom 0.2s ease, left 0.2s ease, width 0.2s ease, height 0.2s ease"
      },
      "&.manager-type-grid": {
        boxShadow: `0 0 ${5}px 0 rgba(0, 0, 0, 0.4)`
      }
    }
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    cursor: "pointer",
    overflow: "hidden",
    backgroundColor: theme.palette.neutralSecondary,
    color: theme.palette.white
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    height: 20,
    maxHeight: 20,
    maxWidth: 20,
    overflow: "hidden",
    marginLeft: 4
  },
  titleContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    overflow: "hidden",
    paddingLeft: 8,
    paddingRight: 8
  },
  title: {
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    fontSize: "12px"
  },
  action: {
    color: theme.palette.white,
    height: 28,
    width: 28,
    lineHeight: 28,
    cursor: "pointer",
    padding: "0px",
    outline: "none",
    border: "none",
    background: "transparent",
    selectors: {
      ":hover": {
        color: theme.palette.white,
        backgroundColor: theme.palette.neutralTertiary
      },
      "&.close-action": {
        selectors: {
          ":hover": {
            color: theme.palette.white,
            backgroundColor: theme.palette.redDark
          }
        }
      },
      "& .window-action-icon": {
        lineHeight: "16px",
        fontSize: "12px", //FontSizes.mini,
        fontWeight: 400, //FontWeights.regular,
        margin: "0px",
        height: "16px",
        width: "16px"
      }
    }
  },
  actionBar: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  body: {
    position: "absolute",
    left: 0,
    bottom: 0,
    right: 0,
    overflow: "auto",
    backgroundColor: theme.palette.white,
    selectors: {
      "&.content-hidden": {
        height: 0,
        overflow: "hidden"
      }
    }
  },
  resize: {
    selectors: {
      "&.top": {
        position: "absolute",
        zIndex: 2,
        top: -2,
        height: 5,
        left: 0,
        right: 0,
        cursor: "n-resize"
      },
      "&.right": {
        position: "absolute",
        zIndex: 2,
        right: -2,
        width: 5,
        top: 0,
        bottom: 0,
        cursor: "e-resize"
      },
      "&.bottom": {
        position: "absolute",
        zIndex: 2,
        bottom: -2,
        height: 5,
        left: 0,
        right: 0,
        cursor: "s-resize"
      },
      "&.left": {
        position: "absolute",
        zIndex: 2,
        left: -2,
        width: 5,
        top: 0,
        bottom: 0,
        cursor: "w-resize"
      },
      "&.topLeft": {
        position: "absolute",
        zIndex: 3,
        left: -4,
        top: -4,
        width: 10,
        height: 10,
        cursor: "nw-resize"
      },
      "&.topRight": {
        position: "absolute",
        zIndex: 3,
        right: -4,
        top: -4,
        width: 10,
        height: 10,
        cursor: "ne-resize"
      },
      "&.bottomLeft": {
        position: "absolute",
        zIndex: 3,
        left: -4,
        bottom: -4,
        width: 10,
        height: 10,
        cursor: "sw-resize"
      },
      "&.bottomRight": {
        position: "absolute",
        zIndex: 3,
        right: -4,
        bottom: -4,
        width: 10,
        height: 10,
        cursor: "se-resize"
      }
    }
  }
})

interface IWindowProps {
  window: IWindow
  className?: string
}

@observer
class WindowCloseAction extends React.Component<IWindowProps, any> {
  private _onMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
  }
  private _onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    this.props.window.close()
  }
  render() {
    if (this.props.window && !this.props.window.closeDisabled) {
      return (
        <button
          type="button"
          className={css(this.props.className, "close-action")}
          title={`Close ${this.props.window.title || "App"}`}
          onClick={this._onClick}
          onMouseDown={this._onMouseDown}
        >
          <Icon className="window-action-icon" iconName="ChromeClose" />
        </button>
      )
    }
    return null
  }
}

@observer
class WindowMaximizeAction extends React.Component<IWindowProps, any> {
  private _onMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
  }
  private _onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    this.props.window.setMaximized(!this.props.window.maximized)
  }
  render() {
    if (this.props.window) {
      return (
        <button
          type="button"
          className={css(this.props.className, "maximize-action")}
          title={this.props.window.maximized ? "Restore" : "Maximize"}
          onClick={this._onClick}
          onMouseDown={this._onMouseDown}
        >
          <Icon className="window-action-icon" iconName={this.props.window.maximized ? "BackToWindow" : "FullScreen"} />
        </button>
      )
    }
    return null
  }
}

@observer
class WindowIconContainer extends React.Component<IWindowProps, any> {
  render() {
    const host = this.props.window.appHost
    const icon = host.icon
    if (icon.name || icon.text || icon.url || icon.component) {
      return (
        <div className={windowStyles.iconContainer}>
          <HostAppIcon host={host} />
        </div>
      )
    }
    return null
  }
}

@observer
class WindowView extends React.Component<IWindowProps, any> {
  private _ref: HTMLDivElement
  private _canDrag: boolean = false
  private _dragOffsetX: number
  private _dragOffsetY: number
  private _onHeaderMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (this.props.window.settings.draggable) {
      this._canDrag = true
      this._ref.draggable = true
      const bounds = this._ref.getBoundingClientRect()
      this._dragOffsetX = e.clientX - bounds.left
      this._dragOffsetY = e.clientY - bounds.top
    }
  }
  private _onHeaderDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    const { window } = this.props
    window.setMaximized(!window.maximized)
  }
  private _onDragStart = (e: React.DragEvent<HTMLElement>) => {
    if (this._canDrag) {
      e.stopPropagation()
      const transferText = String(JSON.stringify(this.props.window.config))
      e.dataTransfer.setData("text", transferText)
      window.setTimeout(() => {
        this.props.window.dragStart({ offsetX: this._dragOffsetX, offsetY: this._dragOffsetY })
      }, 1)
    } else {
      e.preventDefault()
    }
  }
  private _onDragEnd = (e: React.DragEvent<HTMLElement>) => {
    this._canDrag = false
    this._ref.draggable = false
    this.props.window.dragEnd()
  }
  private _resizeDragStartHandler(type: WindowResizeType) {
    return (e: React.DragEvent<HTMLElement>) => {
      e.stopPropagation()
      e.dataTransfer.setData("text", "Resizing Window " + this.props.window.id)
      window.setTimeout(() => {
        this.props.window.resizeStart(type)
      }, 1)
    }
  }
  private _onResizeDragEnd = (e: React.DragEvent<HTMLElement>) => {
    this.props.window.resizeEnd()
  }
  private _onRef = (ref: HTMLDivElement) => {
    this._ref = ref
  }
  private _renderIcon(): React.ReactNode {
    return <WindowIconContainer {...this.props} />
  }
  private _renderTitle(): React.ReactNode {
    return (
      <div className={windowStyles.titleContainer}>
        <div className={windowStyles.title}>{this.props.window.title}</div>
      </div>
    )
  }
  private _renderActionBar(): React.ReactNode {
    return (
      <div className={windowStyles.actionBar}>
        <WindowMaximizeAction {...this.props} className={css(windowStyles.action, "maximize-action")} />
        <WindowCloseAction {...this.props} className={css(windowStyles.action, "close-action")} />
      </div>
    )
  }
  private _renderHeader(): React.ReactNode {
    if (this.props.window.settings.headerHeight > 0) {
      return (
        <div
          className={windowStyles.header}
          onMouseDown={this._onHeaderMouseDown}
          onDoubleClick={this._onHeaderDoubleClick}
          style={{
            top: 0,
            right: 0,
            left: 0,
            height: this.props.window.settings.headerHeight
          }}
        >
          {this._renderIcon()}
          {this._renderTitle()}
          {this._renderActionBar()}
        </div>
      )
    }
    return null
  }
  private _renderBody(): React.ReactNode {
    return (
      <div
        className={css(windowStyles.body, { "content-hidden": this.props.window.contentHidden })}
        style={{
          top: this.props.window.settings.headerHeight,
          right: 0,
          bottom: 0,
          left: 0
        }}
      >
        <AppHostContainer host={this.props.window.appHost} />
      </div>
    )
  }
  private _renderResizeHandle(resizeType: WindowResizeType): React.ReactNode {
    if (this.props.window.settings.resizable && !this.props.window.maximized) {
      return (
        <div
          className={css(windowStyles.resize, resizeType)}
          draggable
          onDragStart={this._resizeDragStartHandler(resizeType)}
          onDragEnd={this._onResizeDragEnd}
        />
      )
    }
    return null
  }
  private notifyResize() {
    this.props.window.appHost.emit({ type: "resize" })
    //dispatchWindowResize()
  }
  private _onTransitionEnd = () => {
    this.notifyResize()
  }
  render() {
    const { window, className } = this.props
    const { draggable } = window.settings
    const style: React.CSSProperties = {
      position: "absolute",
      top: window.y,
      left: window.x,
      width: window.width,
      height: window.height,
      overflow: "hidden",
      zIndex: window.maximized ? 4 : 1,
      borderWidth: window.maximized ? 0 : window.settings.borderWidth
    }
    return (
      <div
        id={window.id}
        className={css(windowStyles.root, `manager-type-${window.manager ? window.manager.type : "unknown"}`, {
          maximized: window.maximized,
          "animate-position": window.settings.animatePosition
        })}
        style={style}
        onDragStart={draggable ? this._onDragStart : undefined}
        onDragEnd={draggable ? this._onDragEnd : undefined}
        onTransitionEnd={window.settings.animatePosition ? this._onTransitionEnd : undefined}
        role={window.settings.role}
        ref={this._onRef}
      >
        {this._renderHeader()}
        {this._renderBody()}
        {this._renderResizeHandle(WindowResizeType.top)}
        {this._renderResizeHandle(WindowResizeType.right)}
        {this._renderResizeHandle(WindowResizeType.bottom)}
        {this._renderResizeHandle(WindowResizeType.left)}
        {this._renderResizeHandle(WindowResizeType.topRight)}
        {this._renderResizeHandle(WindowResizeType.topLeft)}
        {this._renderResizeHandle(WindowResizeType.bottomRight)}
        {this._renderResizeHandle(WindowResizeType.bottomLeft)}
      </div>
    )
  }
  componentDidMount() {
    this.notifyResize()
  }
  componentDidUpdate() {
    this.notifyResize()
  }
}

export { IWindowProps, WindowView }

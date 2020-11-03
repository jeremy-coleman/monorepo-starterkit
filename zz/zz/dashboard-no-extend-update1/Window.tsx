import { AppHostContainer, HostAppIcon } from "@coglite/app-host";
import { Icon } from "@fluentui/react"
import { css } from "@fluentui/react"
//import { AppHostContainer, HostAppIcon } from "coglite/modules/host";
import { observer } from "mobx-react";
import * as React from "react";
import { WindowResizeType } from "./constants";
import { IWindow } from './models';
import { windowStyles } from "./styles";


type IWindowProps = {
  window: IWindow
  className?: string
}

export const WindowCloseAction = observer((props: IWindowProps) => {
  const _onMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
  }
  const _onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    props.window.close()
  }

  if (props.window && !props.window.closeDisabled) {
    return (
      <button
        type="button"
        className={css(props.className, "close-action")}
        title={`Close ${props.window.title || "App"}`}
        onClick={_onClick}
        onMouseDown={_onMouseDown}
      >
        <Icon className="window-action-icon" iconName="ChromeClose" />
      </button>
    )
  }
  return null
})

export const WindowMaximizeAction = observer((props: IWindowProps) => {
  const _onMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
  }
  const _onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    props.window.setMaximized(!props.window.maximized)
  }

  if (props.window) {
    return (
      <button
        type="button"
        className={css(props.className, "maximize-action")}
        title={props.window.maximized ? "Restore" : "Maximize"}
        onClick={_onClick}
        onMouseDown={_onMouseDown}
      >
        <Icon className="window-action-icon" iconName={props.window.maximized ? "BackToWindow" : "FullScreen"} />
      </button>
    )
  }
  return null
})

export const WindowIconContainer = observer(({ windowHost }) => {
  const host = windowHost.appHost
  const icon = host.icon
  if (icon.name || icon.text || icon.url || icon.component) {
    return (
      <div className={windowStyles.iconContainer}>
        <HostAppIcon host={host} />
      </div>
    )
  }
  return null
})

const WindowResizeHandle = observer(({ windowHost, resizeType }) => {
  const _resizeDragStartHandler = (e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation()
    e.dataTransfer.setData("text", "Resizing Window " + windowHost.id)
    //must use setTimeout, it has something to do with RAF usage somewhere i think
    window.setTimeout(() => {
      windowHost.resizeStart(resizeType)
    }, 1)
  }

  const _onResizeDragEnd = (e: React.DragEvent<HTMLElement>) => {
    windowHost.resizeEnd()
  }

  return (
    <>
      {windowHost.settings.resizable && !windowHost.maximized && (
        <div
          className={css(windowStyles.resize, resizeType)}
          draggable
          onDragStart={_resizeDragStartHandler}
          onDragEnd={_onResizeDragEnd}
        />
      )}
    </>
  )
})

const WindowHeader = observer(({ onMouseDown, windowHost, children }) => {
  const _onHeaderDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    windowHost.setMaximized(!windowHost.maximized)
  }

  return (
    <>
      <div
        className={windowStyles.header}
        onMouseDown={onMouseDown}
        onDoubleClick={_onHeaderDoubleClick}
        style={{ top: 0, right: 0, left: 0, height: windowHost.settings.headerHeight }}
      >
        {children}
      </div>
    </>
  )
})

export const WindowView = observer((props: IWindowProps) => {
  let windowRef = React.useRef<HTMLDivElement>()
  let _canDrag: boolean = false
  let _dragOffsetX: number
  let _dragOffsetY: number

  const notifyResize = () => {
    props.window.appHost.emit({ type: "resize" })
    //dispatchWindowResize()
  }

  const _onTransitionEnd = () => {
    notifyResize()
  }

  React.useEffect(() => {
    notifyResize()
  },[props.window])

  const _onHeaderMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (props.window.settings.draggable) {
      _canDrag = true
      windowRef.current.draggable = true
      const bounds = windowRef.current.getBoundingClientRect()
      _dragOffsetX = e.clientX - bounds.left
      _dragOffsetY = e.clientY - bounds.top
    }
  }

  const _onDragStart = (e: React.DragEvent<HTMLElement>) => {
    if (_canDrag) {
      e.stopPropagation()
      const transferText = String(JSON.stringify(props.window.config))
      e.dataTransfer.setData("text", transferText)
      window.setTimeout(() => {
        props.window.dragStart({ offsetX: _dragOffsetX, offsetY: _dragOffsetY })
      }, 1)
    } else {
      e.preventDefault()
    }
  }
  const _onDragEnd = (e: React.DragEvent<HTMLElement>) => {
    _canDrag = false
    windowRef.current.draggable = false
    props.window.dragEnd()
  }


  //const { window, className } = props
  const { draggable } = props.window.settings
  const style: React.CSSProperties = {
    position: "absolute",
    top: props.window.y,
    left: props.window.x,
    width: props.window.width,
    height: props.window.height,
    overflow: "hidden",
    zIndex: props.window.maximized ? 4 : 1,
    borderWidth: props.window.maximized ? 0 : props.window.settings.borderWidth
  }
  return (
    <div
      id={props.window.id}
      className={css(
        windowStyles.root,
        `manager-type-${props.window.manager ? props.window.manager.type : "unknown"}`,
        {
          maximized: props.window.maximized,
          "animate-position": props.window.settings.animatePosition
        }
      )}
      style={style}
      onDragStart={draggable ? _onDragStart : undefined}
      onDragEnd={draggable ? _onDragEnd : undefined}
      onTransitionEnd={props.window.settings.animatePosition ? _onTransitionEnd : undefined}
      role={props.window.settings.role}
      ref={windowRef}
    >
      {
        <>
          {props.window.settings.headerHeight > 0 && (
            <WindowHeader
              onMouseDown={_onHeaderMouseDown}
              //onDoubleClick={_onHeaderDoubleClick}
              windowHost={props.window}
            >
              <WindowIconContainer windowHost={props.window} />
              <div id="window-title" className={windowStyles.titleContainer}>
                <div className={windowStyles.title}>{props.window.title}</div>
              </div>

              <div id="window-action-bar" className={windowStyles.actionBar}>
                <WindowMaximizeAction {...props} className={css(windowStyles.action, "maximize-action")} />
                <WindowCloseAction {...props} className={css(windowStyles.action, "close-action")} />
              </div>
            </WindowHeader>
          )}
        </>
      }
      <div
        id="window-body"
        className={css(windowStyles.body, { "content-hidden": props.window.contentHidden })}
        style={{
          top: props.window.settings.headerHeight,
          right: 0,
          bottom: 0,
          left: 0
        }}
      >
        <AppHostContainer host={props.window.appHost} />
      </div>
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.top} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.right} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.bottom} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.left} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.topRight} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.topLeft} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.bottomRight} />
      <WindowResizeHandle windowHost={props.window} resizeType={WindowResizeType.bottomLeft} />
    </div>
  )
})





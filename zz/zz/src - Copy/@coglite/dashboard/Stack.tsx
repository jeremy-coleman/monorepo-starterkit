import { Icon } from "@fluentui/react"
import { css } from "@fluentui/react"
import { observer } from "mobx-react";
import * as React from "react";
import { removeComponent } from "./ComponentRemoveDialog";
import { ComponentView } from "./ComponentView";
import { dispatchWindowResize } from "./DOMHelper";
import { IHSplit, IStack, IVSplit, IWindow } from './models';
import { HSplitStyles, stackStyles, VSplitStylesheet } from "./styles";


//import { TabIcon, TabIcon as Icon, TabIcon as HostAppIcon } from "./TabIcon";

// let HostAppIcon = observer(({ iconName , ...props}) => {
//   return (<Icon iconName={iconName || props.icon ||  "bug_report"} />)
// });

type E = React.MouseEvent<HTMLButtonElement>

export type IStackProps = {
  stack?: IStack
  className?: string
  window?: IWindow
  first?: boolean
  last?: boolean
}

const StackTabIcon = observer((props: IStackProps) => {
  const host = props.window.appHost
  const icon = host.icon
  if (icon.name || icon.text || icon.url || icon.component) {
    return (
      <div className={stackStyles.tabIconContainer}>
        <Icon iconName={icon.name} />
      </div>
    )
  }
  return null
})

//-- THIS IS ONLY THE END X ON THE FAR RIGHT SIDE, STYLING THE <CLOSE/> DOESNT EFFECT ANYTHING ELSE --//
const StackCloseAction = observer((props: IStackProps) => {
  let _onRemoveConfirm = () => {
    props.stack.close()
  }
  let _onClick = () => {
    if (props.stack.windowCount > 1) {
      removeComponent({ component: props.stack, saveHandler: _onRemoveConfirm })
    } else {
      props.stack.close()
    }
  }

  const { stack } = props
  if (!stack.closeDisabled) {
    return (
      <button
        type="button"
        style={{ width: stack.headerHeight }}
        className={css(stackStyles.action, "close-action")}
        title="Close all Tabs"
        onClick={_onClick}
      >
        <Icon className={stackStyles.actionIcon} iconName="ChromeClose" />
      </button>
    )
  }
  return null
})

// -------- this is the toolbar that holds the tabs and the X on the right -----------//

const StackActionBar = observer((props: IStackProps) => (
  <div className={stackStyles.actionBar} style={{ position: "absolute", top: 0, right: 0, bottom: 0 }}>
    <StackCloseAction {...props} />
  </div>
))

const StackTabTitle = observer((props: IStackProps) => (
  <span className={css(stackStyles.tabTitleContainer, stackStyles.tabTitle)}>{props.window.title}</span>
))

const StackTabCloseAction = observer((props: IStackProps) => {
  let _onMouseDown = (e: E) => e.stopPropagation()

  let _onClick = (e: E) => {
    e.stopPropagation()
    props.window.close()
  }

  if (props.window && !props.window.closeDisabled) {
    return (
      <button
        type="button"
        className={css(stackStyles.tabAction, "close-action", { active: props.window.active })}
        title={`Close ${props.window.title || "Tab"}`}
        onMouseDown={_onMouseDown}
        onClick={_onClick}
      >
        <Icon className={stackStyles.tabActionIcon} iconName="ChromeClose" />
      </button>
    )
  }
  return null
})

const StackTabActionBar = observer((props: IStackProps) => {
  return <StackTabCloseAction {...props} />
})

let DragData = {
  _dragOverStart: undefined
}

const StackTab = observer((props: IStackProps) => {
  let ref = React.useRef<HTMLDivElement>()

  let _onClick = () => {
    props.stack.setActive(props.window)
  }

  let _onDragStart = (e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation()
    const transferText = String(JSON.stringify(props.window.config))
    e.dataTransfer.setData("text", transferText)

    window.setTimeout(() => {
      props.window.dragStart()
    }, 16)
  }
  let _onDragEnd = (e: React.DragEvent<HTMLElement>) => {
    delete DragData._dragOverStart
    props.window.dragEnd()
  }
  let _onDragOver = (e: React.DragEvent<HTMLElement>) => {
    const db = props.stack.dashboard
    const drag = db ? db.drag : undefined
    if (drag) {
      e.stopPropagation()
      if (drag !== props.window) {
        e.preventDefault()
        try {
          e.dataTransfer.dropEffect = "move"
        } catch (ex) {}
      }
    } else {
      if (!props.window.active) {
        if (!DragData._dragOverStart) {
          DragData._dragOverStart = new Date().getTime()
        } else {
          const diff = new Date().getTime() - DragData._dragOverStart
          if (diff >= 600) {
            props.window.activate()
            delete DragData._dragOverStart
          }
        }
      }
    }
  }

  let _onDragLeave = (e: React.DragEvent<HTMLElement>) => {
    if (e.relatedTarget !== ref.current && !ref.current.contains(e.relatedTarget as HTMLElement)) {
      delete DragData._dragOverStart
    }
  }

  let _onDrop = (e: React.DragEvent<HTMLElement>) => {
    delete DragData._dragOverStart
    e.stopPropagation()
    e.preventDefault()
    props.stack.dropWindow(props.window)
  }

  return (
    <div
      className={css(stackStyles.tab, { active: props.window.active, first: props.first, last: props.last })}
      role="tab"
      id={`${props.window.id}-tab`}
      aria-controls={props.window.id}
      title={props.window.title}
      ref={ref}
      onClick={_onClick}
      draggable={true}
      onDragStart={_onDragStart}
      onDragEnd={_onDragEnd}
      onDragOver={_onDragOver}
      onDrop={_onDrop}
      onDragLeave={_onDragLeave}
    >
      <StackTabIcon {...props} />
      <StackTabTitle {...props} />
      <StackTabActionBar {...props} />
    </div>
  )
})

const StackTabPanel = observer((props: IStackProps) => {
  const active = props.window.active
  let style: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden"
  }
  if (active) {
    style.right = 0
    style.bottom = 0
  } else {
    style.width = 0
    style.height = 0
  }
  return <div className={css({ active: active })} style={style} role="tabpanel" id={`${props.window.id}-tab-panel`} />
})

const StackAddAction = observer((props: IStackProps) => {
  const _onClick = () => {
    props.stack.addNew({ makeActive: true });
    dispatchWindowResize()
  }
  if (props.stack && props.stack.addApp) {
    return (
      <button
        type="button"
        title="Add Tab"
        className={stackStyles.addAction}
        onClick={_onClick}
        style={{ width: props.stack.headerHeight }}
      >
        <Icon className={stackStyles.addActionIcon} iconName="add" />
      </button>
    )
  }
  return null
})

const StackTabBar = observer((props: IStackProps) => {
  let _onDragOver = (e: React.DragEvent<HTMLElement>) => {
    const stack = props.stack
    const db = stack.dashboard
    const drag = db ? db.drag : undefined
    if (drag && (drag.parent !== stack || (stack.windowCount > 1 && drag !== stack.last))) {
      e.stopPropagation()
      e.preventDefault()
      try {
        e.dataTransfer.dropEffect = "move"
      } catch (ex) {}
    }
  }
  let _onDrop = (e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation()
    e.preventDefault()
    props.stack.dropWindow()
  }
  return (
    <div className={stackStyles.tabBar} role="tablist" onDragOver={_onDragOver} onDrop={_onDrop}>
      {props.stack && props.stack.windows && props.stack.windows.map((w, idx) => (
        <StackTab
          key={w.id}
          stack={props.stack}
          window={w}
          first={idx === 0}
          last={idx === props.stack.windowCount - 1}
        />
      ))}
      <StackAddAction {...props} />
    </div>
  )
})

const StackHeader = observer((props: IStackProps) => (
  <div className={stackStyles.header} style={{ height: props.stack.headerHeight }}>
    <StackTabBar {...props} />
    <StackActionBar {...props} />
  </div>
))

let uselessDropHandler = () => {}
let _dropHandler = uselessDropHandler

const StackDragOverlay = observer((props) => {
  let overlayRef = React.useRef<HTMLDivElement>()

  let _onDragLeave = (e: React.DragEvent<HTMLElement>) => {
    const { stack } = props
    const drag = stack.dashboard.drag
    if (drag) {
      drag.setDragState({ pos: null, over: null })
    }
    _dropHandler = uselessDropHandler
  }

  let _onDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    _dropHandler()
    props.stack.dragEnd()
  }

  let _dropLeft = () => {
    props.stack.splitLeft(props.stack.dashboard.drag)
  }

  let _setDropZoneLeft = (width: number, height: number) => {
    const { stack } = props
    const drag = stack.dashboard.drag
    _dropHandler = _dropLeft
    const styles: React.CSSProperties = {
      top: 0,
      left: 0,
      width: Math.floor(width / 2),
      height: height
    }
    drag.setDragState({ feedbackStyles: styles, over: stack })
  }

  let _dropRight = () => {
    props.stack.splitRight(props.stack.dashboard.drag)
  }

  let _setDropZoneRight = (width: number, height: number) => {
    const { stack } = props
    const drag = stack.dashboard.drag
    _dropHandler = _dropRight
    const left = Math.floor(width / 2)
    const styles: React.CSSProperties = {
      top: 0,
      left: left,
      width: width - left,
      height: height
    }
    drag.setDragState({ feedbackStyles: styles, over: stack })
  }

  let _dropTop = () => {
    props.stack.splitTop(props.stack.dashboard.drag)
  }

  let _setDropZoneTop = (width: number, height: number) => {
    const { stack } = props
    const drag = stack.dashboard.drag
    _dropHandler = _dropTop
    const styles: React.CSSProperties = {
      top: 0,
      left: 0,
      width: width,
      height: Math.floor(height / 2)
    }
    drag.setDragState({ feedbackStyles: styles, over: stack })
  }

  let _dropBottom = () => {
    props.stack.splitBottom(props.stack.dashboard.drag)
  }

  let _setDropZoneBottom = (width: number, height: number) => {
    const { stack } = props
    const drag = stack.dashboard.drag
    _dropHandler = _dropBottom
    const top = Math.floor(height / 2)
    const styles: React.CSSProperties = {
      top: top,
      left: 0,
      width: width,
      height: height - top
    }
    drag.setDragState({ feedbackStyles: styles, over: stack })
  }

  let _dropAdd = () => {
    props.stack.add(props.stack.dashboard.drag, { makeActive: true })
  }

  let _setDropZoneAdd = () => {
    _dropHandler = _dropAdd
  }

  let _onDragOver = (e: React.DragEvent<HTMLElement>) => {
    const stack = props.stack
    const db = stack.dashboard
    const drag = db ? db.drag : undefined
    if (drag) {
      e.stopPropagation()
      if ((drag.parent !== stack && stack.windowCount > 0) || stack.windowCount > 1) {
        e.preventDefault()
        const bounds = overlayRef.current.getBoundingClientRect()
        const leftRightZoneWidth = Math.floor(bounds.width / 6)
        const topBottomZoneHeight = Math.floor(bounds.height / 2)
        if (e.clientX >= bounds.left && e.clientX <= bounds.left + leftRightZoneWidth) {
          _setDropZoneLeft(bounds.width, bounds.height)
        } else if (
          e.clientX >= bounds.left + bounds.width - leftRightZoneWidth &&
          e.clientX <= bounds.left + bounds.width
        ) {
          _setDropZoneRight(bounds.width, bounds.height)
        } else if (e.clientY >= bounds.top && e.clientY <= bounds.top + topBottomZoneHeight) {
          _setDropZoneTop(bounds.width, bounds.height)
        } else {
          _setDropZoneBottom(bounds.width, bounds.height)
        }
      } else if (stack.windowCount === 0) {
        e.preventDefault()
        _setDropZoneAdd()
      }
    }
  }

  let motionlessStyle = {
    top: 0,
    left: 0,
    height: 0,
    width: 0
  }

  const { stack } = props
  const headerHeight: React.CSSProperties = { top: stack.headerHeight }
  //const drag = stack.dashboard ? stack.dashboard.drag : undefined

  if (stack.dashboard && stack.dashboard.drag) {
    let drag = stack.dashboard.drag
    const feedbackStyles = drag.dragState.over === stack ? drag.dragState.feedbackStyles : motionlessStyle
    return (
      <React.Fragment>
        {[
          <div
            key="overlay"
            className={stackStyles.dragOverlay}
            onDragOver={_onDragOver}
            onDrop={_onDrop}
            onDragLeave={_onDragLeave}
            ref={overlayRef}
            style={{ ...headerHeight }}
          />,
          <div
            key="feedbackContainer"
            className={stackStyles.dragFeedbackContainer}
            style={{ top: stack.headerHeight }}
          >
            <div className={css(stackStyles.dragFeedback, drag.dragState.pos)} style={{ ...feedbackStyles }} />
          </div>
        ]}
      </React.Fragment>
    )
  }
  return null
})

const StackBody = observer((props: IStackProps) => (
  <div className={stackStyles.body} style={{ top: props.stack.headerHeight }}>
    {props.stack && props.stack.windows && props.stack.windows.map((w) => (
      <StackTabPanel key={w.id} stack={props.stack} window={w} />
    ))}
  </div>
))

export const StackView = observer((props: IStackProps) => {
  return (
    <>
      {props.stack && (
        <div id={props.stack.id} className={stackStyles.root}>
          <StackDragOverlay {...props} />
          <StackHeader {...props} />
          <StackBody {...props} />
        </div>
      )}
    </>
  )
})

interface IVSplitProps {
  vsplit: IVSplit
  className?: string
}

//export type VSplitView = typeof VSplitView
export const VSplitView = observer((props: IVSplitProps) => {
  var ref = React.useRef<HTMLDivElement>()
  var splitterRef = React.useRef<HTMLDivElement>()

  var _resize = (e: MouseEvent) => {
    if (!ref.current || !splitterRef.current) return
    const minItemHeight = props.vsplit.minItemHeight
    const bounds = ref.current.getBoundingClientRect()
    const splitterBounds = splitterRef.current.getBoundingClientRect()
    const max = bounds.height - splitterBounds.height - minItemHeight
    let splitterPos = e.clientY - bounds.top
    if (splitterPos <= minItemHeight) {
      splitterPos = minItemHeight
    } else if (splitterPos >= max) {
      splitterPos = max
    }
    const offset = splitterPos / bounds.height
    props.vsplit.setOffset(offset)
  }
  var _onDocumentMouseUp = (e: MouseEvent) => {
    if (!ref.current || !splitterRef.current) return
    ref.current.ownerDocument.removeEventListener("mousemove", _onDocumentMouseMove)
    ref.current.ownerDocument.removeEventListener("mouseup", _onDocumentMouseUp)
    props.vsplit.setSplitActive(false)
  }
  var _onDocumentMouseMove = (e: MouseEvent) => {
    e.preventDefault()
    _resize(e)
  }

  var _onSplitterMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    ref.current.ownerDocument.addEventListener("mousemove", _onDocumentMouseMove)
    ref.current.ownerDocument.addEventListener("mouseup", _onDocumentMouseUp)
    props.vsplit.setSplitActive(true)
  }

  return (
    <div className={VSplitStylesheet.root} ref={ref}>
      <div className={VSplitStylesheet.topPane} style={{ height: props.vsplit.topHeight }}>
        <div className={VSplitStylesheet.topContent}>
          <ComponentView component={props.vsplit.top} />
        </div>
      </div>
      <div
        className={css(VSplitStylesheet.splitter, { active: props.vsplit.splitActive })}
        onMouseDown={_onSplitterMouseDown}
        style={{ top: props.vsplit.topHeight, height: props.vsplit.splitterHeight }}
        ref={splitterRef}
      >
        <div className={css(VSplitStylesheet.splitterHandle, { active: props.vsplit.splitActive })}>
          <Icon iconName="GripperBarHorizontal" className="vsplit-icon" />
        </div>
      </div>
      <div className={VSplitStylesheet.bottomPane} style={{ height: props.vsplit.bottomHeight }}>
        <div className={VSplitStylesheet.bottomContent}>
          <ComponentView component={props.vsplit.bottom} />
        </div>
      </div>
    </div>
  )
})




type IHSplitProps = { hsplit: IHSplit }

export const HSplitView = observer(({ hsplit }: IHSplitProps) => {
  var ref = React.useRef<HTMLDivElement>()
  var splitterRef = React.useRef<HTMLDivElement>()

  function _resize(e: MouseEvent) {
    if (!ref.current || !splitterRef.current) return
    const minItemWidth = hsplit.minItemWidth
    const bounds = ref.current && ref.current.getBoundingClientRect()
    const splitterBounds = ref.current && splitterRef.current.getBoundingClientRect()
    const max = bounds.width - splitterBounds.width - minItemWidth
    let splitterPos = e.clientX - bounds.left
    if (splitterPos <= minItemWidth) {
      splitterPos = minItemWidth
    } else if (splitterPos >= max) {
      splitterPos = max
    }
    hsplit.setOffset(splitterPos / bounds.width)
  }

  function _onDocumentMouseUp(e: MouseEvent) {
    if (!ref.current || !splitterRef.current) return
    ref.current.ownerDocument.removeEventListener("mousemove", _onDocumentMouseMove)
    ref.current.ownerDocument.removeEventListener("mouseup", _onDocumentMouseUp)
    hsplit.setSplitActive(false)
  }
  function _onDocumentMouseMove(e: MouseEvent) {
    e.preventDefault()
    _resize(e)
  }

  function _onSplitterMouseDown(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault()
    //if(!ref.current || !splitterRef.current) return;

    ref.current.ownerDocument.addEventListener("mousemove", _onDocumentMouseMove)
    ref.current.ownerDocument.addEventListener("mouseup", _onDocumentMouseUp)
    hsplit.setSplitActive(true)
  }

  return (
    <div className={HSplitStyles.root} ref={ref}>
      <div className={HSplitStyles.leftPane} style={{ width: hsplit.leftWidth }}>
        <div className={HSplitStyles.leftContent}>
          <ComponentView component={hsplit.left} />
        </div>
      </div>
      <div
        className={css(HSplitStyles.splitter, { active: hsplit.splitActive })}
        onMouseDown={_onSplitterMouseDown}
        style={{ left: hsplit.leftWidth, width: hsplit.splitterWidth }}
        ref={splitterRef}
      >
        <div className={css(HSplitStyles.splitterHandle, { active: hsplit.splitActive })}>
          <Icon iconName="GripperBarVertical" className="hsplit-icon" />
        </div>
      </div>
      <div
        className={HSplitStyles.rightPane}
        style={{ left: hsplit.leftWidth + hsplit.splitterWidth, width: hsplit.rightWidth }}
      >
        <div className={HSplitStyles.rightContent}>
          <ComponentView component={hsplit.right} />
        </div>
      </div>
    </div>
  )
})



// const useStackStyles = props => {
//   let theme = props.theme || getTheme();
//   let styles = concatStyleSets({
//     root: {},
//     rootFill: {
//       position: "absolute",
//       left: 0,
//       top: 0,
//       bottom: 0,
//       right: 0,
//       overflow: "hidden"
//     },
//     materialIcons: {
//       fontFamily: 'Material Icons',
//       fontWeight: 'normal',
//       fontStyle: 'normal',
//       fontSize: 24,
//       display: 'inline-block',
//       //lineHeight: 1,
//       textTransform: 'none',
//       letterSpacing: 'normal',
//       wordWrap: 'normal',
//       //whiteSpace: 'nowrap',
//       direction: 'ltr',
//       WebkitFontSmoothing: "antialiased",
//       textRendering: 'optimizeLegibility',
//       MozOsxFontSmoothing:"grayscale",
//       fontVariantAlternates: 'liga'
//     },
//     header: {
//       position: "absolute",
//       top: 0,
//       right: 0,
//       left: 0,
//       backgroundColor: theme.palette.neutralQuaternary,
//       color: theme.palette.white,
//       overflow: "hidden"
//     },
//     tabBar: {
//       background: "transparent",
//       display: "flex",
//       justifyContent: "flex-start",
//       alignItems: "flex-end",
//       height: "100%"
//     },
//     tab: {
//       position: "relative",
//       display: "flex",
//       justifyContent: "flex-start",
//       alignItems: "center",
//       overflow: "hidden",
//       backgroundColor: theme.palette.neutralQuaternary,
//       color: theme.palette.neutralSecondary,
//       cursor: "pointer",
//       height: "100%",
//       transition: "background-color 0.3s ease",
//       zIndex: 0,
//       selectors: {
//         ".close-action": {
//           visibility: "hidden"
//         },
//         "&.active": {
//           backgroundColor: theme.palette.neutralLighter,
//           color: theme.palette.neutralPrimary,
//           boxShadow: `3px 0px 3px -2px ${
//             theme.palette.neutralTertiary
//           }, -3px 0px 3px -2px ${theme.palette.neutralTertiary}`,
//           zIndex: 1,
//           selectors: {
//             ".close-action": {
//               visibility: "visible"
//             },
//             ":hover": {
//               backgroundColor: theme.palette.neutralLighter
//             }
//           }
//         },
//         ":hover": {
//           selectors: {
//             ".close-action": {
//               visibility: "visible"
//             }
//           },
//           backgroundColor: theme.palette.neutralQuaternaryAlt
//         }
//       }
//     },
//     addAction: {
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       backgroundColor: theme.palette.neutralQuaternary,
//       color: theme.palette.neutralPrimary,
//       outline: "none",
//       border: "none",
//       height: "100%",
//       width: 28,
//       cursor: "pointer",
//       transition: "background-color 0.3s ease",
//       selectors: {
//         ":hover": {
//           backgroundColor: theme.palette.neutralQuaternaryAlt
//         },
//         "&.stack-add-action-icon": {
//           color: theme.palette.neutralPrimary,
//           fontSize: theme.fonts.medium.fontSize
//         }
//       }
//     },
//     addActionIcon: {},
//     tabIconContainer: {
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       width: 20,
//       height: 20,
//       maxHeight: 20,
//       maxWidth: 20,
//       overflow: "hidden",
//       marginLeft: 4
//     },
//     tabTitleContainer: {
//       display: "flex",
//       justifyContent: "flex-start",
//       alignItems: "center",
//       maxWidth: 130,
//       overflow: "hidden",
//       paddingLeft: 8,
//       paddingRight: 8
//     },
//     tabTitle: {
//       textOverflow: "ellipsis",
//       overflow: "hidden",
//       whiteSpace: "nowrap",
//       fontSize: theme.fonts.small.fontSize
//     },
//     tabAction: {
//       color: theme.palette.neutralPrimary,
//       marginLeft: 8,
//       marginRight: 8,
//       height: 16,
//       width: 16,
//       lineHeight: 16,
//       padding: "0px",
//       outline: "none",
//       border: "none",
//       background: "transparent",
//       cursor: "pointer",
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       selectors: {
//         "&.active": {
//           color: theme.palette.neutralPrimary
//         },
//         "&.close-action": {
//           selectors: {
//             ":hover": {
//               color: theme.palette.white,
//               backgroundColor: theme.palette.redDark
//             }
//           }
//         }
//       }
//     },
//     tabActionIcon: {
//       lineHeight: theme.fonts.tiny.fontSize,
//       fontSize: theme.fonts.tiny.fontSize,
//       fontWeight: FontWeights.regular,
//       margin: 0,
//       height: theme.fonts.tiny.fontSize,
//       width: theme.fonts.tiny.fontSize
//     },
//     tabActionBar: {
//       display: "flex",
//       justifyContent: "flex-end",
//       alignItems: "center"
//     },
//     tabPanel: {},
//     action: {
//       color: theme.palette.neutralPrimary,
//       height: "100%",
//       background: "transparent",
//       border: "none",
//       outline: "none",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       cursor: "pointer",
//       selectors: {
//         "&.close-action": {
//           selectors: {
//             ":hover": {
//               color: theme.palette.white,
//               backgroundColor: theme.palette.redDark
//             }
//           }
//         }
//       }
//     },
//     actionIcon: {
//       fontSize: theme.fonts.small.fontSize,
//       fontWeight: FontWeights.regular
//     },
//     actionBar: {
//       position: "absolute",
//       top: 0,
//       right: 0,
//       bottom: 0,
//       display: "flex",
//       justifyContent: "flex-end",
//       alignItems: "center",
//       backgroundColor: theme.palette.neutralQuaternary
//     },
//     body: {
//       position: "absolute",
//       right: 0,
//       bottom: 0,
//       left: 0,
//       backgroundColor: theme.palette.white,
//       boxShadow: `0px -3px 3px -2px ${theme.palette.neutralTertiary}`
//     },
//     dragOverlay: {
//       position: "absolute",
//       left: 0,
//       bottom: 0,
//       right: 0,
//       background: theme.palette.white,
//       opacity: 0.2,
//       zIndex: 3
//     },
//     dragFeedbackContainer: {
//       position: "absolute",
//       left: 0,
//       bottom: 0,
//       right: 0,
//       background: "transparent",
//       zIndex: 2
//     },
//     dragFeedback: {
//       position: "absolute",
//       transition: "all 100ms ease",
//       backgroundColor: theme.palette.neutralTertiary,
//       opacity: 0.5
//     }
//   });

//   return mergeStyleSets({
//     root: ["stack", props.className, styles.root],
//     header: ["stack-header", styles.header],
//     tabBar: ["stack-tab-bar", styles.tabBar],
//     actionBar: ["stack-action-bar", styles.actionBar],
//     action: ["stack-action", styles.action],
//     actionIcon: ["stack-action-icon", styles.actionIcon],
//     addAction: ["stack-add-action", styles.addAction],
//     addActionIcon: ["stack-add-action-icon", styles.addActionIcon],
//     tab: ["stack-tab", styles.tab],
//     tabIconContainer: ["stack-tab-icon-container", styles.tabIconContainer],
//     tabTitleContainer: ["stack-tab-title-container", styles.tabTitleContainer],
//     tabTitle: ["stack-tab-title", styles.tabTitle],
//     tabActionBar: ["stack-tab-action-bar", styles.tabActionBar],
//     tabAction: ["stack-tab-action", styles.tabAction],
//     tabActionIcon: ["stack-tab-action-icon", styles.tabActionIcon],
//     tabPanel: ["stack-tab-panel", styles.tabPanel],
//     body: ["stack-body", styles.body],
//     dragOverlay: ["stack-drag-overlay", styles.dragOverlay],
//     dragFeedbackContainer: [
//       "stack-drag-feedback-container",
//       styles.dragFeedbackContainer
//     ],
//     dragFeedback: ["stack-drag-feedback", styles.dragFeedback]
//   });
// };
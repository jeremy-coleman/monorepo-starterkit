
import { observer } from "mobx-react"
import * as React from "react"
import { removeComponent } from "../actions"
import { stackStyles } from "./stackStyles"
import { MDIcon } from "coglite/shared/components"
import { HostAppIcon } from "coglite/modules/host/views"
import { css } from "@uifabric/styleguide"

let Add = () => <MDIcon iconName={"add"} />
let Close = () => <MDIcon iconName={"close"} />

type E = React.MouseEvent<HTMLButtonElement>

export type IStackProps = {
  stack
  className?: string
  window?
  first?: boolean
  last?: boolean
}

//<HostAppIcon iconName={'vpn_key'}/>{'no_encrpytion'

let StackTabIcon = observer((props: IStackProps) => (
  <div className={stackStyles.tabIconContainer}>
    <HostAppIcon host={props.window.appHost} />
  </div>
))

// let StackTabIcon = observer((props: IStackProps) =>
// <div className={stackStyles.tabIconContainer}>
//     <HostAppIcon icon={'dashboard'}/>
// </div>
// );

//-- THIS IS ONLY THE END X ON THE FAR RIGHT SIDE, STYLING THE <CLOSE/> DOESNT EFFECT ANYTHING ELSE --//

@observer
class StackCloseAction extends React.Component<IStackProps, any> {
  private _onRemoveConfirm = () => {
    this.props.stack.close()
  }
  private _onClick = () => {
    if (this.props.stack.windowCount > 1) {
      removeComponent({ component: this.props.stack, saveHandler: this._onRemoveConfirm })
    } else {
      this.props.stack.close()
    }
  }

  render() {
    const { stack } = this.props
    if (!stack.closeDisabled) {
      //return (<Close onClick={this._onClick} title="Close all Tabs" style={{ width: stack.headerHeight }}/>);

      return (
        <i
          //type="button"
          style={{ width: stack.headerHeight }}
          className={css(stackStyles.action, "close-action")}
          title="Close all Tabs"
          onClick={this._onClick}
        >
          <Close />
        </i>
      )
    }
    return null
  }
}

// -------- this is the toolbar that holds the tabs and the X on the right -----------//

let StackActionBar = observer((props: IStackProps) => (
  <div className={stackStyles.actionBar} style={{ position: "absolute", top: 0, right: 0, bottom: 0 }}>
    <StackCloseAction {...props} />
  </div>
))

let StackTabTitle = observer((props: IStackProps) => (
  <span className={css(stackStyles.tabTitleContainer, stackStyles.tabTitle)}>{props.window.title}</span>
))

@observer
class StackTabCloseAction extends React.Component<IStackProps, any> {
  _onMouseDown = (e: E) => e.stopPropagation()

  _onClick = (e: E) => {
    e.stopPropagation()
    this.props.window.close()
  }

  render() {
    if (this.props.window && !this.props.window.closeDisabled) {
      return (
        <span
          style={{ width: this.props.stack.headerHeight }}
          className={css(
            stackStyles.tabIconContainer,
            stackStyles.action,
            stackStyles.tabAction,
            "close-action",
            this.props.window.active ? "active" : ""
          )}
          title={`Close ${this.props.window.title || "Tab"}`}
          onMouseDown={this._onMouseDown}
          onClick={this._onClick}
        >
          <Close />
        </span>
      )
    }
    return null
  }
}

let StackTabActionBar1 = observer((props: IStackProps) => (
  <div className={stackStyles.tabAction}>
    <StackTabCloseAction {...props} />
  </div>
))

let StackTabActionBar = observer((props: IStackProps) => <StackTabCloseAction {...props} />)

@observer
class StackTab extends React.Component<IStackProps, any> {
  ref = React.createRef<HTMLDivElement>()
  private _dragOverStart: number

  _onClick = () => this.props.stack.setActive(this.props.window)

  private _onDragStart = (e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation()
    const transferText = String(JSON.stringify(this.props.window.config))
    e.dataTransfer.setData("text", transferText)

    window.setTimeout(() => {
      this.props.window.dragStart()
    }, 16)
  }
  private _onDragEnd = (e: React.DragEvent<HTMLElement>) => {
    delete this._dragOverStart
    this.props.window.dragEnd()
  }
  private _onDragOver = (e: React.DragEvent<HTMLElement>) => {
    const db = this.props.stack.dashboard
    const drag = db ? db.drag : undefined
    if (drag) {
      e.stopPropagation()
      if (drag !== this.props.window) {
        e.preventDefault()
        try {
          e.dataTransfer.dropEffect = "move"
        } catch (ex) {}
      }
    } else {
      if (!this.props.window.active) {
        if (!this._dragOverStart) {
          this._dragOverStart = new Date().getTime()
        } else {
          const diff = new Date().getTime() - this._dragOverStart
          if (diff >= 600) {
            this.props.window.activate()
            delete this._dragOverStart
          }
        }
      }
    }
  }

  private _onDragLeave = (e: React.DragEvent<HTMLElement>) => {
    if (e.relatedTarget !== this.ref.current && !this.ref.current.contains(e.relatedTarget as HTMLElement)) {
      delete this._dragOverStart
    }
  }

  private _onDrop = (e: React.DragEvent<HTMLElement>) => {
    delete this._dragOverStart
    e.stopPropagation()
    e.preventDefault()
    this.props.stack.dropWindow(this.props.window)
  }

  render() {
    return (
      <div
        className={css(stackStyles.tab, { active: this.props.window.active, first: this.props.first, last: this.props.last })}
        role="tab"
        id={`${this.props.window.id}-tab`}
        aria-controls={this.props.window.id}
        title={this.props.window.title}
        ref={this.ref}
        onClick={this._onClick}
        draggable={true}
        onDragStart={this._onDragStart}
        onDragEnd={this._onDragEnd}
        onDragOver={this._onDragOver}
        onDrop={this._onDrop}
        onDragLeave={this._onDragLeave}
      >
        <StackTabIcon {...this.props} />
        <StackTabTitle {...this.props} />
        <StackTabActionBar {...this.props} />
      </div>
    )
  }
}

@observer
class StackTabPanel extends React.Component<IStackProps, any> {
  render() {
    const active = this.props.window.active
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
    return <div className={css({ active: active })} style={style} role="tabpanel" id={`${this.props.window.id}-tab-panel`} />
  }
}

@observer
class StackAddAction extends React.Component<IStackProps, any> {
  _onClick = () => this.props.stack.addNew({ makeActive: true })

  render() {
    const { stack } = this.props
    if (stack.addApp) {
      return (
        <button
          type="button"
          title="Add Tab"
          className={stackStyles.addAction}
          onClick={this._onClick}
          style={{ width: stack.headerHeight }}
        >
          <Add />
        </button>
      )
    }
    return null
  }
}

@observer
class StackTabBar extends React.Component<IStackProps, any> {
  private _onDragOver = (e: React.DragEvent<HTMLElement>) => {
    const stack = this.props.stack
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
  private _onDrop = (e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation()
    e.preventDefault()
    this.props.stack.dropWindow()
  }
  render() {
    return (
      <div className={stackStyles.tabBar} role="tablist" onDragOver={this._onDragOver} onDrop={this._onDrop}>
        {this.props.stack.windows.map((w, idx) => (
          <StackTab key={w.id} stack={this.props.stack} window={w} first={idx === 0} last={idx === this.props.stack.windowCount - 1} />
        ))}
        <StackAddAction {...this.props} />
      </div>
    )
  }
}

let StackHeader = observer((props: IStackProps) => (
  <div className={stackStyles.header} style={{ height: props.stack.headerHeight }}>
    <StackTabBar {...props} />
    <StackActionBar {...props} />
  </div>
))

const uselessDropHandler = () => {}

@observer
class StackDragOverlay extends React.Component<IStackProps, any> {
  overlayRef = React.createRef<HTMLDivElement>()

  private _onDragLeave = (e: React.DragEvent<HTMLElement>) => {
    const { stack } = this.props
    const drag = stack.dashboard.drag
    if (drag) {
      drag.setDragState({ pos: null, over: null })
    }
    this._dropHandler = uselessDropHandler
  }
  private _onDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    this._dropHandler()
    this.props.stack.dragEnd()
  }
  private _dropHandler = uselessDropHandler
  private _dropLeft = () => {
    this.props.stack.splitLeft(this.props.stack.dashboard.drag)
  }
  private _setDropZoneLeft(width: number, height: number) {
    const { stack } = this.props
    const drag = stack.dashboard.drag
    this._dropHandler = this._dropLeft
    const styles: React.CSSProperties = {
      top: 0,
      left: 0,
      width: Math.floor(width / 2),
      height: height
    }
    drag.setDragState({ feedbackStyles: styles, over: stack })
  }
  private _dropRight = () => {
    this.props.stack.splitRight(this.props.stack.dashboard.drag)
  }
  private _setDropZoneRight(width: number, height: number) {
    const { stack } = this.props
    const drag = stack.dashboard.drag
    this._dropHandler = this._dropRight
    const left = Math.floor(width / 2)
    const styles: React.CSSProperties = {
      top: 0,
      left: left,
      width: width - left,
      height: height
    }
    drag.setDragState({ feedbackStyles: styles, over: stack })
  }
  private _dropTop = () => {
    this.props.stack.splitTop(this.props.stack.dashboard.drag)
  }
  private _setDropZoneTop(width: number, height: number) {
    const { stack } = this.props
    const drag = stack.dashboard.drag
    this._dropHandler = this._dropTop
    const styles: React.CSSProperties = {
      top: 0,
      left: 0,
      width: width,
      height: Math.floor(height / 2)
    }
    drag.setDragState({ feedbackStyles: styles, over: stack })
  }
  private _dropBottom = () => {
    this.props.stack.splitBottom(this.props.stack.dashboard.drag)
  }
  private _setDropZoneBottom(width: number, height: number) {
    const { stack } = this.props
    const drag = stack.dashboard.drag
    this._dropHandler = this._dropBottom
    const top = Math.floor(height / 2)
    const styles: React.CSSProperties = {
      top: top,
      left: 0,
      width: width,
      height: height - top
    }
    drag.setDragState({ feedbackStyles: styles, over: stack })
  }
  private _dropAdd = () => {
    this.props.stack.add(this.props.stack.dashboard.drag, { makeActive: true })
  }
  private _setDropZoneAdd() {
    this._dropHandler = this._dropAdd
  }
  private _onDragOver = (e: React.DragEvent<HTMLElement>) => {
    const stack = this.props.stack
    const db = stack.dashboard
    const drag = db ? db.drag : undefined
    if (drag) {
      e.stopPropagation()
      if ((drag.parent !== stack && stack.windowCount > 0) || stack.windowCount > 1) {
        e.preventDefault()
        const bounds = this.overlayRef.current.getBoundingClientRect()
        const zoneWidth = Math.floor(bounds.width / 2)
        const leftRightZoneWidth = Math.floor(bounds.width / 6)
        const topBottomZoneHeight = Math.floor(bounds.height / 2)
        if (e.clientX >= bounds.left && e.clientX <= bounds.left + leftRightZoneWidth) {
          this._setDropZoneLeft(bounds.width, bounds.height)
        } else if (e.clientX >= bounds.left + bounds.width - leftRightZoneWidth && e.clientX <= bounds.left + bounds.width) {
          this._setDropZoneRight(bounds.width, bounds.height)
        } else if (e.clientY >= bounds.top && e.clientY <= bounds.top + topBottomZoneHeight) {
          this._setDropZoneTop(bounds.width, bounds.height)
        } else {
          this._setDropZoneBottom(bounds.width, bounds.height)
        }
      } else if (stack.windowCount === 0) {
        e.preventDefault()
        this._setDropZoneAdd()
      }
    }
  }

  motionlessStyle: {
    top: 0
    left: 0
    height: 0
    width: 0
  }

  render() {
    const { stack } = this.props
    const headerHeight: React.CSSProperties = { top: stack.headerHeight }
    const drag = stack.dashboard ? stack.dashboard.drag : undefined
    if (drag) {
      const feedbackStyles = drag.dragState.over === stack ? drag.dragState.feedbackStyles : this.motionlessStyle
      return [
        <div
          key="overlay"
          className={stackStyles.dragOverlay}
          onDragOver={this._onDragOver}
          onDrop={this._onDrop}
          onDragLeave={this._onDragLeave}
          ref={this.overlayRef}
          style={{ ...headerHeight }}
        />,
        <div key="feedbackContainer" className={stackStyles.dragFeedbackContainer} style={{ top: stack.headerHeight }}>
          <div className={css(stackStyles.dragFeedback, drag.dragState.pos)} style={{ ...feedbackStyles }} />
        </div>
      ]
    }
    return null
  }
}

let StackBody = observer((props) => (
  <div className={stackStyles.body} style={{ top: props.stack.headerHeight }}>
    {props.stack.windows.map((w) => (
      <StackTabPanel key={w.id} stack={props.stack} window={w} />
    ))}
  </div>
))

export type StackView = typeof StackView

export const StackView = observer((props: IStackProps) => {
  return (
    <div id={props.stack.id} className={stackStyles.root}>
      <StackDragOverlay {...props} />
      <StackHeader {...props} />
      <StackBody {...props} />
    </div>
  )
})

@observer
export class StackView1 extends React.Component<IStackProps, any> {
  render() {
    return (
      <div id={this.props.stack.id} className={stackStyles.root}>
        <StackDragOverlay {...this.props} />
        <StackHeader {...this.props} />
        <StackBody {...this.props} />
      </div>
    )
  }
}

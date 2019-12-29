import { concatStyleSets, mergeStyleSets, memoizeFunction, css } from "@uifabric/styleguide"
import { FontSizes } from "@uifabric/styleguide"

import { observer } from "mobx-react"
import { Icon } from "@uifabric/components"
import * as React from "react"
import { ComponentView } from "./ComponentView"

const baseVsplitStyles = concatStyleSets({
  root: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  splitter: {
    cursor: "ns-resize",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    backgroundColor: "gray", //theme.palette.themeDark,
    left: 0,
    right: 0
  },
  splitterHandle: {
    position: "absolute",
    top: -2,
    right: 0,
    bottom: -2,
    left: 0,
    overflow: "hidden",
    backgroundColor: "transparent",
    color: "gray", //theme.palette.themeDark,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    transition: "background-color 0.3s ease",
    selectors: {
      ":hover": {
        backgroundColor: "gray", //theme.palette.themeDark,
        opacity: 0.5
      },
      ".vsplit-icon": {
        fontSize: "10px",
        visibility: "hidden",
        color: "white" //theme.palette.white
      },
      "&.active": {
        backgroundColor: "gray", //theme.palette.themeDark,
        opacity: 1.0,
        selectors: {
          ".vsplit-icon": {
            visibility: "visible"
          }
        }
      }
    }
  },
  topPane: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden"
  },
  topContent: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "auto"
  },
  bottomPane: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden"
  },
  bottomContent: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "auto"
  }
})

const createVsplitStylesheet = memoizeFunction((styles, className?) => {
  return mergeStyleSets({
    root: ["vsplit", styles.root, className],
    splitter: ["vsplit-splitter", styles.splitter],
    splitterHandle: ["vsplit-splitter-content", styles.splitterHandle],
    topPane: ["vsplit-top-pane", styles.topPane],
    topContent: ["vsplit-top-content", styles.topContent],
    bottomPane: ["vsplit-bottom-pane", styles.bottomPane],
    bottomContent: ["vsplit-bottom-content", styles.bottomContent]
  })
})

const VSplitStylesheet = createVsplitStylesheet(baseVsplitStyles)

interface IVSplitProps {
  vsplit
  className?: string
}

export type VSplitView = typeof VSplitView
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

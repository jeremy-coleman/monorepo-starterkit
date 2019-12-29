import { IStyle, mergeStyleSets, css } from "@uifabric/styleguide"
import { observer } from "mobx-react"
import { Icon } from "@uifabric/components"
//import { concatStyleSets, css, FontSizes, getTheme, Icon, IStyle, ITheme, memoizeFunction, mergeStyleSets } from '@uifabric/components';
import * as React from "react"
import { IHSplit } from "../types"
import { ComponentView } from "./ComponentView"

interface IHSplitStyles {
  root?: IStyle
  splitter?: IStyle
  splitterHandle?: IStyle
  leftPane?: IStyle
  leftContent?: IStyle
  rightPane?: IStyle
  rightContent?: IStyle
}

const HSplitStyles = mergeStyleSets({
  root: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  splitter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "gray" //theme.palette.themeDark
  },
  splitterHandle: {
    cursor: "ew-resize",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: -2,
    right: -2,
    overflow: "hidden",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    transition: "background-color 0.3s ease",
    selectors: {
      ":hover": {
        backgroundColor: "grey", //theme.palette.themeDark,
        opacity: 0.5
      },
      ".hsplit-icon": {
        fontSize: "10px",
        visibility: "hidden",
        color: "white" //theme.palette.white
      },
      "&.active": {
        backgroundColor: "gray", //theme.palette.themeDark,
        opacity: 1.0,
        selectors: {
          ".hsplit-icon": {
            visibility: "visible"
          }
        }
      }
    }
  },
  leftPane: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    overflow: "hidden"
  },
  leftContent: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "auto"
  },
  rightPane: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    overflow: "hidden"
  },
  rightContent: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "auto"
  }
})

interface IHSplitProps {
  hsplit: IHSplit
  styles?: IHSplitStyles
  className?: string
}

export type HSplitView = typeof HSplitView

export const HSplitView = observer((props: IHSplitProps) => {
  var ref = React.useRef<HTMLDivElement>()
  var splitterRef = React.useRef<HTMLDivElement>()

  function _resize(e: MouseEvent) {
    if (!ref.current || !splitterRef.current) return
    const minItemWidth = props.hsplit.minItemWidth
    const bounds = ref.current && ref.current.getBoundingClientRect()
    const splitterBounds = ref.current && splitterRef.current.getBoundingClientRect()
    const max = bounds.width - splitterBounds.width - minItemWidth
    let splitterPos = e.clientX - bounds.left
    if (splitterPos <= minItemWidth) {
      splitterPos = minItemWidth
    } else if (splitterPos >= max) {
      splitterPos = max
    }
    props.hsplit.setOffset(splitterPos / bounds.width)
  }

  function _onDocumentMouseUp(e: MouseEvent) {
    if (!ref.current || !splitterRef.current) return
    ref.current.ownerDocument.removeEventListener("mousemove", _onDocumentMouseMove)
    ref.current.ownerDocument.removeEventListener("mouseup", _onDocumentMouseUp)
    props.hsplit.setSplitActive(false)
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
    props.hsplit.setSplitActive(true)
  }

  //<Icon iconName="GripperBarVertical" className="hsplit-icon" />

  return (
    <div className={HSplitStyles.root} ref={ref}>
      <div className={HSplitStyles.leftPane} style={{ width: props.hsplit.leftWidth }}>
        <div className={HSplitStyles.leftContent}>
          <ComponentView component={props.hsplit.left} />
        </div>
      </div>
      <div
        className={css(HSplitStyles.splitter, { active: props.hsplit.splitActive })}
        onMouseDown={_onSplitterMouseDown}
        style={{ left: props.hsplit.leftWidth, width: props.hsplit.splitterWidth }}
        ref={splitterRef}
      >
        <div className={css(HSplitStyles.splitterHandle, { active: props.hsplit.splitActive })}>
          <Icon iconName="GripperBarVertical" className="hsplit-icon" />
        </div>
      </div>
      <div
        className={HSplitStyles.rightPane}
        style={{ left: props.hsplit.leftWidth + props.hsplit.splitterWidth, width: props.hsplit.rightWidth }}
      >
        <div className={HSplitStyles.rightContent}>
          <ComponentView component={props.hsplit.right} />
        </div>
      </div>
    </div>
  )
})

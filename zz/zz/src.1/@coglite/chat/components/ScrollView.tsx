import { ITheme } from "office-ui-fabric-react"
import * as React from "react"
import { createComponent } from "../utilities"

type IScrollViewProps = {
  horizontal?: boolean
  vertical?: boolean
  styles: { [key in keyof ReturnType<typeof getStyles>]: string }
  height: number
  top: number
  drag?: { x: number; y: number }
  theme: ITheme
} & React.HTMLAttributes<HTMLElement>

class ScrollViewComponent extends React.PureComponent<IScrollViewProps, any> {
  private _scrollElement = React.createRef<HTMLDivElement>()

  constructor(props: IScrollViewProps) {
    super(props)
    this.state = {
      top: 0,
      height: 0
    }
  }

  public render() {
    const { styles, children } = this.props
    //const nativeProps = getNativeProps(this.props, divProperties);
    const { height, top } = this.state

    return (
      <div {...this.props} className={styles.root}>
        <div
          className={styles.scrollArea}
          ref={this._scrollElement}
          onScroll={this._updateScrollSize}
        >
          {children}
        </div>

        <div className={styles.scrollTrack}>
          <div
            className={styles.scrollThumb}
            style={{ height, transform: `translateY(${top}px)` }}
            onMouseDown={this._onMouseDown}
            onMouseUp={this._onMouseUp}
          />
        </div>
      </div>
    )
  }

  public componentDidMount() {
    this._updateScrollSize()
  }

  private _updateScrollSize = () => {
    if (this._scrollElement.current) {
      const { clientHeight, scrollHeight, scrollTop } = this._scrollElement.current
      const height = Math.floor(clientHeight * (clientHeight / scrollHeight))
      const top = Math.floor((clientHeight - height) * (scrollTop / (scrollHeight - clientHeight)))
      this.setState({
        top,
        height
      })
    }
  }

  private _onMouseDown = (ev: React.MouseEvent<Element>) => {
    this.setState({
      drag: {
        top: this.state.top,
        x: ev.clientX,
        y: ev.clientY
      }
    })
  }

  private _onMouseUp = () => {
    this.setState({
      drag: undefined
    })
  }
}

const FillAreaStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%"
}

const getStyles = (props: IScrollViewProps) => {
  const { className, horizontal, vertical, theme } = props

  return {
    root: [
      {
        position: "relative"
      },
      className
    ],

    scrollArea: [
      FillAreaStyle,
      {
        WebkitOverflowScrolling: "touch",
        overflowX: horizontal ? "scroll" : "hidden",
        overflowY: vertical ? "scroll" : "hidden",
        selectors: {
          "::-webkit-scrollbar": {
            width: 0
          }
        }
        //  boxShadow: '0 10px 20px -10px rgba(0,0,0,.3) inset'
      }
    ],

    scrollTrack: {
      position: "absolute",
      top: 0,
      right: 0,
      width: 16,
      height: "100%",
      backgroundColor: "transparent",
      zIndex: 1
    },

    scrollThumb: {
      position: "absolute",
      top: "0%",
      left: 5,
      borderRadius: 3,
      width: 6,
      background: theme.palette.neutralTertiary,
      minHeight: 16,
      opacity: 0,
      transition: "left .2s, width .2s, border-radius .2s, opacity 1s",

      selectors: {
        "$scrollTrack:hover &": {
          left: 2,
          width: 12,
          borderRadius: 6,
          opacity: 1
        },
        "$root:hover &": {
          opacity: 0.6,
          transition: "left .2s, width .2s, border-radius .2s, opacity .2s"
        }
      }
    }
  }
}

export const ScrollView = createComponent<IScrollViewProps>({
  scope: "ScrollView",
  styles: getStyles,
  view: ScrollViewComponent
})

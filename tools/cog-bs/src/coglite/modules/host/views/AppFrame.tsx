import * as React from "react"

export interface IAppFrameProps {
  src?: string
  className?: string
  host?: Partial<EventTarget>
}

export const AppFrame = (props: IAppFrameProps) => {
  const containerRef = React.useRef<HTMLDivElement>()
  const frameRef = React.useRef<HTMLIFrameElement>()
  React.useEffect(() => {
    const onResize = () => {
      if (containerRef.current && frameRef.current) {
        const bounds = containerRef.current.getBoundingClientRect()
        frameRef.current.width = String(bounds.width)
        frameRef.current.height = String(bounds.height)
      }
    }

    const host = props.host
    if (host) {
      host.addEventListener("resize", onResize)
      onResize()
      return () => {
        host.removeEventListener("resize", onResize)
        if (frameRef.current) {
          frameRef.current.src = "about:blank"
        }
      }
    }
  })
  return (
    <div
      className={props.className}
      style={{
        overflow: "hidden",
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }}
      ref={containerRef}
    >
      <iframe
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          border: "none"
        }}
        ref={frameRef}
        src={props.src}
      />
    </div>
  )
}

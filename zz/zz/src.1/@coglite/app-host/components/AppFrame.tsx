import * as React from "react"
import { IAppHost } from "../models"

export interface IAppFrameProps {
  src?: string
  className?: string
  host?: IAppHost
}

export const AppFrame = React.memo((props: IAppFrameProps) => {
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
})

// import { IAppHost, WithAppHost, IUser} from "@coglite/app-host"
// import { IRequest } from "@coglite/router"
// import React from "react"

// export type IScriptFrameProps = {
//   src: string
//   className?: any
// } & WithAppHost

// export const ScriptFrame = (props: IScriptFrameProps) => {
//   const containerRef = React.useRef<HTMLDivElement>()
//   const frameRef = React.useRef<HTMLIFrameElement>()

//   React.useEffect(() => {
//     const onResize = () => {
//       if (containerRef.current && frameRef.current) {
//         const bounds = containerRef.current.getBoundingClientRect()
//         frameRef.current.width = String(bounds.width)
//         frameRef.current.height = String(bounds.height)
//       }
//     }
//     const host = props.host
//     if (host) {
//       host.addEventListener("resize", onResize)
//       onResize()
//       return () => {
//         host.removeEventListener("resize", onResize)
//         if (frameRef.current) {
//           frameRef.current.src = "about:blank"
//         }
//       }
//     }
//   })

//   return (
//     <div
//       className={props.className}
//       style={{
//         overflow: "hidden",
//         position: "absolute",
//         top: 0,
//         right: 0,
//         bottom: 0,
//         left: 0
//       }}
//       ref={containerRef}
//     >
//       <iframe
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           border: "none"
//         }}
//         ref={frameRef}
//         src={props.src}
//       />
//     </div>
//   )
// }

// export type IScriptFrameProps = {
//   src: string
//   config?: any
//   userProfile?: {
//     id?: number
//     display_name?: string
//     bio?: string
//     user?: IUser
//   }
//   defaultRequest?: IRequest
//   launcher?: IAppHost["launcher"]
//   className?: any
// } & WithAppHost

// export const ScriptFrame = (props: IScriptFrameProps) => {
//   const containerRef = React.useRef<HTMLDivElement>()
//   const frameRef = React.useRef<HTMLIFrameElement>()
//   var _frameWindow: Window
//   var _frameDoc: Document
//  const [state, setState] = React.useState({ error: null })

//   React.useEffect(() => {
//     const onResize = () => {
//       if (containerRef.current && frameRef.current) {
//         const bounds = containerRef.current.getBoundingClientRect()
//         frameRef.current.width = String(bounds.width)
//         frameRef.current.height = String(bounds.height)
//       }
//     }
//     const host = props.host
//     if (host) {
//       host.addEventListener("resize", onResize)
//       onResize()
//       return () => {
//         host.removeEventListener("resize", onResize)
//         if (frameRef.current) {
//           frameRef.current.src = "about:blank"
//         }
//       }
//     }
//   })

//   var _onScriptLoad = () => {
//     console.log("-- Script Load")
//   }

//   var _onScriptError = () => {
//     console.log("-- Script Error")
//   }

//   var _onWidgetScriptError = (ev: Event) => {
//     setState({
//       error: {
//         message: `Error loading script at ${(ev.target as any).src}`
//       }
//     })
//   }

//   var _loadScript = () => {
//     const widgetScriptEl = _frameDoc.createElement("script")
//     widgetScriptEl.addEventListener("error", _onWidgetScriptError)
//     widgetScriptEl.src = props.src
//     _frameDoc.body.appendChild(widgetScriptEl)
//   }

//   var _onAppConfigError = (ev: Event) => {
//     const widgetAppConfig = {}
//     _frameWindow["AppConfig"] = widgetAppConfig
//     _loadScript()
//   }

//   var _onAppConfigLoaded = () => {
//     let widgetAppConfig = _frameWindow["AppConfig"]
//     if (!widgetAppConfig) {
//       widgetAppConfig = {}
//       _frameWindow["AppConfig"] = widgetAppConfig
//     }
//     _loadScript()
//   }

//   useMount(() => {

//     const frame = frameRef.current
//     const frameWindow = frame.contentWindow
//     _frameWindow = frameWindow
//     const frameDoc = frame.contentDocument
//     _frameDoc = frameDoc
//     const appConfigScriptUrl = PathUtils.trimSeparatorFromEnd(PathUtils.parent(props.src)) + "/" + "AppConfig.js"
//     const appConfigScriptEl = frameDoc.createElement("script")
//     appConfigScriptEl.addEventListener("load", _onAppConfigLoaded)
//     appConfigScriptEl.addEventListener("error", _onAppConfigError)
//     appConfigScriptEl.src = appConfigScriptUrl
//     frameDoc.body.appendChild(appConfigScriptEl)
//   })

//   if (state.error) {
//     return <ErrorView error={state.error} />
//   }

//   return (
//     <div
//       className={props.className}
//       style={{
//         overflow: "hidden",
//         position: "absolute",
//         top: 0,
//         right: 0,
//         bottom: 0,
//         left: 0
//       }}
//       ref={containerRef}
//     >
//       <iframe
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           border: "none"
//         }}
//         ref={frameRef}
//         src={props.src}
//       />
//     </div>
//   )
// }

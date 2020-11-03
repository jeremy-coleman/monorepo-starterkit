import { AppHost } from "../models/ApplicationHost"
import { useConstCallback } from "@coglite/react-hooks"
import { IRequest } from "@coglite/router"
import { observer } from "mobx-react-lite"
import {
  getTheme,
  IModalProps,
  IPanel,
  IPanelProps,
  mergeStyleSets,
  Panel
} from "office-ui-fabric-react"
import React from "react"
import { IAppContainerProps } from "./AppContainer"
import { AppHostContainer } from "./AppHost"
import { Supplier } from "../models/Supplier"

var theme = getTheme()

const AppPanelStylesheet = mergeStyleSets({
  root: [
    "app-panel",
    {
      selectors: {
        ".ms-Panel-contentInner": {
          position: "absolute",
          top: 44,
          right: 0,
          bottom: 0,
          left: 0
        }
      }
    }
  ],
  navigation: [
    "app-panel-navigation",
    {
      position: "relative",
      padding: "0px 5px",
      height: 44,
      display: "flex",
      justifyContent: "flex-end"
    }
  ],
  header: [
    "app-panel-header",
    {
      position: "absolute",
      top: 0,
      left: 0,
      //   bottom: 0,
      display: "flex",
      alignItems: "center",
      paddingLeft: 14
    }
  ],
  headerText: [
    "app-panel-header-text",
    {
      fontSize: "17px",
      //fontWeight: FontWeights.light,
      color: theme.palette.neutralPrimary,
      lineHeight: 32,
      margin: 0
    }
  ],
  closeButton: ["app-panel-close-button", {}]
})

interface IAppPanelContainerProps1 extends IAppContainerProps {
  modalProps?: IModalProps
  requestSupplier: Supplier<IRequest>
  panelProps?: IPanelProps
  className?: string
}

interface IAppPanelProps extends IAppContainerProps {
  modalProps?: IModalProps
  request: IRequest
  panelProps?: IPanelProps
  className?: string
}

export const AppPanel = observer((props: IAppPanelProps) => {
  const panelRef = React.useRef<IPanel>()
  const hostRef = React.useRef<AppHost>(new AppHost())
  let panelProps = { ...props.panelProps, ...props.request.panelProps }
  const host = hostRef.current
  host.root = props.root ? true : false
  host.router = props.router
  host.launcher = props.launcher
  host.setDefaultRequest(props.request)

  React.useEffect(() => {
    hostRef.current.load(props.request)
  }, [props.request, props.router])

  const _onRenderHeader = (props: IPanelProps) => {
    return null
  }

  const onRenderNavigationContent = useConstCallback((props, defaultRender) => (
    <>
      <div className={AppPanelStylesheet.header}>
        <p className={AppPanelStylesheet.headerText}>{props.headerText}</p>
      </div>
      {// This custom navigation still renders the close button (defaultRender).
      // If you don't use defaultRender, be sure to provide some other way to close the panel.
      defaultRender!(props)}
    </>
  ))

  return (
    <Panel
      {...panelProps}
      isOpen={props.request ? true : false}
      headerText={host.title}
      onRenderHeader={_onRenderHeader}
      onRenderNavigationContent={onRenderNavigationContent}
      //onRenderNavigation={_onRenderNavigation}
      isLightDismiss={true}
      ref={panelRef}
      className={AppPanelStylesheet.root}
      modalProps={props.modalProps}
    >
      <AppHostContainer
        host={host}
        onRenderSync={props.onRenderSync}
        onRenderError={props.onRenderError}
      />
    </Panel>
  )
})


type IAppPanelContainerProps = {
  panelProps: IPanelProps
  requestSupplier: Supplier<IRequest>
} & IAppContainerProps

export const AppPanelContainer = observer((props:IAppPanelContainerProps) => {

  const {
    requestSupplier,
    onRenderError,
    onRenderSync,
    launcher,
    router
  } = props
    const _onDismissed = () => {
      requestSupplier.clearValue()
    }
    //const { requestSupplier, onRenderError, onRenderSync, launcher, router } = props
    if (requestSupplier.value) {
      const panelProps: IPanelProps = Object.assign({}, props.panelProps, {
        onDismiss: _onDismissed as IPanelProps["onDismiss"]
      })
      return (
        <AppPanel
          request={requestSupplier.value}
          launcher={launcher}
          router={router}
          onRenderError={onRenderError}
          onRenderSync={onRenderSync}
          panelProps={panelProps}
        />
      )
    }
    return null
  }
)

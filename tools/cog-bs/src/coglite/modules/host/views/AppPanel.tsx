import { IconButton, IModalProps, IPanel, IPanelProps, Panel } from "@uifabric/components"
import { mergeStyleSets } from "@uifabric/styleguide"
import { FontWeights } from "@uifabric/styleguide"
import { theme } from "coglite/shared/theme"
import { IMutableSupplier, IRequest } from "coglite/types"
import { observer } from "mobx-react"
import * as React from "react"
import { AppHost } from "../models/AppHost"
import { IAppContainerProps } from "./AppContainer"
import { AppHostContainer } from "./AppHost"

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
      bottom: 0,
      display: "flex",
      alignItems: "center",
      paddingLeft: 14
    }
  ],
  headerText: [
    "app-panel-header-text",
    {
      fontSize: "17px",
      fontWeight: FontWeights.light,
      color: theme.palette.neutralPrimary,
      lineHeight: 32,
      margin: 0
    }
  ],
  closeButton: ["app-panel-close-button", {}]
})

export interface IAppPanelContainerProps extends IAppContainerProps {
  modalProps?: IModalProps
  requestSupplier: IMutableSupplier<IRequest>
  panelProps?: IPanelProps
  className?: string
}

export interface IAppPanelProps extends IAppContainerProps {
  modalProps?: IModalProps
  request: IRequest
  panelProps?: IPanelProps
  className?: string
}

const PanelNavigation = observer(({ onClick, headerText, ...props }: IPanelProps) => {
  return (
    <div className={AppPanelStylesheet.navigation}>
      <div className={AppPanelStylesheet.header}>
        <p className={AppPanelStylesheet.headerText}>{headerText}</p>
      </div>
      <IconButton
        styles={{
          root: {
            height: "auto",
            width: 44,
            color: theme.palette.neutralSecondary,
            fontSize: "17px"
          },
          rootHovered: {
            color: theme.palette.neutralPrimary
          }
        }}
        className={AppPanelStylesheet.closeButton}
        onClick={onClick as any}
        ariaLabel={props.closeButtonAriaLabel}
        data-is-visible={true}
        iconProps={{ iconName: "Cancel" }}
      />
    </div>
  )
})

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
  const _onClickClose = () => {
    panelRef.current.dismiss()
  }

  const _onRenderNavigation = (props: IPanelProps) => {
    return <PanelNavigation onClick={_onClickClose} headerText={props.headerText} {...props} />
  }
  return (
    <Panel
      {...panelProps}
      isOpen={props.request ? true : false}
      headerText={host.title}
      onRenderHeader={_onRenderHeader}
      onRenderNavigation={_onRenderNavigation}
      isLightDismiss={true}
      ref={panelRef}
      className={AppPanelStylesheet.root}
      modalProps={props.modalProps}
    >
      <AppHostContainer host={host} onRenderSync={props.onRenderSync} onRenderError={props.onRenderError} />
    </Panel>
  )
})

export const AppPanelContainer = observer(({ requestSupplier, onRenderError, onRenderSync, launcher, router, ...props }) => {
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
})

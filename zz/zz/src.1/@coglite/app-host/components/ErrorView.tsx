import { isObject, isString } from "../helpers"
import { observer } from "mobx-react-lite"
import { getTheme, Icon, mergeStyleSets, TooltipHost } from "office-ui-fabric-react"
import * as React from "react"

const theme = getTheme()

const ErrorStylesheet = mergeStyleSets({
  root: ["error", {}],
  compact: [
    "error-compact",
    {
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }
  ],
  message: [
    "error-message",
    {
      fontSize: "14px",
      backgroundColor: theme.palette.redDark,
      color: theme.palette.white,
      padding: "4px 8px"
    }
  ],
  item: [
    "error-item",
    {
      margin: 8,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: theme.palette.redDark
    }
  ],
  itemTitle: [
    "error-item-title",
    {
      fontSize: "12px",
      backgroundColor: theme.palette.redDark,
      color: theme.palette.white,
      padding: "4px 8px"
    }
  ],
  itemValue: [
    "error-item-value",
    {
      fontSize: "12px",
      padding: 8,
      overflow: "auto"
    }
  ]
})

export type IErrorProps = {
  error?: any
  title?: string
} & React.PropsWithChildren<any>

const ErrorItem = observer((props: IErrorProps) => {
  return (
    <div className={ErrorStylesheet.item}>
      <div className={ErrorStylesheet.itemTitle}>{props.title}</div>
      <div className={ErrorStylesheet.itemValue}>{props.children}</div>
    </div>
  )
})

const ErrorMessage = observer((props: IErrorProps) => {
  const error = props.error
  if (error) {
    const message = isString(error)
      ? error
      : error && error.message
      ? error.message
      : "An error has occurred"
    return (
      <div className={ErrorStylesheet.message} key="message">
        {message}
      </div>
    )
  }
  return null
})

const ErrorStack = observer((props: IErrorProps) => {
  const error = props.error
  if (error) {
    let stack = error ? error.stack : null
    if (stack) {
      return (
        <ErrorItem className="stack-item" title="Stack">
          <pre>{stack}</pre>
        </ErrorItem>
      )
    }
  }
  return null
})

const ErrorDetail = observer((props: IErrorProps) => {
  const error = props.error
  if (error) {
    let r: JSX.Element[] = []
    if (isObject(error)) {
      Object.keys(error).forEach((key) => {
        if (key !== "message" && key !== "stack") {
          const value = error[key]
          if (value) {
            let valueContent
            if (isObject(value)) {
              try {
                valueContent = <pre>{JSON.stringify(value, null, "\t")}</pre>
              } catch (err) {}
            } else {
              valueContent = String(value)
            }

            if (valueContent) {
              r.push(
                <ErrorItem key={key} title={key}>
                  <pre>{valueContent}</pre>
                </ErrorItem>
              )
            }
          }
        }
      })
    }
    return <>{r}</>
  }
  return null
})

export const ErrorView = observer((props: IErrorProps) => {
  if (props.error) {
    return (
      <div className={ErrorStylesheet.root} role="error">
        <ErrorMessage {...props} />
        <ErrorStack {...props} />
        <ErrorDetail {...props} />
      </div>
    )
  }
  return null
})

export const CompactError = observer((props: IErrorProps) => {
  var _onRenderTooltipContent = () => {
    return <ErrorView error={props.error} />
  }
  if (props.error) {
    return (
      <div className={ErrorStylesheet.compact}>
        <TooltipHost tooltipProps={{ onRenderContent: _onRenderTooltipContent }}>
          <Icon iconName="Error" />
        </TooltipHost>
      </div>
    )
  }
  return null
})

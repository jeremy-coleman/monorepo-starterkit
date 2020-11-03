import { IAppHost } from "../models/ApplicationHost"

export const createBackItem = (host: IAppHost, fallback?: any, showLabel?: boolean) => {
  if (host.canGoBack) {
    const backRequest = host.backRequest
    const title = backRequest.title ? `Back to ${backRequest.title}` : "Back"
    return {
      key: "back",
      iconProps: {
        iconName: "Back"
      },
      name: showLabel ? title : undefined,
      host: host,
      path: backRequest.path,
      title: title,
      ariaLabel: title,
      onClick: () => {
        host.back()
      }
    }
  }
  return fallback
}

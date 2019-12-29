export const WindowMessagingDefaults = {
  subscribeMessageType: "subscribe",
  unsubscribeMessageType: "unsubscribe"
}

export class WindowMessagingManager {
  private _window: Window
  private _messageEventSources: any[] = []

  constructor(window: Window) {
    this._window = window
  }

  private _onMessage = (event: MessageEvent) => {
    if (event.source !== this._window) {
      const data = event.data
      const idx = this._messageEventSources.indexOf(event.source)
      if (data.type === WindowMessagingDefaults.unsubscribeMessageType && idx >= 0) {
        this._messageEventSources.splice(idx, 1)
      } else if (data.type === WindowMessagingDefaults.subscribeMessageType && idx < 0) {
        this._messageEventSources.push(event.source)
      } else {
        this._messageEventSources.forEach((s) => {
          if (s !== event.source) {
            s.postMessage(data, "*")
          }
        })
      }
    }
  }
  attach() {
    this._window.addEventListener("message", this._onMessage)
  }
  detach() {
    this._window.removeEventListener("message", this._onMessage)
  }
}

export const attachWindowMessaging = (window: Window): WindowMessagingManager => {
  const r = new WindowMessagingManager(window)
  r.attach()
  return r
}

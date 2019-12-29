import { EventEmitter } from "coglite/shared/models/EventEmitter"
import { IRequest } from "coglite/types"
import { AbstractAppHost } from "./AbstractAppHost"

export class AppHost extends AbstractAppHost {
  protected _events: EventEmitter

  get events(): EventEmitter {
    if (!this._events) {
      this._events = new EventEmitter()
    }
    return this._events
  }
  set events(value: EventEmitter) {
    this.setEvents(value)
  }
  setEvents(events: EventEmitter) {
    this._events = events
  }

  // does nothing
  close() {}

  addEventListener(type, handler): void {
    this.events.addEventListener(type, handler)
  }

  removeEventListener(type, handler): void {
    this.events.addEventListener(type, handler)
  }

  emit(event): void {
    this.events.emit(event)
  }

  open(request: IRequest) {
    if (this.launcher) {
      const launchRequest = Object.assign({}, request, { opener: this })
      return Promise.resolve(this.launcher(launchRequest))
    }
    // fall back to load if no launcher configured
    return this.load(request)
  }
}

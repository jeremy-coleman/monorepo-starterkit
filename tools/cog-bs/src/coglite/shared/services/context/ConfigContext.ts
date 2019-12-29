import { IApp, IAppHost, IRouter, IStorageService } from "coglite/types"
import { Context } from "./ContextProvider"

export const ConfigContext = new Context<any>({
  factory() {
    return AppContext.value.config
  }
})

export const AppContext = new Context<IApp>({ id: "app" })

export const HostContext = new Context<IAppHost>({
  factory() {
    return AppContext.value.rootAppHost
  }
})

export const RouterContext = new Context<IRouter>({
  factory() {
    return AppContext.value.router
  }
})

export const StorageServiceContext = new Context<IStorageService>()

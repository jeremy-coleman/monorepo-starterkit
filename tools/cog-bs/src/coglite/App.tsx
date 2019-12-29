import { Fabric } from "@uifabric/components"
import { initializeIcons } from "@uifabric/icons"
import { attachWindowMessaging } from "coglite/shared/services"
import { configure } from "mobx"
import { observer } from "mobx-react"
import * as React from "react"
import { AppRouter } from "./AppRouter"
import { BrowserAppHost } from "./modules/host/models/BrowserAppHost"
import { AppHostContainer } from "./modules/host/views/AppHost"

//import {hot} from 'react-hot-loader'

initializeIcons()
configure({ enforceActions: "never" })
attachWindowMessaging(window)

const host = new BrowserAppHost()
host.setRoot(true)
host.setRouter(AppRouter)
host.window = window
host.publicPath = "/"

export let App = observer(() => {
return <Fabric className="coglite-desktop">
    <AppHostContainer host={host} />
  </Fabric>
})

export default App

//export default hot(module)(App)
// app context config
// ConfigContext.value = AppConfig;
// RouterContext.value = AppRouter;
// HostContext.value = host;

//@ts-ignore
//initializeIcons(AppConfig.fabricIconBasePath);

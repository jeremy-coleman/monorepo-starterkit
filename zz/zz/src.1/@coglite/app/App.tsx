import { AppHostContainer, AppHost } from "@coglite/app-host"
import { configure } from "mobx"
import { Fabric, initializeIcons } from "office-ui-fabric-react"
import React from "react"
import { AppRouter } from "./AppRouter"
import { bootstrapEnv } from "./env"

configure({ enforceActions: "never" })

const host = new AppHost()
host.setRoot(true)
host.router = AppRouter
host.publicPath = "/"
host.window = window
bootstrapEnv()
initializeIcons()

function App() {
  return (
    <Fabric className="coglite-desktop">
      <AppHostContainer host={host} />
    </Fabric>
  )
}

export { App }
export default App
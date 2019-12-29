//import "core-js/stable";
import { mergeStyles } from "@uifabric/styleguide"
//import { Customizer } from "@uifabric/styleguide";
//import { FluentCustomizations } from "@uifabric/styleguide/fluent-theme"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { bootstrapEnv } from "./env"
import App from "./App"

const AppConfig = {
  production: false,
  publicPath: "/",
  buildEnv: "development",
  buildVersion: "DEV",
  buildDate: new Date().toString(),
  env: {
    fabricFontBasePath: "/",
    fabricIconBasePath: "/icons/fabric/",
    configId: "mock"
  }
}

//@ts-ignore
window.AppConfig = AppConfig
bootstrapEnv()

//const el = document.createElement("div");
//document.body.appendChild(el);

var rootDiv = document.getElementById("coglite-app-root")

// Inject some global styles
mergeStyles({
  selectors: {
    ":global(body), :global(html), :global(#app)": {
      margin: 0,
      padding: 0,
      height: "100vh"
    }
  }
})

export const renderApp = (elementId) => {
  let ref = document.getElementById(elementId)
  ReactDOM.render(<App />, ref)
  return ref
}

//renderApp("coglite-app-root")


// ReactDOM.render(
//   <Customizer {...FluentCustomizations}>
//     <NavigationViewSampleApp>
//       <App/>
//     </NavigationViewSampleApp>
//   </Customizer>,
//   rootDiv
// );

//ReactDOM.render(<App/>, rootDiv);

// //or initalizeIcons for all the things
// import { MDIcon } from './layout/MDIcon';
// import { registerIcons } from '@uifabric/styleguide';
// registerIcons({
//   icons: {
//     'Home': <MDIcon icon={'home'} />,
//     'chevrondown': <MDIcon icon={'expand_more'} />,
//     'copy': <MDIcon icon={'file_copy'} />,
//     'checkmark': <MDIcon icon={'check'} />,
//     'globalnavbutton': <MDIcon icon={'menu'} />,
//     'contextmenu': <MDIcon icon={'file_copy'} />,
//   }
// });

import { createTheme, Fabric, loadTheme, mergeStyles } from "office-ui-fabric-react"
import * as React from "react"
import { PageLayout } from "./components"

// const loadGlobalStyles = () => {
//   // global css reset to remove body padding and disable
//   // body scrolling.
//   mergeStyles({
//     selectors: {
//       ":global(body)": {
//         padding: 0,
//         margin: 0,
//         position: "absolute",
//         width: "100%",
//         height: "100%",
//         overflow: "hidden"
//       }
//     }
//   });
// };
// loadGlobalStyles();

const TeamsTheme = createTheme({
  palette: {
    themeDarker: "#323348",
    themeDark: "#464775",
    themeDarkAlt: "#106ebe",
    themePrimary: "#8183b8",
    themeSecondary: "#8082b7",
    themeTertiary: "#71afe5",
    themeLight: "#e7e8f2",
    themeLighter: "#deecf9",
    themeLighterAlt: "#eff6fc",
    neutralLighter: "#f3f2f1"
  }
})
// set theme.
//loadTheme(TeamsTheme);

// Render the page.
export const ChatApp = () => (
  <Fabric>
    <PageLayout />
  </Fabric>
)

export default ChatApp

//render(<App />, document.getElementById("root"));

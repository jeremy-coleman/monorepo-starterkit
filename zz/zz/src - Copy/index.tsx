import 'mobx-react-lite/batchingForReactDom'
import * as React from "react"
import * as ReactDOM from "react-dom"
import {App} from "@coglite/app"


ReactDOM.render(<App />, document.querySelector("#root"))


document.addEventListener("dragover", (event) => {
  event.preventDefault()
})

document.addEventListener("drop", (event) => {
  event.preventDefault()
});


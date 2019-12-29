
import { renderApp } from './coglite/main'
renderApp('coglite-app-root')

var ws = new WebSocket('ws://localhost:3123');

//ws.onmessage(e => console.log(e))

// ws.onopen((e: any) => {
//   console.log('wsopened')
// })

if(module && module["hot"]){module["hot"].accept()}
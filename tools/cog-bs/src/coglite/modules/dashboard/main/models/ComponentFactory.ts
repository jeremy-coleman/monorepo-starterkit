import { when } from "when-switch"
import { Grid } from "./Grid"
import { HSplit, VSplit } from "./Split"
import { Stack } from "./Stack"
import { Window } from "./Window"

type K = "window" | "hsplit" | "vsplit" | "stack" | "grid" | "basic"

const ComponentFactory = (kind: K) => {
  return when(kind)
    .is("window", () => new Window())
    .is("stack", () => new Stack())
    .is("basic", () => new Stack())
    .is("hsplit", () => new HSplit())
    .is("vsplit", () => new VSplit())
    .is("grid", () => new Grid())
    .else(() => new Stack())
}

// // //typed as void? idk
// const ComponentFactory2 = (kind: K) => {
//     switch(kind) {
//         case 'window': () => new Window()
//         case 'stack': () => new Stack()
//         case 'hsplit': () => new HSplit()
//         case 'vsplit': () => new VSplit()
//         case 'grid': () => new Grid()
//         default: () => new Stack()
//     }
// };

// const ComponentFactory3 = (kind: K) => {
//     switch(kind) {
//         case 'window': return new Window()
//         case 'stack': return new Stack()
//         case 'basic': () => new Stack()
//         case 'hsplit': return new HSplit()
//         case 'vsplit': return new VSplit()
//         case 'grid': return new Grid()
//         default: return new Stack()
//     }
// };

export { ComponentFactory }

import { observer } from "mobx-react"
import * as React from "react"
import { when } from "when-switch"
import { GridView } from "./GridView"
import { HSplitView } from "./HSplit"
import { VSplitView } from "./VSplit"
import { StackView } from "./TabStack"

type IComponentView = any | GridView | HSplitView | VSplitView | StackView

const renderView = (comp: IComponentView) => {
  return when(comp && comp.type)
    .is("stack", <StackView stack={comp} />)
    .is("hsplit", <HSplitView hsplit={comp} />)
    .is("vsplit", <VSplitView vsplit={comp} />)
    .is("grid", <GridView grid={comp} />)
    .else(() => <StackView stack={comp} />)
}

type Props = {
  component: IComponentView
}

export const ComponentView = observer(({ component }: Props) => renderView(component))

// import * as React from "react";
// import { IComponent } from "../types/IComponent";
// import { ViewFactoryContext } from "./ViewFactoryContext";

// interface IComponentViewProps {
//     component: IComponent;
// }

// class ComponentView extends React.Component<IComponentViewProps, any> {
//     render() {
//         return (
//             <ViewFactoryContext.Consumer>
//                 {value =>  value.createView(this.props.component)}
//             </ViewFactoryContext.Consumer>
//         );
//     }
// }

// export { IComponentViewProps, ComponentView }

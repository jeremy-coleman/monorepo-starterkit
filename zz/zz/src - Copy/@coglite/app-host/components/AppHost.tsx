import { IAppHost } from "@coglite/app-host";
import { useMount } from "@coglite/react-hooks";
import { observer } from "mobx-react";
import * as React from "react";
import { ErrorView } from "./ErrorView";
import { ReactNode } from "react";


export type IAppHostProps = {
  host?: IAppHost;
  onRenderSync?: (props: IAppHostProps) => JSX.Element | ReactNode
  onRenderError?: (props: IAppHostProps) => JSX.Element| ReactNode
  noLoadOnMount?: boolean;
}

const AppHostError = observer(({host}: IAppHostProps) => {
  useMount(() => {
      host.setTitle("Error");
  })
  return <ErrorView className="app-host-error" error={host.sync.error} />
})


@observer
class AppHostContainerView extends React.Component<IAppHostProps, any> {
  get view() {
    const props = this.props
    const errorRenderer = props.onRenderError 
      ? props.onRenderError(props) 
      : <AppHostError host={props.host} />

    const viewRenderer = props.host.view || null
    
    if(props.host.sync.error) {
      return errorRenderer
    }
    else return viewRenderer
  }

  render() {
    return this.view
  }
}

export const AppHostContainer = observer((props: IAppHostProps) => {
  if (!props.noLoadOnMount) {
    props.host.load();
  }
  return <AppHostContainerView key="view" host={props.host} />;
});


// import { observer } from "mobx-react";
// import * as React from "react";
// import { ErrorView } from "./ErrorView";

// export interface IAppHostProps {
//   host?;
//   onRenderSync?: (props: IAppHostProps) => React.ReactNode;
//   onRenderError?: (props: IAppHostProps) => React.ReactNode;
//   noLoadOnMount?: boolean;
// }

// const renderHostError = (props) => {
//   props.host.setTitle("Error");
//   switch (props.onRenderError) {
//     case true:
//       return props.onRenderError(props);
//     case false:
//       return <ErrorView error={props.host.sync.error} />;
//     default:
//       return <ErrorView error={props.host.sync.error} />;
//   }
// };

// const renderHostView = (props) => {
//   const host = props.host;
//   if (host.sync.error) {
//     return renderHostError(props);
//   }
//   return <>{host.view}</>;
// };


// @observer
// class AppHostContainerView extends React.Component<IAppHostProps, any> {
//   render() {
//     return renderHostView(this.props);
//   }
// }

// export const AppHostContainer = observer((props: IAppHostProps) => {
//   if (!props.noLoadOnMount) {
//     props.host.load();
//   }
//   return <AppHostContainerView key="view" {...props} />;
// });

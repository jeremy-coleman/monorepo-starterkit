import { observer } from "mobx-react";
import * as React from "react";
import { ErrorView } from "./ErrorView";

export interface IAppHostProps {
  host?;
  onRenderSync?: (props: IAppHostProps) => React.ReactNode;
  onRenderError?: (props: IAppHostProps) => React.ReactNode;
  noLoadOnMount?: boolean;
}

const renderHostError = (props) => {
  props.host.setTitle("Error");
  switch (props.onRenderError) {
    case true:
      return props.onRenderError(props);
    case false:
      return <ErrorView error={props.host.sync.error} />;
    default:
      return <ErrorView error={props.host.sync.error} />;
  }
};

const renderHostView = (props) => {
  const host = props.host;
  if (host.sync.error) {
    return renderHostError(props);
  }
  return <>{host.view}</>;
};


@observer
class AppHostContainerView extends React.Component<IAppHostProps, any> {
  render() {
    return renderHostView(this.props);
  }
}

export const AppHostContainer = observer((props: IAppHostProps) => {
  if (!props.noLoadOnMount) {
    props.host.load();
  }
  return <AppHostContainerView key="view" {...props} />;
});

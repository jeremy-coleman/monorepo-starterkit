import { css } from "@fluentui/react"
import { IAppHost } from "@coglite/app-host";
import { SyncComponent } from "@coglite/app-host";
import { observer } from "mobx-react";
import * as React from "react";
import { ComponentRemoveDialog } from "./ComponentRemoveDialog";
import { ComponentView } from "./ComponentView";
import { IDashboard, IWindowManager } from './models';
import { DashboardStylesheet } from "./styles";
import { WindowView } from "./Window";

interface IDashboardProps {
  dashboard: IDashboard;
  className?: string;
  hidden?: boolean;
  host?: IAppHost;
}

const DashboardBlockOverlay: React.FC<{ dashboard: IDashboard; className: string }> = observer(
  ({ dashboard, className }) => {
    return (
      <>
        {dashboard.blockSource && (
          <div
            className={css(className, dashboard.blockSource.type)}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              zIndex: 2
            }}
          />
        )}
      </>
    );
  }
);

export const DashboardPortals = observer((props: IDashboardProps) => {
  return (
    <>
      {props.dashboard.windows.map(w => {
        return <WindowView key={`window-layer-${w.id}`} {...props} window={w} />;
      })}
    </>
  );
});

export const DashboardView = observer((props: IDashboardProps) => {
  let _ref: HTMLDivElement;
  const _onRef = (ref: HTMLDivElement) => {
    _ref = ref;
  };
  const _resizeToViewport = () => {
    if (_ref) {
      const bounds = _ref.getBoundingClientRect();
      props.dashboard.resize(bounds.width, bounds.height);
    }
  };

  const _onHostResize = () => {
    _resizeToViewport();
  };

  const _addHostListener = (host: IAppHost) => {
    if (host) {
      host.addEventListener("resize", _onHostResize);
    }
  };

  const _removeHostListener = (host: IAppHost) => {
    if (host) {
      host.removeEventListener("resize", _onHostResize);
    }
  };

  React.useEffect(() => {
    _addHostListener(props.host);
    _resizeToViewport();
    return () => _removeHostListener(props.host);
  });

  const { dashboard } = props;
  const component = dashboard.component;
  const wm = component && component.isWindowManager ? (component as IWindowManager) : undefined;
  const requiresOverflow = wm ? wm.isRequiresOverflow : false;
  return (
    <div
      id={props.dashboard.id}
      className={css(DashboardStylesheet.root, { hidden: props.hidden })}
      ref={_onRef}
    >
      <DashboardBlockOverlay dashboard={props.dashboard} className={DashboardStylesheet.overlay} />
      <ComponentRemoveDialog />
      <div
        className={css(DashboardStylesheet.content, { overflow: requiresOverflow ? true : false })}
      >
        <DashboardPortals {...props} />
        <ComponentView component={component} />
      </div>
    </div>
  );
});

export const DashboardViewContainer = observer((props: IDashboardProps) => {
  const _onRenderDone = () => {
    return <DashboardView {...props} />;
  };
  return (
    <SyncComponent
      sync={props.dashboard.sync}
      syncLabel="Loading Dashboard..."
      onRenderDone={_onRenderDone}
    />
  );
});

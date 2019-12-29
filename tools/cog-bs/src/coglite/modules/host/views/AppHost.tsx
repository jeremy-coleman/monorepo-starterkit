import { ErrorView } from "coglite/shared/components/common/ErrorView"
import { IAppHost } from "coglite/types"
import { observer } from "mobx-react"
import * as React from "react"

export type IAppHostProps = {
  host: IAppHost
  onRenderSync?: (props: IAppHostProps) => React.ReactElement
  onRenderError?: (props: IAppHostProps) => React.ReactElement
  noLoadOnMount?: boolean
} & React.DOMAttributes<any>

const AppHostContainerView = observer((props: IAppHostProps) => {
  if (props.host.sync.error) {
    return props.onRenderError ? props.onRenderError(props) : <ErrorView error={props.host.sync.error} />
  }
  return props.host.view || null
})

const AppHostContainerSync = observer((props: IAppHostProps) => {
  if (props.host.sync.syncing && props.onRenderSync) {
    return props.onRenderSync(props)
  }
  return null
})

export const AppHostContainer = observer((props: IAppHostProps) => {
  React.useEffect(() => {
    if (!props.noLoadOnMount) {
      props.host.load()
    }
  })
  return (
    <div>
      <AppHostContainerSync {...props} />
      <AppHostContainerView {...props} />
    </div>
  )
})

// const AppHostError = (props : IAppHostProps) => {
//     React.useEffect(() => {
//         props.host.title = "Error";
//     });

//     const error = props.host.sync.error;
//     return (
//         <div style={{ color: "red" }}>
//             <h3>An Error has occurred</h3>
//             {error.message && (
//                 <div style={{ paddingTop: 8 }}>{error.message}</div>
//             )}
//             {error.stack && (
//                 <div style={{ paddingTop: 8 }}>{error.stack}</div>
//             )}
//         </div>
//     );
// };

// import { observer, useObserver } from 'mobx-react-lite';
// import * as React from 'react';
// import { ErrorView } from './Error';

// export interface IAppHostProps {
//     host?;
//     onRenderSync?: (props : IAppHostProps) => React.ReactNode;
//     onRenderError?: (props : IAppHostProps) => React.ReactNode;
//     noLoadOnMount?: boolean;
// }

// let AppHostContainerView = observer((props:IAppHostProps) => {
//     return<React.Fragment>
//             {   props.host.sync.error && props.onRenderError && props.onRenderError(props) }
//             {   props.host.sync.error && <ErrorView error={props.host.sync.error} /> }
//             {   !props.host.sync.error && props.host.view }
//         </React.Fragment>

// })

// export const AppHostContainer = (props: IAppHostProps) => {
//     if(!props.noLoadOnMount) {props.host.load()}
//     return useObserver(() => <AppHostContainerView key="view" {...props} />)
// };

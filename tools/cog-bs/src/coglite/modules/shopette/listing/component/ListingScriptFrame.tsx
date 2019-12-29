
import { IAppHostBaseProps, IListing, IRequest, IUserProfile } from "coglite/types"
import * as React from "react"

import { ShopettePathsContext } from "../../PathsContext"
import { ScriptFrame } from "coglite/modules/host/views"

interface IListingScriptFrameProps extends IAppHostBaseProps {
  listing: IListing
  defaultRequest?: IRequest
  userProfile?: IUserProfile
}

class ListingScriptFrame extends React.Component<IListingScriptFrameProps, any> {
  private _launchApp = (request) => {
    return this.props.host.open({
      path: ShopettePathsContext.value.listingLaunch(this.props.listing.id),
      transient: request.transient,
      makeActive: request.makeActive,
      params: {
        defaultRequest: request
      }
    })
  }
  render() {
    return (
      <ScriptFrame
        host={this.props.host}
        src={this.props.listing.launch_url}
        launcher={this._launchApp}
        defaultRequest={this.props.defaultRequest}
        userProfile={this.props.userProfile}
      />
    )
  }
}

export { IListingScriptFrameProps, ListingScriptFrame }


import { IAppHostBaseProps, IListing } from "coglite/types"
import * as React from "react"
import { AppFrame } from "coglite/modules/host/views"

interface IListingAppFrameProps extends IAppHostBaseProps {
  listing: IListing
}

class ListingAppFrame extends React.Component<IListingAppFrameProps, any> {
  render() {
    return <AppFrame host={this.props.host} src={this.props.listing.launch_url} />
  }
}

export { IListingAppFrameProps, ListingAppFrame }

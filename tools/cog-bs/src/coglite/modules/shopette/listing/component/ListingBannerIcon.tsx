import { IListing } from "coglite/types"
import { Persona, PersonaSize } from "@uifabric/components"
import * as React from "react"

interface IListingBannerIconProps {
  listing: IListing
}

class ListingBannerIcon extends React.Component<IListingBannerIconProps, any> {
  render() {
    return (
      <Persona
        hidePersonaDetails
        text={this.props.listing.title}
        imageUrl={this.props.listing.banner_icon ? this.props.listing.banner_icon.url : undefined}
        size={PersonaSize.extraLarge}
      />
    )
  }
}

export { IListingBannerIconProps, ListingBannerIcon }

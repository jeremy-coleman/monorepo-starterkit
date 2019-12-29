import { IListingModelSupplier } from "coglite/types"
import { Icon } from "@uifabric/components"
import { Image } from "@uifabric/components"
import { Spinner, SpinnerSize } from "@uifabric/components"
import * as React from "react"

const renderIcon = (listingSupplier: IListingModelSupplier) => {
  let icon
  if (listingSupplier.sync.syncing) {
    icon = <Spinner size={SpinnerSize.small} />
  } else if (listingSupplier.sync.error) {
    icon = <Icon iconName="Error" />
  } else if (listingSupplier.value.small_icon && listingSupplier.value.small_icon.url) {
    icon = <Image src={listingSupplier.value.small_icon.url} width={16} height={16} />
  } else {
    icon = <Icon iconName="Puzzle" />
  }
  return icon
}

export { renderIcon }

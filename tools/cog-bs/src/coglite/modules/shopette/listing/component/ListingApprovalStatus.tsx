import { IListing } from "coglite/types"
import { getTheme } from "@uifabric/styleguide"
import { observer } from "mobx-react"
import { Icon } from "@uifabric/components"
import * as React from "react"

import { ListingApprovalStatus as ListingApprovalStatusEnum } from "../constants"

interface IListingApprovalStatusProps {
  listing: IListing
}

@observer
class ListingApprovalStatusIcon extends React.Component<IListingApprovalStatusProps, any> {
  render() {
    const theme = getTheme()
    const { listing } = this.props
    if (listing.approval_status === ListingApprovalStatusEnum.IN_PROGRESS) {
      return (
        <Icon iconName="ProgressRingDots" ariaLabel="In Progress" title="In Progress" styles={{ root: { color: theme.palette.blue } }} />
      )
    } else if (listing.approval_status === ListingApprovalStatusEnum.DELETED) {
      return <Icon iconName="Delete" ariaLabel="Deleted" title="Deleted" styles={{ root: { color: theme.semanticColors.errorText } }} />
    } else if (listing.approval_status === ListingApprovalStatusEnum.REJECTED) {
      return <Icon iconName="Blocked" ariaLabel="Rejected" title="Rejected" styles={{ root: { color: theme.semanticColors.errorText } }} />
    } else if (listing.approval_status === ListingApprovalStatusEnum.PENDING) {
      return <Icon iconName="BuildQueue" ariaLabel="Pending" title="Pending" styles={{ root: { color: theme.palette.blue } }} />
    } else if (listing.approval_status === ListingApprovalStatusEnum.APPROVED) {
      return <Icon iconName="BoxCheckmarkSolid" ariaLabel="Approved" title="Approved" styles={{ root: { color: theme.palette.green } }} />
    }
    return null
  }
}

@observer
class ListingApprovalStatusText extends React.Component<IListingApprovalStatusProps, any> {
  render() {
    const { listing } = this.props
    if (listing.approval_status === ListingApprovalStatusEnum.IN_PROGRESS) {
      return "In Progress"
    } else if (listing.approval_status === ListingApprovalStatusEnum.DELETED) {
      return "Deleted"
    } else if (listing.approval_status === ListingApprovalStatusEnum.REJECTED) {
      return "Rejected"
    } else if (listing.approval_status === ListingApprovalStatusEnum.PENDING) {
      return "Pending"
    } else if (listing.approval_status === ListingApprovalStatusEnum.APPROVED) {
      return "Approved"
    }
  }
}

class ListingApprovalStatusComponent extends React.Component<IListingApprovalStatusProps, any> {
  render() {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <ListingApprovalStatusIcon {...this.props} />
        <div style={{ marginLeft: 4 }}>
          <ListingApprovalStatusText {...this.props} />
        </div>
      </div>
    )
  }
}

export { IListingApprovalStatusProps, ListingApprovalStatusIcon, ListingApprovalStatusText, ListingApprovalStatusComponent }

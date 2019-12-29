import { IListingModel } from "coglite/types"
import { observer } from "mobx-react"
import { CommandBarButton, IButtonProps, IContextualMenuItem, IIconProps } from "@uifabric/components"
import * as React from "react"
import { ListingApprovalStatus } from "../constants"

interface IListingCommandBarButtonProps {
  listing: IListingModel
  onClick?: (props: IListingCommandBarButtonProps) => void
  iconProps?: IIconProps
  buttonProps?: IButtonProps
}

@observer
class ListingCommandBarButton extends React.Component<IListingCommandBarButtonProps, any> {
  private _onClick = () => {
    this.props.onClick(this.props)
  }
  render() {
    const { listing } = this.props
    if (
      this.props.onClick &&
      !listing.loadSync.syncing &&
      !listing.loadSync.error &&
      this.props.listing.approval_status !== ListingApprovalStatus.DELETED
    ) {
      return (
        <CommandBarButton
          {...this.props.buttonProps}
          iconProps={this.props.iconProps}
          onClick={this._onClick}
          disabled={listing.saveSync.syncing}
        >
          {this.props.children}
        </CommandBarButton>
      )
    }
    return null
  }
}

const listingMenuItem = (
  props: IListingCommandBarButtonProps,
  key: string,
  ButtonType: React.ComponentClass<IListingCommandBarButtonProps> = ListingCommandBarButton
): IContextualMenuItem => {
  return {
    key: key,
    onRender(item) {
      return <ButtonType key={item.key} {...props} />
    }
  }
}

@observer
class ListingApproveButton extends React.Component<IListingCommandBarButtonProps, any> {
  render() {
    const { listing } = this.props
    if (listing.approval_status === ListingApprovalStatus.PENDING) {
      return (
        <ListingCommandBarButton {...this.props} iconProps={{ iconName: "Accept" }}>
          Approve
        </ListingCommandBarButton>
      )
    }
    return null
  }
}

const listingApproveMenuItem = (props: IListingCommandBarButtonProps, key: string = "listingApprove"): IContextualMenuItem => {
  return listingMenuItem(props, key, ListingApproveButton)
}

@observer
class ListingRejectButton extends React.Component<IListingCommandBarButtonProps, any> {
  render() {
    const { listing } = this.props
    if (listing.approval_status === ListingApprovalStatus.PENDING) {
      return (
        <ListingCommandBarButton {...this.props} iconProps={{ iconName: "Cancel" }}>
          Reject
        </ListingCommandBarButton>
      )
    }
    return null
  }
}

const listingRejectMenuItem = (props: IListingCommandBarButtonProps, key: string = "listingReject"): IContextualMenuItem => {
  return listingMenuItem(props, key, ListingRejectButton)
}

class ListingEditButton extends React.Component<IListingCommandBarButtonProps, any> {
  render() {
    return (
      <ListingCommandBarButton {...this.props} iconProps={{ iconName: "Edit" }}>
        Edit
      </ListingCommandBarButton>
    )
  }
}

const listingEditMenuItem = (props: IListingCommandBarButtonProps, key: string = "listingEdit"): IContextualMenuItem => {
  return listingMenuItem(props, key, ListingEditButton)
}

@observer
class ListingWorkflowSubmitButton extends React.Component<IListingCommandBarButtonProps, any> {
  render() {
    if (this.props.listing.canSubmit) {
      return (
        <ListingCommandBarButton {...this.props} iconProps={{ iconName: "Workflow" }}>
          Submit for Approval
        </ListingCommandBarButton>
      )
    }
    return null
  }
}

const listingWorkflowSubmitMenuItem = (
  props: IListingCommandBarButtonProps,
  key: string = "listingWorkflowSubmit"
): IContextualMenuItem => {
  return listingMenuItem(props, key, ListingWorkflowSubmitButton)
}

class ListingDeleteButton extends React.Component<IListingCommandBarButtonProps, any> {
  render() {
    return (
      <ListingCommandBarButton {...this.props} iconProps={{ iconName: "Delete" }}>
        Delete
      </ListingCommandBarButton>
    )
  }
}

const listingDeleteMenuItem = (props: IListingCommandBarButtonProps, key: string = "listingDelete"): IContextualMenuItem => {
  return listingMenuItem(props, key, ListingDeleteButton)
}

class ListingSaveButton extends React.Component<IListingCommandBarButtonProps, any> {
  render() {
    return (
      <ListingCommandBarButton {...this.props} iconProps={{ iconName: "Save" }}>
        Save
      </ListingCommandBarButton>
    )
  }
}

const listingSaveMenuItem = (props: IListingCommandBarButtonProps, key: string = "listingSave"): IContextualMenuItem => {
  return listingMenuItem(props, key, ListingSaveButton)
}

class ListingEditCancelButton extends React.Component<IListingCommandBarButtonProps, any> {
  render() {
    return (
      <ListingCommandBarButton {...this.props} iconProps={{ iconName: "Cancel" }}>
        Cancel
      </ListingCommandBarButton>
    )
  }
}

const listingEditCancelMenuItem = (props: IListingCommandBarButtonProps, key: string = "listingEditCancel"): IContextualMenuItem => {
  return listingMenuItem(props, key, ListingEditCancelButton)
}

export {
  IListingCommandBarButtonProps,
  ListingCommandBarButton,
  listingMenuItem,
  ListingRejectButton,
  listingRejectMenuItem,
  ListingApproveButton,
  listingApproveMenuItem,
  ListingEditButton,
  listingEditMenuItem,
  ListingWorkflowSubmitButton,
  listingWorkflowSubmitMenuItem,
  ListingDeleteButton,
  listingDeleteMenuItem,
  ListingSaveButton,
  listingSaveMenuItem,
  ListingEditCancelButton,
  listingEditCancelMenuItem
}

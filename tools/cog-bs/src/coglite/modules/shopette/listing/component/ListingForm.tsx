import { BoundCheckbox, BoundTextField, ImageField, SyncComponent, SyncOverlay, ValidationErrors } from "coglite/shared/components"
import { IImage, IListingModel } from "coglite/types"

import { observer } from "mobx-react"
import { DefaultButton, Dropdown, ICheckboxStyles, IDropdownOption, PrimaryButton, Spinner, SpinnerSize } from "@uifabric/components"
import * as React from "react"
import { ListingApprovalStatus } from "../constants"
import { CategoryListStore, ListingTypeListStore } from "../stores"
import { ListingLinkForm } from "./ListingLinkForm"
import { ListingSyncError } from "./ListingSyncError"
import { IListingUploadProps, ListingUpload } from "./ListingUpload"
import { IStyle, memoizeFunction, concatStyleSets, mergeStyleSets } from "@uifabric/styleguide"
import { ITheme, getTheme } from "@uifabric/styleguide"

interface IListingFormStyles {
  root?: IStyle
  editor?: IStyle
  section?: IStyle
  sectionTitle?: IStyle
  sectionBody?: IStyle
  actions?: IStyle
}

const defaultStyles = (theme: ITheme): IListingFormStyles => {
  return {
    root: {
      position: "relative",
      padding: 10
    },
    editor: {},
    section: {},
    sectionTitle: {
      fontSize: "16px",
      margin: 0,
      paddingTop: 16,
      paddingBottom: 16
    },
    sectionBody: {},
    actions: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      selectors: {
        ".action+.action": {
          marginLeft: 8
        }
      }
    }
  }
}

const Defaults = {
  styles: defaultStyles
}

const getStyles = memoizeFunction(
  (theme?: ITheme, customStyles?: IListingFormStyles | undefined): IListingFormStyles => {
    if (!theme) {
      theme = getTheme()
    }
    return concatStyleSets(Defaults.styles(theme), customStyles)
  }
)

interface IListingFormClassNames {
  root?: string
  editor?: string
  section?: string
  sectionTitle?: string
  sectionBody?: string
  actions?: string
}

const getClassNames = memoizeFunction((styles: IListingFormStyles, className?: string) => {
  return mergeStyleSets({
    root: ["listing-form", className, styles.root],
    editor: ["listing-form-editor", styles.editor],
    section: ["listing-form-section", styles.section],
    sectionTitle: ["listing-form-section-title", styles.sectionTitle],
    sectionBody: ["listing-form-section-body", styles.sectionBody],
    actions: ["app-listing-form-actions", styles.actions]
  })
})


interface IListingFormProps {
  listing: IListingModel
  onCancel?: () => void
  onSave?: (listing: IListingModel) => void
  onSubmitForApproval?: (listing: IListingModel) => void
  styles?: IListingFormStyles
  className?: string
  onAfterUpload?: (props: IListingUploadProps) => void
}

interface IListingFormSectionProps {
  title: string
  className?: string
  titleClassName?: string
  bodyClassName?: string
}

class ListingFormSection extends React.Component<IListingFormSectionProps, any> {
  render() {
    return (
      <div className={this.props.className}>
        <h5 className={this.props.titleClassName}>{this.props.title}</h5>
        <div className={this.props.bodyClassName}>{this.props.children}</div>
      </div>
    )
  }
}

@observer
class ListingImagesEditor extends React.Component<IListingFormProps, any> {
  private _onSmallIconChanged = (smallIcon: IImage) => {
    this.props.listing.setSmallIcon(smallIcon)
  }
  private _onLargeIconChanged = (largeIcon: IImage) => {
    this.props.listing.setLargeIcon(largeIcon)
  }
  private _onBannerIconChanged = (bannerIcon: IImage) => {
    this.props.listing.setBannerIcon(bannerIcon)
  }
  private _onLargeBannerIconChanged = (largeBannerIcon: IImage) => {
    this.props.listing.setLargeBannerIcon(largeBannerIcon)
  }
  render() {
    const inputDisabled = this.props.listing.saveSync.syncing
    return (
      <div>
        <ImageField
          disabled={inputDisabled}
          onChange={this._onSmallIconChanged}
          image={this.props.listing.small_icon}
          defaultSelectText="Select Small Icon..."
          label="Small Icon"
          width={16}
          height={16}
        />
        <ImageField
          disabled={inputDisabled}
          onChange={this._onLargeIconChanged}
          image={this.props.listing.large_icon}
          defaultSelectText="Select Large Icon..."
          label="Large Icon"
          width={32}
          height={32}
        />
        <ImageField
          disabled={inputDisabled}
          onChange={this._onBannerIconChanged}
          image={this.props.listing.banner_icon}
          defaultSelectText="Select Banner Icon..."
          label="Banner Icon"
          width={220}
          height={137}
        />
        <ImageField
          disabled={inputDisabled}
          onChange={this._onLargeBannerIconChanged}
          image={this.props.listing.large_banner_icon}
          defaultSelectText="Select Large Banner Icon..."
          label="Large Banner Icon"
          width={1200}
          height={900}
        />
      </div>
    )
  }
}

@observer
class ListingCategorySelector extends React.Component<IListingFormProps, any> {
  componentWillMount() {
    CategoryListStore.load()
  }
  private _onChange = (option: IDropdownOption, index: number) => {
    if (option.selected) {
      this.props.listing.addCategory(option.data)
    } else {
      this.props.listing.removeCategory(option.data)
    }
  }
  render() {
    const options: IDropdownOption[] = []
    if (CategoryListStore.sync.syncing) {
      options.push({
        key: "loading",
        text: "Loading Categories..."
      })
    } else {
      CategoryListStore.itemsView.forEach((c) => {
        options.push({
          key: String(c.title),
          text: c.title,
          data: c
        })
      })
    }
    const selectedKeys = this.props.listing.categories.map((c) => String(c.title))
    return (
      <Dropdown
        label="Categories"
        options={options}
        onChanged={this._onChange}
        selectedKeys={selectedKeys}
        multiSelect
        disabled={CategoryListStore.sync.syncing || this.props.listing.saveSync.syncing}
      />
    )
  }
}

@observer
class ListingTypeSelector extends React.Component<IListingFormProps, any> {
  componentWillMount() {
    ListingTypeListStore.load()
  }
  private _onChange = (option: IDropdownOption, index: number) => {
    this.props.listing.setListingType(option.data)
  }
  render() {
    const options: IDropdownOption[] = []
    if (ListingTypeListStore.sync.syncing) {
      options.push({
        key: "loading",
        text: "Loading Listing Types..."
      })
    } else {
      ListingTypeListStore.itemsView.forEach((t) => {
        options.push({
          key: String(t.title),
          text: t.title,
          data: t
        })
      })
    }
    const selectedKey = this.props.listing.listing_type ? this.props.listing.listing_type.title : undefined
    return (
      <Dropdown
        label="Listing Type"
        options={options}
        onChanged={this._onChange}
        selectedKey={selectedKey}
        disabled={ListingTypeListStore.sync.syncing || this.props.listing.saveSync.syncing}
      />
    )
  }
}

@observer
class ListingEditor extends React.Component<IListingFormProps, any> {
  render() {
    const { listing, styles, className } = this.props
    const classNames = getClassNames(getStyles(null, styles), className)
    const inputDisabled = this.props.listing.saveSync.syncing
    const cbStyles: ICheckboxStyles = {
      root: {
        marginTop: 8
      }
    }
    const validationErrors = listing.validationErrors
    const approvalStatus = listing.approval_status
    return (
      <div className={classNames.editor}>
        <BoundTextField
          label="Title"
          disabled={inputDisabled}
          required
          binding={{ target: listing, key: "title" }}
          errors={validationErrors}
        />
        <BoundTextField
          label="Unique Name"
          disabled={inputDisabled}
          required
          binding={{ target: listing, key: "unique_name" }}
          errors={validationErrors}
        />
        <BoundTextField
          label="Short Description"
          disabled={inputDisabled}
          required={approvalStatus !== ListingApprovalStatus.IN_PROGRESS}
          binding={{ target: listing, key: "description_short" }}
          errors={validationErrors}
        />
        <BoundTextField
          label="Description"
          disabled={inputDisabled}
          multiline={true}
          rows={6}
          resizable={false}
          required={approvalStatus !== ListingApprovalStatus.IN_PROGRESS}
          binding={{ target: listing, key: "description" }}
          errors={validationErrors}
        />
        <ListingTypeSelector {...this.props} />
        <BoundTextField
          label="Launch URL"
          disabled={inputDisabled}
          required={approvalStatus !== ListingApprovalStatus.IN_PROGRESS}
          binding={{ target: listing, key: "launch_url" }}
          errors={validationErrors}
        />
        <BoundTextField
          label="Version"
          binding={{ target: listing, key: "version_name" }}
          disabled={inputDisabled}
          errors={validationErrors}
        />
        <BoundTextField
          label="Security"
          binding={{ target: listing, key: "security_marking" }}
          disabled={inputDisabled}
          errors={validationErrors}
        />
        <ListingCategorySelector {...this.props} />
        <ListingFormSection
          title="Images"
          className={classNames.section}
          titleClassName={classNames.sectionTitle}
          bodyClassName={classNames.sectionBody}
        >
          <ListingImagesEditor {...this.props} />
        </ListingFormSection>
        <ListingFormSection
          title="Documents"
          className={classNames.section}
          titleClassName={classNames.sectionTitle}
          bodyClassName={classNames.sectionBody}
        >
          <ListingLinkForm listing={listing} />
        </ListingFormSection>
        <ListingFormSection
          title="Settings"
          className={classNames.section}
          titleClassName={classNames.sectionTitle}
          bodyClassName={classNames.sectionBody}
        >
          <BoundCheckbox binding={{ target: listing, key: "is_featured" }} label="Featured" disabled={inputDisabled} styles={cbStyles} />
          <BoundCheckbox binding={{ target: listing, key: "is_enabled" }} label="Enabled" disabled={inputDisabled} styles={cbStyles} />
          <BoundCheckbox binding={{ target: listing, key: "is_private" }} label="Private" disabled={inputDisabled} styles={cbStyles} />
          <BoundCheckbox
            binding={{ target: listing, key: "iframe_compatible" }}
            label="Iframe Compatible"
            disabled={inputDisabled}
            styles={cbStyles}
          />
        </ListingFormSection>
      </div>
    )
  }
}

@observer
class ListingSaveAction extends React.Component<IListingFormProps, any> {
  private _onClick = () => {
    this.props.onSave(this.props.listing)
  }
  private _onRenderSyncIcon = () => {
    return <Spinner size={SpinnerSize.small} />
  }
  render() {
    const syncing = this.props.listing.saveSync.syncing
    const syncSave = this.props.listing.saveSync.type === "save"
    return (
      <PrimaryButton
        className="action save-action"
        onClick={this._onClick}
        iconProps={syncing && syncSave ? undefined : { iconName: "Save" }}
        onRenderIcon={syncing && syncSave ? this._onRenderSyncIcon : undefined}
        disabled={syncing}
      >
        {syncing && syncSave ? "Saving..." : "Save"}
      </PrimaryButton>
    )
  }
}

@observer
class ListingSubmitAction extends React.Component<IListingFormProps, any> {
  private _onClick = () => {
    this.props.onSubmitForApproval(this.props.listing)
  }
  private _onRenderSyncIcon = () => {
    return <Spinner size={SpinnerSize.small} />
  }
  render() {
    const { listing } = this.props
    if (listing.canSubmit) {
      const syncing = listing.saveSync.syncing
      const syncSubmit = listing.saveSync.type === "submit"
      return (
        <PrimaryButton
          className="action submit-action"
          onClick={this._onClick}
          iconProps={syncing && syncSubmit ? undefined : { iconName: "WorkFlow" }}
          onRenderIcon={syncing && syncSubmit ? this._onRenderSyncIcon : undefined}
          disabled={syncing}
          title="Submit for Approval"
        >
          {syncing && syncSubmit ? "Submitting for Approval..." : "Submit for Approval"}
        </PrimaryButton>
      )
    }
    return null
  }
}

@observer
class ListingCancelAction extends React.Component<IListingFormProps, any> {
  private _onClick = () => {
    this.props.listing.reset()
    if (this.props.onCancel) {
      this.props.onCancel()
    }
  }
  render() {
    return (
      <DefaultButton className="action cancel-action" onClick={this._onClick} disabled={this.props.listing.saveSync.syncing}>
        Cancel
      </DefaultButton>
    )
  }
}

class ListingActions extends React.Component<IListingFormProps, any> {
  render() {
    const styles = getStyles(undefined, this.props.styles)
    return (
      <div className={getClassNames(styles).actions}>
        {this.props.onCancel ? <ListingCancelAction {...this.props} /> : undefined}
        {this.props.onSave ? <ListingSaveAction {...this.props} /> : undefined}
        {this.props.onSubmitForApproval ? <ListingSubmitAction {...this.props} /> : undefined}
      </div>
    )
  }
}

@observer
class ListingValidationErrors extends React.Component<IListingFormProps, any> {
  render() {
    return <ValidationErrors errors={this.props.listing.validationErrors} styles={{ root: { marginBottom: 8 } }} />
  }
}

class ListingForm extends React.Component<IListingFormProps, any> {
  render() {
    const styles = getStyles(undefined, this.props.styles)
    return (
      <div className={getClassNames(styles).root}>
        <ListingValidationErrors {...this.props} />
        <ListingSyncError {...this.props} sync={this.props.listing.saveSync} />
        <SyncOverlay sync={this.props.listing.saveSync} syncLabel="Saving..." />
        <ListingUpload listing={this.props.listing} onAfterUpload={this.props.onAfterUpload} />
        <div style={{ marginTop: 8 }}>
          <ListingEditor {...this.props} />
        </div>
        <ListingActions {...this.props} />
      </div>
    )
  }
}

interface IListingFormContainerProps {
  listing: IListingModel
  onSave?: (listing: IListingModel) => void
  onSubmitForApproval?: (listing: IListingModel) => void
  onCancel?: () => void
}

class ListingFormContainer extends React.Component<IListingFormContainerProps, any> {
  componentWillMount() {
    this.props.listing.load()
  }
  private _onRenderDone = () => {
    return (
      <ListingForm
        listing={this.props.listing}
        onCancel={this.props.onCancel}
        onSave={this.props.onSave}
        onSubmitForApproval={this.props.onSubmitForApproval}
      />
    )
  }
  render() {
    return <SyncComponent sync={this.props.listing.loadSync} onRenderDone={this._onRenderDone} />
  }
}


export { IListingFormClassNames }
export { IListingFormStyles }
export { IListingFormContainerProps, IListingFormProps, ListingEditor, ListingForm, ListingFormContainer }




import { ContextualMenuItemType, IContextualMenuItem, Persona } from "@uifabric/components"
import { concatStyleSets, IStyle, memoizeFunction, mergeStyleSets } from "@uifabric/styleguide"
import { FontWeights, getTheme, ITheme } from "@uifabric/styleguide"
import axios from "libs/axios"
import { HostAppView, IHostAppViewProps } from "coglite/modules/host/views"
import { SyncComponent } from "coglite/shared/components"
import { SyncSupplier } from "coglite/shared/models/SyncSupplier"
import { IRequest, IRequestHandler, IRouter, Router } from "coglite/shared/router"
import { Context } from "coglite/shared/services"
import { equalsIgnoreCase, isBlank, isNotBlank, trim } from "coglite/shared/util"
import { IAppHost, IAppProps, IBasicAuthCredentials, IListing, IListingUserAccess, IPredicateFunc, IStorageService, ISyncSupplier } from "coglite/types"
import { observer } from "mobx-react"
import * as React from "react"



const Defaults = {
  baseUrl: "/api",
  auth: undefined
}

interface IGetUsersRequest {
  offset?: number
  limit?: number
}

// interface IUserService {
//   getUsers(request?: IGetUsersRequest): Promise<IUser[]>
//   getUserProfile(): Promise<IUserProfile>
// }

interface IUserProfile {
  id?: number
  display_name?: string
  bio?: string
  user?: IUser
}

interface IGetUserDataRequest {
  key: string
}

interface IUserDataService {
  listUserData(): Promise<IUserData[]>
  getUserData(request: IGetUserDataRequest): Promise<IUserData>
  setUserData(data: IUserData): Promise<any>
  deleteUserData(data: IUserData): Promise<any>
}
interface IUserData {
  username?: string
  key?: string
  entity?: string
  content_type?: string
  version?: string
}

interface IUser {
  username?: string
  email?: string
  groups?: IGroup[]
}
interface IGroup {
  name?: string
}



const defaultAdminCheck = (userProfile: IUserProfile) =>
  userProfile &&
  userProfile.user &&
  userProfile.user.groups &&
  userProfile.user.groups.some((g) => {
    return equalsIgnoreCase(g.name, "admin")
  })

const UserAdminContext = new Context<IPredicateFunc<IUserProfile>>({
  value: defaultAdminCheck
})




const isMemberOfGroup = (userProfile: IUserProfile, group: string): boolean => {
  return (
    isBlank(group) ||
    (userProfile && userProfile.user && userProfile.user.groups && userProfile.user.groups.some((g) => equalsIgnoreCase(g.name, group)))
  )
}


const injectUserProfile = (userProfileSupplier: ISyncSupplier<IUserProfile> = UserProfileStore): IRequestHandler => {
  return (req: IRequest, next?: IRequestHandler) => {
    if (!req.userProfile) {
      return userProfileSupplier.load().then(() => {
        if (userProfileSupplier.sync.error) {
          return Promise.reject(userProfileSupplier.sync.error)
        }
        const nextReq = Object.assign({}, req, {
          userProfile: userProfileSupplier.value
        })
        return next(nextReq)
      })
    }
    return next()
  }
}

const userProfileFilter = (filter: IPredicateFunc<IUserProfile>, userProfileSupplier: ISyncSupplier<IUserProfile> = UserProfileStore) => {
  return (req: IRequest, next?: IRequestHandler): Promise<any> | any => {
    return userProfileSupplier.load().then(() => {
      if (userProfileSupplier.sync.error) {
        return Promise.reject(userProfileSupplier.sync.error)
      }
      const match = filter(userProfileSupplier.value)
      if (!match) {
        throw {
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
          request: req
        }
      }
      return next()
    })
  }
}

const userProfileFilterRouter = (
  filter: IPredicateFunc<IUserProfile>,
  router: IRouter | IRequestHandler,
  userProfileSupplier: ISyncSupplier<IUserProfile> = UserProfileStore
): IRouter => {
  const r = new Router()
  r.use(userProfileFilter(filter, userProfileSupplier))
  r.use(router)
  return r
}

const requiresGroup = (group: string, userProfileSupplier: ISyncSupplier<IUserProfile> = UserProfileStore): IRequestHandler => {
  return userProfileFilter((userProfile) => {
    return isMemberOfGroup(userProfile, group)
  }, userProfileSupplier)
}

const requiresGroupRouter = (
  group: string,
  router: IRouter | IRequestHandler,
  userProfileSupplier: ISyncSupplier<IUserProfile> = UserProfileStore
): IRouter => {
  const r = new Router()
  r.use(requiresGroup(group, userProfileSupplier))
  r.use(router)
  return r
}

const isAuthorised = (reqAuthGroup: string, userProfile: IUserProfile): boolean => {
  return (
    isBlank(reqAuthGroup) ||
    (userProfile && userProfile.user && userProfile.user.groups && userProfile.user.groups.some((group) => group.name == reqAuthGroup))
  )
}

const requiresUser = (): IRequestHandler => {
  return (req: IRequest, next?: IRequestHandler) => {
    if (!req.userProfile) {
      return UserProfileStore.load().then(() => {
        const nextReq = Object.assign({}, req, {
          userProfile: UserProfileStore.value
        })
        return next(nextReq)
      })
    }
    return next()
  }
}

const requiresAuth = (reqAuthGroup: string): IRequestHandler => {
  return (req: IRequest, next?: IRequestHandler): Promise<any> | any => {
    return UserProfileStore.load().then(() => {
      if (!isAuthorised(reqAuthGroup, UserProfileStore.value)) {
        throw {
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
          request: req
        }
      }
      return next()
    })
  }
}

const requiresAuthHandler = (reqAuthGroup: string, handler: IRequestHandler) => {
  return (req: IRequest, next?: IRequestHandler): Promise<any> | any => {
    return UserProfileStore.load().then(() => {
      if (!isAuthorised(reqAuthGroup, UserProfileStore.value)) {
        throw {
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
          request: req
        }
      }
      return handler(req, next)
    })
  }
}




const defaultUserListingAccess = (listing: IListing, userProfile: IUserProfile) => {
  if (listing && isNotBlank(listing.security_marking)) {
    const listingGroups = listing.security_marking.split(",").map((s) => trim(s))
    return listingGroups.some((lg) => {
      return isMemberOfGroup(userProfile, lg)
    })
  }
  return true
}

const UserListingAccessContext = new Context<IListingUserAccess>({
  value: defaultUserListingAccess
})





const UserProfileStore = new SyncSupplier<IUserProfile>()
UserProfileStore.loader = () => {
  return UserServiceContext.value.getUserProfile()
}



const UserServiceContext = new Context<IUserService>()



type IUserService = {
  getUsers(request?): Promise<any[]>
  getUserProfile(): Promise<any>
}

const MockUserProfile: IUserProfile = {
  id: 1,
  display_name: "Mock User",
  bio: "Mock User Bio",
  user: {
    username: "mock",
    email: "mock@coglite.test",
    groups: [{ name: "user" }, { name: "developer" }, { name: "admin" }]
  }
}


class RestUserService implements IUserService {
  private _baseUrl: string
  private _auth: IBasicAuthCredentials
  get baseUrl() {
    return this._baseUrl || Defaults.baseUrl
  }
  set baseUrl(value) {
    this._baseUrl = value
  }
  get auth() {
    return this._auth || Defaults.auth
  }
  set auth(value) {
    this._auth = value
  }
  getUsers(request?: IGetUsersRequest): Promise<IUser[]> {
    return axios.get(`${this.baseUrl}/user/`, { params: request, auth: this.auth }).then((value) => {
      return value.data as IUser[]
    })
  }
  getUserProfile(): Promise<IUserProfile> {
    return axios.get(`${this.baseUrl}/self/profile/`, { auth: this.auth }).then((value) => {
      return value.data as IUserProfile
    })
  }
}

class MockUserService implements IUserService {
  private _userProfile: IUserProfile
  get userProfile() {
    return this._userProfile || MockUserProfile
  }
  set userProfile(value) {
    this._userProfile = value
  }
  getUsers(request?: IGetUsersRequest): Promise<IUser[]> {
    return Promise.resolve([this.userProfile.user])
  }
  getUserProfile(): Promise<IUserProfile> {
    return Promise.resolve(Object.assign({}, this.userProfile))
  }
}





interface IUserAuthContainerProps extends IUserContainerProps {
  isAuthorised: (userProfile: IUserProfile) => boolean
  onRenderNotAuthorised?: (userProfile: IUserProfile) => React.ReactNode
}

class UserAuthContainer extends React.Component<IUserAuthContainerProps, any> {
  componentWillMount() {
    UserProfileStore.load()
  }
  private _onRenderUser = (userProfile: IUserProfile) => {
    if (this.props.isAuthorised(userProfile)) {
      return this.props.onRenderUser ? this.props.onRenderUser(userProfile) : this.props.children
    }
    return this.props.onRenderNotAuthorised ? this.props.onRenderNotAuthorised(userProfile) : null
  }
  render() {
    return <UserContainer {...this.props} onRenderUser={this._onRenderUser} />
  }
}

interface IUserAdminContainerProps extends IUserContainerProps {
  onRenderNonAdmin?: (userProfile: IUserProfile) => React.ReactNode
}

class UserAdminContainer extends React.Component<IUserAdminContainerProps, any> {
  render() {
    return (
      <UserAuthContainer {...this.props} isAuthorised={UserAdminContext.value} onRenderNotAuthorised={this.props.onRenderNonAdmin}>
        {this.props.children}
      </UserAuthContainer>
    )
  }
}




interface IUserContainerProps {
  onRenderUser?: (userProfile: IUserProfile) => React.ReactNode
  onRenderLoadingUserProfile?: () => React.ReactNode
  onRenderLoadError?: () => React.ReactNode
}
// Basic container for components that request a user profile before rendering
class UserContainer extends React.Component<IUserContainerProps, any> {
  componentWillMount() {
    UserProfileStore.load()
  }
  private _onRenderDone = () => {
    return this.props.onRenderUser ? this.props.onRenderUser(UserProfileStore.value) : this.props.children
  }
  render() {
    return (
      <SyncComponent
        sync={UserProfileStore.sync}
        onRenderDone={this._onRenderDone}
        onRenderSync={this.props.onRenderLoadingUserProfile}
        onRenderError={this.props.onRenderLoadError}
      />
    )
  }
}



interface IUserProfileStyles {
  root?: IStyle
  userInfo?: IStyle
  body?: IStyle
  groups?: IStyle
  groupsTitle?: IStyle
  groupList?: IStyle
  group?: IStyle
}

const getStyles = memoizeFunction((theme?: ITheme, customStyles?: IUserProfileStyles | undefined) => {
  if (!theme) {
    theme = getTheme()
  }
  const DefaultStyles: IUserProfileStyles = {
    root: {
      minWidth: 300
    },
    userInfo: {
      padding: 8
    },
    body: {
      borderTop: `1px solid ${theme.palette.neutralLight}`
    },
    groups: {
      padding: 8,
      lineHeight: "14px"
    },
    groupsTitle: {
      fontSize: "14px",
      fontWeight: FontWeights.semibold,
      margin: 0,
      paddingTop: 4,
      paddingBottom: 8
    },
    groupList: {},
    group: {
      backgroundColor: theme.palette.neutralSecondary,
      color: theme.palette.white,
      fontSize: "14px",
      lineHeight: "14px",
      fontWeight: FontWeights.semilight,
      padding: 4,
      borderRadius: 4,
      margin: 4,
      textAlign: "center",
      verticalAlign: "middle"
    }
  }
  return concatStyleSets(DefaultStyles, customStyles)
})

interface IUserProfileClassNames {
  root?: string
  userInfo?: string
  body?: string
  groups?: string
  groupsTitle?: string
  groupList?: string
  group?: string
}

const getClassNames = memoizeFunction(
  (styles: IUserProfileStyles, className?: string): IUserProfileClassNames => {
    return mergeStyleSets({
      root: ["user-profile", className, styles.root],
      userInfo: ["user-profile-user-info", styles.userInfo],
      body: ["user-profile-body", styles.body],
      groups: ["user-profile-groups", styles.groups],
      groupsTitle: ["user-profile-groups-title", styles.groupsTitle],
      groupList: ["user-profile-group-list", styles.groupList],
      group: ["user-profile-group", styles.group]
    })
  }
)

interface IUserGroupProps {
  group: IGroup
  className?: string
}

class UserGroup extends React.Component<IUserGroupProps, any> {
  render() {
    return (
      <div className={this.props.className} role="listitem">
        {this.props.group.name}
      </div>
    )
  }
}

interface IUserProfileProps {
  userProfile: IUserProfile
  className?: string
  styles?: IUserProfileStyles
}

class UserInfo extends React.Component<IUserProfileProps, any> {
  private _classNames: IUserProfileClassNames
  render() {
    const { userProfile, styles, className } = this.props
    if (userProfile) {
      const displayName = userProfile.display_name || "Unknown"
      this._classNames = getClassNames(getStyles(null, styles), className)
      return (
        <div className={this._classNames.userInfo}>
          <Persona text={displayName} secondaryText={userProfile.user ? userProfile.user.email : undefined} />
        </div>
      )
    }
    return null
  }
}

class UserGroups extends React.Component<IUserProfileProps, any> {
  private _classNames: IUserProfileClassNames
  render() {
    this._classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    const groups = this.props.userProfile.user.groups
    if (groups && groups.length > 0) {
      return (
        <div className={this._classNames.groupList} role="list">
          {groups.map((g) => (
            <UserGroup key={g.name} group={g} className={this._classNames.group} />
          ))}
        </div>
      )
    }
    return null
  }
}

class UserProfile extends React.Component<IUserProfileProps, any> {
  private _classNames: IUserProfileClassNames
  private _renderHeader(): React.ReactNode {
    return <UserInfo {...this.props} />
  }
  private _renderGroups(): React.ReactNode {
    return (
      <div className={this._classNames.groups}>
        <h5 className={this._classNames.groupsTitle}>Groups</h5>
        <UserGroups {...this.props} />
      </div>
    )
  }
  private _renderBody(): React.ReactNode {
    return <div className={this._classNames.body}>{this._renderGroups()}</div>
  }
  render() {
    if (this.props.userProfile) {
      this._classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
      return (
        <div className={this._classNames.root}>
          {this._renderHeader()}
          {this._renderBody()}
        </div>
      )
    }
    return null
  }
}



const UserProfileContext = React.createContext<IUserProfile>({})




const createUserProfileMenu = (userProfile: IUserProfile): IContextualMenuItem => {
  return {
    key: "userProfileMenu",
    ariaLabel: "User Profile for " + userProfile.display_name,
    iconProps: {
      iconName: "Contact"
    },
    subMenuProps: {
      items: [
        {
          key: "userInfo",
          userProfile: userProfile,
          onRender(item) {
            return <UserInfo key={item.key} userProfile={userProfile} />
          }
        },
        {
          key: "userGroupsHeader",
          itemType: ContextualMenuItemType.Header,
          name: "Groups"
        },
        {
          key: "userGroups",
          onRender(item) {
            return <UserGroups key={item.key} userProfile={userProfile} />
          }
        }
      ]
    }
  }
}



class RestUserDataService implements IUserDataService {
  private _baseUrl: string
  private _auth: IBasicAuthCredentials
  get baseUrl() {
    return this._baseUrl || Defaults.baseUrl
  }
  set baseUrl(value) {
    this._baseUrl = value
  }
  get auth() {
    return this._auth || Defaults.auth
  }
  set auth(value) {
    this._auth = value
  }
  listUserData(): Promise<IUserData[]> {
    return axios.get(`${this.baseUrl}/self/data/`).then((ar) => {
      const r = ar.data
      return r && r._embedded && r._embedded.item ? (r._embedded.item as IUserData[]) : []
    })
  }
  getUserData(request: IGetUserDataRequest): Promise<IUserData> {
    return axios
      .get(`${this.baseUrl}/self/data/${encodeURIComponent(request.key)}`, {
        auth: this.auth
      })
      .then((ar) => {
        return ar.data as IUserData
      })
      .catch((err) => {
        if (err.response && err.response.status !== 404) {
          return Promise.reject(err)
        }
      })
  }
  setUserData(data: IUserData): Promise<IUserData> {
    return axios
      .put(`${this.baseUrl}/self/data/${encodeURIComponent(data.key)}/`, data, {
        auth: this.auth
      })
      .then((ar) => {
        return ar.data as IUserData
      })
  }
  deleteUserData(data: IUserData): Promise<any> {
    return axios.delete(`${this.baseUrl}/self/data/${encodeURIComponent(data.key)}/`, { auth: this.auth })
  }
}

class MockUserDataService implements IUserDataService {
  private _map: { [key: string]: IUserData } = {}
  listUserData(): Promise<IUserData[]> {
    const keys = Object.keys(this._map)
    const data = keys.map((key) => {
      return this._map[key]
    })
    return Promise.resolve(data)
  }
  getUserData(request: IGetUserDataRequest): Promise<IUserData> {
    return Promise.resolve(this._map[request.key])
  }
  setUserData(data: IUserData): Promise<any> {
    this._map[data.key] = data
    return Promise.resolve(Object.assign({}, data))
  }
  deleteUserData(data: IUserData): Promise<any> {
    delete this._map[data.key]
    return Promise.resolve()
  }
}



const UserDataServiceContext = new Context<IUserDataService>()




const contentType = "application/json"

class UserDataStorageService implements IStorageService {
  private _userDataService: IUserDataService
  get userDataService() {
    return this._userDataService || UserDataServiceContext.value
  }
  set userDataService(value) {
    this._userDataService = value
  }
  private checkState() {
    if (!this.userDataService) {
      throw {
        code: "INVALID_STATE",
        key: "userDataService",
        message: "No User Data Service Configured"
      }
    }
  }
  async getItem(key: string): Promise<any> {
    this.checkState()
    const userData = await this.userDataService.getUserData({ key: key })
    if (!userData) {
      return undefined
    }
    return JSON.parse(userData.entity)
  }
  async setItem(key: string, value: any) {
    if (!value) {
      return this.removeItem(key)
    }
    this.checkState()
    const userData: IUserData = {
      key: key,
      entity: JSON.stringify(value),
      content_type: contentType
    }
    return this.userDataService.setUserData(userData)
  }
  async removeItem(key: string) {
    this.checkState()
    return this.userDataService.deleteUserData({ key: key })
  }
}





interface IUserAccountHostViewProps extends IHostAppViewProps {
  userProfile?: IUserProfile
  styles?: any
}

@observer
class UserAccountHostView extends React.Component<IUserAccountHostViewProps, any> {
  render() {
    const farItems = []

    if (this.props.host.root && this.props.userProfile) {
      farItems.push(createUserProfileMenu(this.props.userProfile))
    }

    const commandBarProps = Object.assign({}, this.props.commandBarProps)
    commandBarProps.farItems = commandBarProps.farItems ? commandBarProps.farItems.concat(farItems) : farItems
    return (
      <HostAppView {...this.props} commandBarProps={commandBarProps}>
        {this.props.children}
      </HostAppView>
    )
  }
}




class UserPermissionsHost extends React.Component<IAppProps, any> {
  get host(): IAppHost {
    return this.props.match.host
  }
  get userProfile(): IUserProfile {
    return this.props.match.userProfile
  }
  get isAdmin(): boolean {
    return UserAdminContext.value(this.userProfile)
  }
  render() {
    return null
  }
}



export { UserAdminContext }
export { isMemberOfGroup }
export { requiresUser, requiresAuth, requiresAuthHandler, isAuthorised }
export { injectUserProfile, userProfileFilter, requiresGroup, requiresGroupRouter, userProfileFilterRouter }
export { UserListingAccessContext }
export { UserProfileStore }
export { UserServiceContext }
export { MockUserService, MockUserProfile }
export { RestUserService }
export { IUserAuthContainerProps, UserAuthContainer, IUserAdminContainerProps, UserAdminContainer }
export { IUserContainerProps, UserContainer }
export { IUserProfileClassNames }
export { IUserProfileStyles }
export { IUserProfileProps, UserProfile, UserInfo, UserGroups }
export { UserProfileContext }
export { createUserProfileMenu }
export { MockUserDataService }
export { RestUserDataService }
export { UserDataServiceContext }
export { UserDataStorageService }
export { UserAccountHostView, IUserAccountHostViewProps }
export { UserPermissionsHost }



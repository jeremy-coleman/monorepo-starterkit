export interface IGetUsersRequest {
  offset?: number
  limit?: number
}

export interface IUserService {
  getUsers(request?: IGetUsersRequest): Promise<IUser[]>
  getUserProfile(): Promise<IUserProfile>
}

export interface IUserProfile {
  id?: number
  display_name?: string
  bio?: string
  user?: IUser
}

export interface IGetUserDataRequest {
  key: string
}

export interface IUserDataService {
  listUserData(): Promise<IUserData[]>
  getUserData(request: IGetUserDataRequest): Promise<IUserData>
  setUserData(data: IUserData): Promise<any>
  deleteUserData(data: IUserData): Promise<any>
}

export interface IUserData {
  username?: string
  key?: string
  entity?: string
  content_type?: string
  version?: string
}

export interface IUser {
  username?: string
  email?: string
  groups?: IGroup[]
}

export interface IGroup {
  name?: string
}

export interface IBasicAuthCredentials {
  username: string
  password: string
}

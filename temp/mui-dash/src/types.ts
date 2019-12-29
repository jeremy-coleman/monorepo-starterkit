
export type EntityId = number | string

export interface Entity {
  createdAt?: string
  updatedAt?: string
}

export type OrganizationId = EntityId
export interface OrganizationPlan {
  id: number | string
  name: string
  features?: {}
}

export interface OrganizationSubmissionData {
  name: string
  username?: string
}

export interface Organization extends OrganizationSubmissionData, Entity {
  id: OrganizationId
  plan: OrganizationPlan
  users?: User[]
  organizationToUsers?: OrganizationToUser[]
}

export type OrganizationToUserId = EntityId
export type OrganizationUserRole = 'member' | 'admin' | 'owner'

export interface OrganizationToUser extends Entity {
  id: OrganizationToUserId
  organizationId: OrganizationId
  userId: UserId
  role: OrganizationUserRole
  organization?: Organization
  user?: User
}

export type UserId = EntityId

// global user role across the system (useful for SAAS or if organizations arn't used)
// Each user can have only one global role
export type UserGlobalRole = 'admin' | 'support' | 'member'

export interface UserSubmissionData {
  firstName?: string
  lastName?: string
  displayName?: string
  username?: string | null
  email: string
  password?: string
  avatarUrl?: string
  globalRole?: UserGlobalRole
}

export interface User extends UserSubmissionData, Entity {
  id: UserId
  organizations?: Organization[]
  userToOrganizations?: OrganizationToUser[]
}

export type LocationId = EntitiyOwnedId

export interface Location extends EntityOwned {
  id?: LocationId
  location?: {
    lat: number
    lng: number
  }
  name: string
}

export type EntitiyOwnedId = EntityId

// The entity may be owned by an organization or an individual user
export interface EntityOwned extends Entity {
  id?: EntityId
  ownerUserId?: UserId
  owenrOrganizationId?: OrganizationId
}

export type CustomerId = EntityId

export interface Customer {
  id?: CustomerId
  name?: string
  email?: string
  details?: object
}


export type OrderId = EntitiyOwnedId
export type OrderStatus =
  | 'received'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'rejected'
  | 'refunded'

export interface OrderProduct {
  id?: ProductId
  price?: number
  quantity?: number
}

export interface OrderSubmissionData {
  products?: any[]
  customerNotes?: string
}

// Order can be owned by a single account or user
export interface Order extends EntityOwned {
  id?: OrderId
  name?: string
  status: OrderStatus
  customerNotes?: string
  staffNotes?: string
  paymentId?: PaymentId
  products?: any[]
  sum: number
}

export type PaymentId = EntityId

export interface Payment {
  id?: PaymentId
  status?: string
  transactionId?: string
  transactionStatus?: string
}

export type ProductId = EntityId

export interface ProductVariation {
  name?: string
  price?: number
  details?: object
}

export interface Product extends Entity {
  id?: ProductId
  name: string
  details?: object
  description?: string
  variations?: ProductVariation[]
  price: number
  priceDiscounted?: number
  images?: ProductImage[]
  ownerUserId?: UserId
  ownerOrganizationId?: OrganizationId
}

export interface ProductAttachment extends Entity {
  id?: EntityId
  name?: string
  url?: string
}

export type ProductCategoryId = EntitiyOwnedId

export interface Category extends EntityOwned {
  name: string
  description?: string
  parentId?: EntitiyOwnedId
  images?: ProductImage[]
}

export interface ProductImage extends Entity {
  id?: EntityId
  name?: string
  url?: string
}

export interface ProductToProductCategory {
  productId: ProductId
  productCategoryId: ProductCategoryId
}


export interface Stock {
  productId: ProductId
  locationId?: LocationId
  qunatity: number
}

export interface StockAction {
  productId: ProductId
  locationId?: LocationId
  qunatity: number
  action: string
}

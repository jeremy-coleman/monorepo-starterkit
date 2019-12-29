declare module "file-loader?!*" {
  const value: string
  export default value
}

declare module "url-loader?!*" {
  const value: string
  export default value
}

declare module "*.json" {
  const value: any
  export default value
}

declare module "*.png"

declare module "*.jpg" {
  const value: string
  export default value
}

declare module "*.gif" {
  const value: string
  export default value
}

declare var AppConfig: {
  production?: boolean
  publicPath?: string
  buildVersion: string
  buildDate: string
  env: any
}

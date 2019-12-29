import instance from './client'
import mocks from './mocks'
import organizations from './organizations'
import users from './users'

// Submodules
import apiSales from './salesApi'

export interface ApiInitOptions {
  useSampleData?: boolean
}

const init = (options: ApiInitOptions = {}) => {
  const mockAdapter = options.useSampleData ? mocks.init(instance) : undefined

  apiSales.init({
    ...options,
    instance,
    mockAdapter,
  })

  return instance
}

export default { instance, organizations, users, init }
export { init, instance, organizations, users }

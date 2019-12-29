import { AxiosInstance } from 'axios'
import mocks from './salesMocks'
import orders from './orders.service'
import MockAdapter from 'axios-mock-adapter/types'
import { ApiInitOptions } from './api'

export interface SalesApiInitOptions extends ApiInitOptions {
  instance: AxiosInstance
  mockAdapter?: MockAdapter
}

const init = (options: SalesApiInitOptions) => {
  if (options.useSampleData && options.mockAdapter) {
    mocks.init(options.mockAdapter)
  }
}

export default { init, orders }
export { init, orders }

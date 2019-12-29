import { ISync } from "coglite/types"
import { autorun } from "mobx"

export const toPromise = (sync: ISync): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!sync.syncing && sync.hasSynced) {
      if (sync.error) {
        reject(sync.error)
      } else {
        resolve()
      }
    } else {
      const disposer = autorun(() => {
        if (!sync.syncing && sync.hasSynced) {
          disposer()
          if (sync.error) {
            reject(sync.error)
          } else {
            resolve()
          }
        }
      })
    }
  })
}

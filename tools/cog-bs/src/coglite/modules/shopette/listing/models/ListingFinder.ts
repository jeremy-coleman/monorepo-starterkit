import { IListingModelSupplier } from "coglite/types"

import { ListingModelSupplier } from "./ListingModelSupplier"

const deleteAfter = 2 * 60 * 1000

interface IEntry {
  supplier: IListingModelSupplier
  timeout?: any
}

const entryMap: { [key: string]: IEntry } = {}

const setEntry = (key: string, entry: IEntry) => {
  entryMap[key] = entry
}

const deleteEntry = (key: string) => {
  delete entryMap[key]
}

const findById = (listingId: string | number): IListingModelSupplier => {
  let entry = entryMap[listingId]
  if (!entry) {
    entry = { supplier: new ListingModelSupplier(listingId) }
    setEntry(String(listingId), entry)

    // add our deletion timeout
    entry.timeout = setTimeout(() => {
      deleteEntry(String(listingId))
    }, deleteAfter)
  }
  entry.supplier.load()
  return entry.supplier
}

export { findById }

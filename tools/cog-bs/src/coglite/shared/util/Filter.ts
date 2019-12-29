//import moment from "moment"
//import { IColumn } from "@uifabric/components";

//import { DateUtils } from "./DateUtils"
import { containsText, isNotBlank } from "./StringUtils"

type StringArrayTransform = (item: any) => string[]

const textFilterItemImpl = (item: any, text: string, transformer: StringArrayTransform) => {
  return containsText(transformer(item), text)
}

const textFilterItem = (item: any, text: string, transformer: StringArrayTransform) => {
  return isNotBlank(text) ? textFilterItemImpl(item, text, transformer) : true
}

const textFilter = <T>(items: T[], text: string, transformer: StringArrayTransform) => {
  return items && isNotBlank(text) ? items.filter((item) => textFilterItemImpl(item, text, transformer)) : items
}

// const fromFilterItem = (item: any, from: Date, dateField: IColumn) => {
//   return isMomentAfter(momentFromDataText(item[dateField.fieldName]), from)
// }

// const toFilterItem = (item: any, to: Date, dateField: IColumn) => {
//   return isMomentBefore(momentFromDataText(item[dateField.fieldName]), to)
// }

// const rangeFilterItem = (item: any, from: Date, to: Date, dateField: IColumn) => {
//   return fromFilterItem(item, from, dateField) && toFilterItem(item, to, dateField)
// }

// const rangeFilter = <T>(items: T[], from: Date, to: Date, dateField: IColumn) => {
//   return items && (from || to) && dateField ? items.filter((item) => rangeFilterItem(item, from, to, dateField)) : items
// }

// export const filterActivity = <T>(items: T[], activityFilter: IDateFilter, transformer: StringArrayTransform, dateField?: IColumn) => {
//   return activityFilter
//     ? rangeFilter(
//         textFilter(items, activityFilter.filterText, transformer),
//         activityFilter.filterFromDate,
//         activityFilter.filterToDate,
//         dateField
//       )
//     : items
// };

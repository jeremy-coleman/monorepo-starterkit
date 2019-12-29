import { IFieldTransformer, IKeyMapFunc, ISortProps } from "coglite/types"
import { dateFromDataText, defaultFieldTransformer } from "./DateUtils"
import * as LangUtils from "./LangUtils"
import * as StringUtils from "./StringUtils"
type IColumn = any

export const toSortNumber = (o: any): number => {
  if (LangUtils.isNumber(o)) {
    return o
  }
  if (LangUtils.isDate(o)) {
    return o.getTime()
  }
  if (LangUtils.isString(o)) {
    return parseInt(o)
  }
  if (LangUtils.isBoolean(o)) {
    return o ? 1 : 0
  }
  return 0
}

export const toSortString = (o: any): string => {
  let s
  if (LangUtils.isString(o)) {
    s = o
  } else if (LangUtils.isObject(o)) {
    s = String(o)
    if (s === String({})) {
      s = JSON.stringify(o)
    }
  } else {
    s = String(o)
  }
  return s
}

const toSortArray = (o: any): any[] => {
  if (LangUtils.isArray(o)) {
    return o
  }
  return [o]
}

const compareArrays = (l: any, r: any, sort?: ISortProps): number => {
  const ls = [].concat(l).sort((la, lb) => {
    return compare(la, lb, sort)
  })
  const rs = [].concat(r).sort((ra, rb) => {
    return compare(ra, rb, sort)
  })
  return compare(ls.length > 0 ? ls[0] : undefined, rs.length > 0 ? rs[0] : undefined)
}

export const compare = (l: any, r: any, sort?: ISortProps): number => {
  let result

  if (LangUtils.isNumber(l)) {
    result = r !== undefined && r !== null ? l - toSortNumber(r) : 1
  } else if (LangUtils.isDate(l)) {
    result = r ? (l as Date).getTime() - toSortNumber(r) : 1
  } else if (LangUtils.isString(l)) {
    result = r !== undefined && r !== null ? (l as string).localeCompare(toSortString(r)) : 1
  } else if (LangUtils.isBoolean(l)) {
    result = r !== undefined && r !== null ? (l ? 1 : 0) - toSortNumber(r) : 1
  } else if (LangUtils.isArray(l)) {
    result = compareArrays(l, toSortArray(r), sort)
  } else if (LangUtils.isObject(l)) {
    result = r !== undefined && r !== null ? toSortString(l).localeCompare(toSortString(r)) : 1
  } else {
    result = r ? -1 : 0
  }

  if (sort && sort.descending) {
    result = 0 - result
  }

  return result
}

export const sort = <T = any>(items: T[], sort: ISortProps, fieldTransformer: IFieldTransformer = defaultFieldTransformer): T[] => {
  return items && sort && StringUtils.isNotBlank(sort.field)
    ? items.sort((a, b) => compare(fieldTransformer(a, sort.field), fieldTransformer(b, sort.field), sort))
    : items
}

export const mappedSort = <T = any>(items: T[], sort: ISortProps, keyMap: IKeyMapFunc): T[] => {
  return items && sort && StringUtils.isNotBlank(sort.field)
    ? items.sort((a, b) => compare(keyMap(a, sort.field), keyMap(b, sort.field), sort))
    : items
}

export const dateAwareFieldTransformer = function(dateColumns: IColumn[]) {
  const dateFieldNames = dateColumns.map((column: IColumn) => column.fieldName)
  return function(item: any, field: string): any {
    if (item) {
      if (dateFieldNames.indexOf(field) >= 0) {
        return dateFromDataText(item[field])
      }
      return item[field]
    }
  }
}

export let SortUtils = {
  compare,
  sort,
  dateAwareFieldTransformer,
  toSortString,
  toSortNumber,
  mappedSort
}

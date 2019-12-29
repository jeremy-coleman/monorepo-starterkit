import { IFieldTransformer, IFieldTransformerMap, IKeyMapFunc } from "coglite/types"
import { isNullOrUndefined } from "coglite/shared/util"
import { isDate } from "./LangUtils"
import { isNotBlank } from "./StringUtils"

export const Formats = {
  date: "YYYY-MM-DD",
  timestampNoTimezone: "YYYY-MM-DD[T]HH:mm:ss.SSS",
  timestampOut: "DD/MM/YYYY HH:mm:ss"
}

const defaultKeyMap: IKeyMapFunc = <I = any, O = any>(value, key) => {
  return value ? value[key] : undefined
}

function moment(value) {
  return new Date(value)
}

/** first arg was removed moment formats */
export const dateString = <I = any>(keyMapFunc?: IKeyMapFunc<I, any>) => {
  return (value, key) => {
    const f = keyMapFunc || defaultKeyMap
    const keyValue = f(value, key)
    if (keyValue !== undefined) {
      const m = new Date(keyValue)
      //moment(String(keyValue), formats asDateFormatSpecification, true)
      return isValidMoment(m) ? m.toDateString() : undefined
    }
  }
}

const isMoment = isDate

export const isValidMoment = (value) => {
  const check = new Date(value)
  return isNullOrUndefined(check)
}

const isSameOrAfter = (value, test) => {
  return value === test || value - test > 0
}

const isAfter = (value, test) => {
  return value - test > 0
}

const isSameOrBefore = (value, test) => {
  return value === test || value - test < 0
}

const isBefore = (value, test) => {
  return value - test < 0
}

export const isMomentAfter = (value: Date, test: Date, inclusive = true): boolean => {
  if (isValidMoment(test)) {
    if (isValidMoment(value)) {
      return inclusive ? isSameOrAfter(value, test) : isAfter(value, test)
    }
    return false
  }
  return true
}

export const isDateAfter = (value: Date, test: Date, inclusive = true): boolean => {
  return isMomentAfter(value ? moment(value) : null, test ? moment(test) : null, inclusive)
}

export const isMomentBefore = (value: Date, test: Date, inclusive = true): boolean => {
  if (isValidMoment(test)) {
    if (isValidMoment(value)) {
      return inclusive ? isSameOrBefore(value, test) : isBefore(value, test)
    }
    return false
  }
  return true
}

export const isDateBefore = (value: Date, test: Date, inclusive = true): boolean => {
  return isMomentBefore(value ? moment(value) : null, test ? moment(test) : null, inclusive)
}

export const momentFromDataText = (value?: string): Date => {
  return isNotBlank(value) ? moment(value) : undefined
}

export const momentFromDataTextWithFormat = (value: string, format: string): Date => {
  return isNotBlank(value) ? moment(value) : undefined
}

export const momentToDataText = (value?: Date): string => {
  return isValidMoment(value) ? value.toDateString() : undefined
}

export const dateToDataText = (value?: Date): string => {
  return momentToDataText(value ? moment(value) : undefined)
}

export const momentToOutputText = (value?: Date): string => {
  return value ? value.toDateString() : undefined
}

export const isNotNull = (value?: Date): boolean => {
  return value ? true : false
}
//"DD/MM/YYYY HH:mm"
// const momentToOutputTextWithMEFormat = (value?:Date): string => {
//   return value ? value.format(DateOutputFormats.matchEvaluationHeader) : undefined
// }

export const dateToOutputText = (value?: Date): string => {
  return momentToOutputText(value ? moment(value) : undefined)
}

// export const momentToInputText = (value?:Date): string => {
//   return value ? value.format(DateInputFormats.default) : undefined
// };

// export const dateToInputText = (value?: Date): string => {
//   return momentToInputText(value ? moment(value) : undefined)
// };

// export const timeToOutputText = (value?: Date): string => {
//   return momentCustomTimeToOutputText(value ? moment(value) : undefined)
// };

// const momentCustomTimeToOutputText = (value?:Date): string => {
//   return value ? value.format(DateOutputFormats.matchEvaluationTimeFormat) : undefined
// }

// export const momentToTimestampOutputText = (value?:Date): string => {
//   return isValidMoment(value) ? value.format(DateOutputFormats.timestamp) : undefined
// };

// export const dateToTimestampOutputText = (value?: Date): string => {
//   return momentToTimestampOutputText(value ? moment(value) : undefined)
// };

// const dataToText = (value: string, format: string): string => {
//   if (isNotBlank(value)) {
//     const m = momentFromDataText(value)
//     if (isValidMoment(m)) {
//       return m.format(format)
//     }
//   }
//   return value
// }

// export const dataToOutputText = (value?: string): string => {
//   return dataToText(value, DateOutputFormats.default)
// };

// const dataToInputText = (value?: string): string => {
//   return dataToText(value, DateInputFormats.default)
// }

// export const dataTextToInputMoment = (value?: string):Date => {
//   const inputText = dataToInputText(value)
//   return isNotBlank(inputText) ? moment(dataToInputText(value)) : undefined
// };

// export const timestampDataToInputText = (value?: string): string => {
//   const m = momentFromTimeDataText(value)
//   return isValidMoment(m) ? m.format(DateInputFormats.timestamp) : value
// };

// export const timestampDataTextToInputMoment = (value?: string):Date => {
//   return value ? moment(timestampDataToInputText(value)) : undefined
// };

// export const dataTimestampToOutputText = (value?: string): string => {
//   const m = momentFromTimestampDataText(value)
//   return isValidMoment(m) ? momentToTimestampOutputText(m) : value
// };

export const dateFromDataText = (value?: string): Date => {
  return new Date(value)
  //const m = momentFromDataText(value)
  //return isValidMoment(m) ? m.toDate() : undefined
}

// export const dateFromMatchEvaluationDataText = (value?: string): Date => {
//   const m = momentFromDataTextWithFormat(value, DateOutputFormats.matchEvaluation)
//   return isValidMoment(m) ? m.toDate() : undefined
// };

// const dateAsStringFromMatchEvaluationDataText = (value?: string): string => {
//   return momentToOutputText(momentFromDataTextWithFormat(value, DateOutputFormats.matchEvaluation))
// }

// export const dateAsStringFromMatchEvaluationHeaderDataText = (value?: string): string => {
//   return momentToOutputTextWithMEFormat(momentFromDataTextWithFormat(value, DateOutputFormats.matchEvaluation))
// };

export const momentToTimestampDataText = (value?: Date, withTimezone = true): string => {
  if (!value) {
    return undefined
  }
  if (withTimezone) {
    return value.toISOString()
  } else {
    // In local time, but without any tz info (unspecified timezone)
    value.toLocaleDateString()
    //return value.format(DateDataFormats.xmlDateTimeWithoutTimezone)
  }
}

// export const momentToTimeDataText = (value?:Date): string => {
//   return isValidMoment(value) ? value.format(DateDataFormats.time[0] + "Z").substring(0, DateDataFormats.time[0].length) : undefined
// };

// export const dateToTimeDataText = (value?: Date): string => {
//   return momentToTimeDataText(value ? moment(value) : undefined)
// };

// export const momentToTimeOutputText = (value?:Date): string => {
//   return isValidMoment(value) ? value.format(DateOutputFormats.time) : undefined
// };

// export const dateToTimeOutputText = (value?: Date): string => {
//   return momentToTimeOutputText(value ? moment(value) : undefined)
// };

export const momentFromTimeDataText = (value?: string) => {
  return isNotBlank(value) ? moment(value) : undefined
}

// export const dateFromTimeDataText = (value?: string) => {
//   const m = momentFromTimeDataText(value)
//   return isValidMoment(m) ? m.toDate() : undefined
// };

export const dateToTimestampDataText = (value?: Date, withTimezone = true): string => {
  return momentToTimestampDataText(value ? moment(value) : undefined, withTimezone)
}

// export const momentFromTimestampDataText = (value?: string, keepTimezone = false):Date => {
//   if (isNotBlank(value)) {
//     if (keepTimezone) {
//       // Keep the moment object in the timezone specified in 'value' string

//       return moment.parseZone(value, moment.ISO_8601, true)
//     } else {
//       // Shift the timezone to client timezone (default moment behaviour)
//       return moment(value, moment.ISO_8601, true)
//     }
//   }
//   return undefined
// };

// export const dateFromTimestampDataText = (value?: string): Date => {
//   const m = momentFromTimestampDataText(value)
//   return isValidMoment(m) ? m.toDate() : undefined
// };

export const currentTimestampDataText = () => {
  return dateToTimestampDataText(new Date())
}

//key: "YYYYMMDD",
// export const momentFromKeyText = (value?: string) => {
//   return isNotBlank(value) ? moment(value, DateDataFormats.key, true) : undefined
// };

// export const dateFromKeyText = (value?: string) => {
//   const m = momentFromKeyText(value)
//   return isValidMoment(m) ? m.toDate() : undefined
// };

// export const momentToKeyText = (value?:Date) => {
//   return value ? value.format(DateDataFormats.key) : undefined
// };

// export const dateToKeyText = (value?: Date) => {
//   return momentToKeyText(value ? moment(value) : undefined)
// };

// export const momentFromInputText = (value?: string):Date => {
//   return value ? moment(value, DateInputFormats.allowedDates, true) : undefined
// };

// export const dateFromInputText = (value?: string): Date => {
//   const m = momentFromInputText(value)
//   return m && m.isValid() ? m.toDate() : undefined
// };

// export const momentFromDataString = (value: string):Date => {
//   return momentFromString(value, Formats.date)
// };

// export const dateFromDataString = (value: string): Date => {
//   const m = momentFromDataString(value)
//   return m && m.isValid() ? m.toDate() : undefined
// };

// export const momentToDataString = (value:Date): string => {
//   return momentToString(value, Formats.date)
// };

// export const momentToTimestampDataString = (value:Date, withTimezone: boolean = true): string => {
//   if (withTimezone) {
//     return momentToISOString(value)
//   }
//   return momentToString(value, Formats.timestampNoTimezone)
// };

// export const momentFromTimestampDataString = (value: string, keepTimezone: boolean = false):Date => {
//   if (value) {
//     if (keepTimezone) {
//       // Keep the moment object in the timezone specified in 'value' string
//       return moment.parseZone(value, moment.ISO_8601, true)
//     }
//     // Shift the timezone to client timezone (default moment behaviour)
//     return moment(value, moment.ISO_8601, true)
//   }
//   return undefined
// };

// export const timestampIO = (value: string, outFormat: string = Formats.timestampOut): string => {
//   return momentToString(momentFromTimestampDataString(value), outFormat)
// };

// export const momentFromString = (value: string, format: string):Date => {
//   return isNotBlank(value) ? moment(value, format, true) : undefined
// };

// export const momentToString = (value:Date, format: string): string => {
//   return isValidMoment(value) ? value.format(format) : undefined
// };

// export const dateToString = (value: Date, format: string): string => {
//   return momentToString(value ? moment(value) : undefined, format)
// };

// export const dateFromString = (value: string, format: string): Date => {
//   const m = momentFromString(value, format)
//   return isValidMoment(m) ? m.toDate() : undefined
// };

export const momentToISOString = (value: Date): string => {
  return value ? value.toISOString() : undefined
}

export const dateToISOString = (value: Date): string => {
  return value ? momentToISOString(moment(value)) : undefined
}

// export const io = (value: string, inFormat: string, outFormat: string): string => {
//   return momentToString(momentFromString(value, inFormat), outFormat)
// };

export const defaultFieldTransformer: IFieldTransformer = <T = any>(item: T, field: string) => {
  return item ? item[field] : undefined
}

// export const createDateTextFieldTransformer = <T = any>(formats: string[]) => {
//   return (item: T, field: string) => {
//     const fieldValue = defaultFieldTransformer(item, field)
//     if (fieldValue !== undefined) {
//       const m = moment(fieldValue, formats asDateFormatSpecification, true)
//       return DateUtils.isValidMoment(m) ? m.toDate() : undefined
//     }
//   }
// };

// export const dateDataTextFieldTransformer: IFieldTransformer = <T = any>(item: T, field: string): Date => {
//   return DateUtils.dateFromDataText(defaultFieldTransformer(item, field))
// };

// export const dateDataTimestampTextFieldTransformer: IFieldTransformer = <T = any>(item: T, field: string): Date => {
//   return DateUtils.dateFromTimestampDataText(defaultFieldTransformer(item, field))
// };

export const createMappedFieldTransformer = <T = any>(transformerMap: IFieldTransformerMap): IFieldTransformer<T> => {
  return (item: T, field: string) => {
    let fieldTransformer = transformerMap[field]
    if (!fieldTransformer) {
      fieldTransformer = defaultFieldTransformer
    }
    return fieldTransformer(item, field)
  }
}

// export let DateUtils = {
//   defaultFieldTransformer,
//   dateDataTextFieldTransformer,
//   dateDataTimestampTextFieldTransformer,
//   //createDateTextFieldTransformer,
//   createMappedFieldTransformer,
//   isValidMoment,
//   dataToOutputText,
//   dataTimestampToOutputText,
//   momentFromDataText,
//   dateFromDataText,
//   //dateFromMatchEvaluationDataText,
//   timeToOutputText,
//   momentToDataText,
//   dateToDataText,
//   momentToOutputText,
//   dateToOutputText,
//   dataTextToInputMoment,
//   timestampDataToInputText,
//   timestampDataTextToInputMoment,
//   //momentToTimestampOutputText,
//   //dateToTimestampOutputText,
//   momentToTimestampDataText,
//   dateToTimestampDataText,
//   //momentFromTimestampDataText,
//   momentFromDataTextWithFormat,
//   //dateFromTimestampDataText,
//   currentTimestampDataText,
//   //momentToTimeDataText,
//  // dateToTimeDataText,
//   //momentToTimeOutputText,
//   //dateToTimeOutputText,
//   momentFromTimeDataText,
//   //dateFromTimeDataText,
//   isMomentBefore,
//   isMomentAfter,
//   isNotNull,
//   momentFromKeyText,
//   dateFromKeyText,
//   momentToKeyText,
//   dateToKeyText,
//   dateAsStringFromMatchEvaluationHeaderDataText,
//   momentFromInputText,
//   dateFromInputText,
//   momentToInputText,
//   dateToInputText,
//   momentFromDataString,
//   dateFromDataString,
//   momentToDataString,
//   momentToTimestampDataString,
//   momentFromTimestampDataString,
//   Formats,
//   timestampIO,
//   isDateBefore,
//   isDateAfter,
//   momentFromString,
//   dateFromString,
//   momentToString,
//   dateToString,
//   momentToISOString,
//   dateToISOString,
//   io
// }

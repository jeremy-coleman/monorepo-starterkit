export const Input = {
  default: "DD/MM/YYYY",
  allowedDates: [
    "DD/MM/YYYY",
    "D/M/YY",
    "D/MMM/YY",
    "D/MMMM/YY",
    "D/M/YYYY",
    "D/MMM/YYYY",
    "D/MMMM/YYYY",
    "D-M-YY",
    "D-MMM-YY",
    "D-MMMM-YY",
    "D-M-YYYY",
    "D-MMM-YYYY",
    "D-MMMM-YYYY",
    "D M YY",
    "D MMM YY",
    "D MMMM YY",
    "D M YYYY",
    "D MMM YYYY",
    "D MMMM YYYY",
    "YYYY-M-D",
    "MMM D YYYY",
    "MMM D, YYYY"
  ],
  timestamp: "DD/MM/YYYY HH:mm:ss"
}

export const Output = {
  default: "DD/MM/YYYY",
  filename: "DD-MM-YYYY",
  timestamp: "DD/MM/YYYY HH:mm:ss",
  time: "HH:mm:ss",
  nisFormat: "DDMMMYYYY",
  matchEvaluation: "YYYY-MM-DD[T]HH:mm:ss",
  matchEvaluationHeader: "DD/MM/YYYY HH:mm",
  matchEvaluationTimeFormat: "HH:mm",
  riskResumeDate: "DD MMM YYYY",
  riskResumeTimestamp: "DD MMM YYYY HH:mm:ss Z",
  erollDataLoadDate: "MMM YYYY"
}

export const Data = {
  default: "YYYY-MM-DD",
  key: "YYYYMMDD",
  date: "YYYY-MM-DD",
  time: ["HH:mm:ss.SSS", "HH:mm:ss", "HH:mm"],
  xmlDateTimeWithoutTimezone: "YYYY-MM-DD[T]HH:mm:ss.SSS",
  riskResumeTimestamp: "YYYY-MM-DD HH:mm:ss.SSSSSSZ"
}

export const CalendarStrings = {
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["S", "M", "T", "W", "T", "F", "S"],
  goToToday: "Go to today"
}

export { Data as DateDataFormats, Input as DateInputFormats, Output as DateOutputFormats }

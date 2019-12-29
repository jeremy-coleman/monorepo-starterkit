import { IStyle, memoizeFunction, concatStyleSets, mergeStyleSets } from "@uifabric/styleguide"
import { ITheme, getTheme } from "@uifabric/styleguide"

interface IListingActivityListStyles {
  root?: IStyle
  activities?: IStyle
  activity?: IStyle
}

const defaultStyles = (theme: ITheme): IListingActivityListStyles => {
  return {
    root: {},
    activities: {
      padding: 8
    },
    activity: {
      marginBottom: 12
    }
  }
}

const Defaults = {
  styles: defaultStyles
}

const getStyles = memoizeFunction(
  (theme?: ITheme, customStyles?: IListingActivityListStyles): IListingActivityListStyles => {
    if (!theme) {
      theme = getTheme()
    }
    return concatStyleSets(Defaults.styles(theme), customStyles)
  }
)

interface IListingActivityListClassNames {
  root?: string
  activities?: string
  activity?: string
}

const getClassNames = memoizeFunction((styles: IListingActivityListStyles, className: string) => {
  return mergeStyleSets({
    root: ["listing-activity-list", className, styles.root],
    activities: ["listing-activity-list-activities", styles.activities],
    activity: ["listing-activity-list-activity", styles.activity]
  })
})

export const ListingActivityListCSS = {
  getClassNames,
  getStyles
}

export { IListingActivityListClassNames }
export { IListingActivityListStyles }

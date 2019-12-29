import { concatStyleSets, IStyle, keyframes, memoizeFunction, mergeStyles } from "@uifabric/styleguide"
import { getTheme, HighContrastSelector, ITheme, PulsingBeaconAnimationStyles } from "@uifabric/styleguide"
import { IRenderFunction } from "@uifabric/styleguide"
import * as React from "react"
import { IPersonaCoinProps, IPersonaProps, IPersonaSharedProps } from "./Persona"
import { PersonaCoin } from "./PersonaCoin"
import { PersonaSize } from "./PersonaConsts"

export interface IActivityItemClassNames {
  root?: string
  activityContent?: string
  activityText?: string
  personaContainer?: string
  activityPersona?: string
  activityTypeIcon?: string
  commentText?: string
  timeStamp?: string
  pulsingBeacon?: string
}

export const getActivityItemClassNames = memoizeFunction(
  (styles: IActivityItemStyles, className: string, activityPersonas: Array<IPersonaProps>, isCompact: boolean): IActivityItemClassNames => {
    return {
      root: mergeStyles("ms-ActivityItem", className, styles.root, isCompact && styles.isCompactRoot),

      pulsingBeacon: mergeStyles("ms-ActivityItem-pulsingBeacon", styles.pulsingBeacon),

      personaContainer: mergeStyles(
        "ms-ActivityItem-personaContainer",
        styles.personaContainer,
        isCompact && styles.isCompactPersonaContainer
      ),

      activityPersona: mergeStyles(
        "ms-ActivityItem-activityPersona",
        styles.activityPersona,
        isCompact && styles.isCompactPersona,
        !isCompact && activityPersonas && activityPersonas.length === 2 && styles.doublePersona
      ),

      activityTypeIcon: mergeStyles("ms-ActivityItem-activityTypeIcon", styles.activityTypeIcon, isCompact && styles.isCompactIcon),

      activityContent: mergeStyles("ms-ActivityItem-activityContent", styles.activityContent, isCompact && styles.isCompactContent),

      activityText: mergeStyles("ms-ActivityItem-activityText", styles.activityText),
      commentText: mergeStyles("ms-ActivityItem-commentText", styles.commentText),
      timeStamp: mergeStyles("ms-ActivityItem-timeStamp", styles.timeStamp, isCompact && styles.isCompactTimeStamp)
    }
  }
)

const DEFAULT_PERSONA_SIZE = "32px"
const COMPACT_PERSONA_SIZE = "16px"
const DEFAULT_ICON_SIZE = "16px"
const COMPACT_ICON_SIZE = "13px"
const ANIMATION_INNER_DIMENSION = "4px"
const ANIMATION_OUTER_DIMENSION = "28px"
const ANIMATION_BORDER_WIDTH = "4px"

export const getActivityItemStyles = memoizeFunction(
  (
    theme: ITheme = getTheme(),
    customStyles?: IActivityItemStyles,
    animateBeaconSignal?: IActivityItemProps["animateBeaconSignal"],
    beaconColorOne?: IActivityItemProps["beaconColorOne"],
    beaconColorTwo?: IActivityItemProps["beaconColorTwo"],
    isCompact?: IActivityItemProps["isCompact"]
  ): IActivityItemStyles => {
    const continuousPulse = PulsingBeaconAnimationStyles.continuousPulseAnimationSingle(
      beaconColorOne ? beaconColorOne : theme.palette.themePrimary,
      beaconColorTwo ? beaconColorTwo : theme.palette.themeTertiary,
      ANIMATION_INNER_DIMENSION,
      ANIMATION_OUTER_DIMENSION,
      ANIMATION_BORDER_WIDTH
    )

    const fadeIn: string = keyframes({
      from: { opacity: 0 },
      to: { opacity: 1 }
    })

    const slideIn: string = keyframes({
      from: { transform: "translateX(-10px)" },
      to: { transform: "translateX(0)" }
    })

    const continuousPulseAnimation = {
      animationName: continuousPulse,
      animationIterationCount: "1",
      animationDuration: ".8s",
      zIndex: 1
    }

    const slideInAnimation = {
      animationName: slideIn,
      animationIterationCount: "1",
      animationDuration: ".5s"
    }

    const fadeInAnimation = {
      animationName: fadeIn,
      animationIterationCount: "1",
      animationDuration: ".5s"
    }

    const ActivityItemStyles: IActivityItemStyles = {
      root: [
        theme.fonts.xSmall,
        {
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          boxSizing: "border-box",
          color: theme.palette.neutralSecondary
        },
        isCompact && animateBeaconSignal && fadeInAnimation
      ],

      pulsingBeacon: [
        {
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "0px",
          height: "0px",
          borderRadius: "225px",
          borderStyle: "solid",
          opacity: 0
        },
        isCompact && animateBeaconSignal && continuousPulseAnimation
      ],

      isCompactRoot: {
        alignItems: "center"
      },

      personaContainer: {
        display: "flex",
        flexWrap: "wrap",
        minWidth: DEFAULT_PERSONA_SIZE,
        width: DEFAULT_PERSONA_SIZE,
        height: DEFAULT_PERSONA_SIZE
      },

      isCompactPersonaContainer: {
        display: "inline-flex",
        flexWrap: "nowrap",
        flexBasis: "auto",
        height: COMPACT_PERSONA_SIZE,
        width: "auto",
        minWidth: "0",
        paddingRight: "6px"
      },

      activityTypeIcon: {
        height: DEFAULT_PERSONA_SIZE,
        fontSize: DEFAULT_ICON_SIZE,
        lineHeight: DEFAULT_ICON_SIZE,
        marginTop: "3px"
      },

      isCompactIcon: {
        height: COMPACT_PERSONA_SIZE,
        minWidth: COMPACT_PERSONA_SIZE,
        fontSize: COMPACT_ICON_SIZE,
        lineHeight: COMPACT_ICON_SIZE,
        color: theme.palette.themePrimary,
        marginTop: "1px",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        selectors: {
          ".ms-Persona-imageArea": {
            margin: "-2px 0 0 -2px",
            border: "2px solid" + theme.palette.white,
            borderRadius: "50%",
            selectors: {
              [HighContrastSelector]: {
                border: "none",
                margin: "0"
              }
            }
          }
        }
      },

      activityPersona: {
        display: "block"
      },

      doublePersona: {
        selectors: {
          ":first-child": {
            alignSelf: "flex-end"
          }
        }
      },

      isCompactPersona: {
        display: "inline-block",
        width: "8px",
        minWidth: "8px",
        overflow: "visible"
      },

      activityContent: [
        {
          padding: "0 8px"
        },
        isCompact && animateBeaconSignal && slideInAnimation
      ],

      activityText: {
        display: "inline"
      },

      isCompactContent: {
        flex: "1",
        padding: "0 4px",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflowX: "hidden"
      },

      commentText: {
        color: theme.palette.neutralPrimary
      },

      timeStamp: [
        theme.fonts.tiny,
        {
          fontWeight: 400,
          color: theme.palette.neutralSecondary
        }
      ],

      isCompactTimeStamp: {
        display: "inline-block",
        paddingLeft: "0.3em", // One space character
        fontSize: "1em"
      }
    }

    return concatStyleSets(ActivityItemStyles, customStyles)
  }
)

type OptionalReactKey = { key?: React.Key }

/**
 * {@docCategory ActivityItem}
 */
export class ActivityItem extends React.Component<IActivityItemProps, {}> {
  constructor(props: IActivityItemProps) {
    super(props)
  }

  public render(): JSX.Element {
    const {
      onRenderIcon = this._onRenderIcon,
      onRenderActivityDescription = this._onRenderActivityDescription,
      onRenderComments = this._onRenderComments,
      onRenderTimeStamp = this._onRenderTimeStamp,
      animateBeaconSignal,
      isCompact
    } = this.props

    const classNames = this._getClassNames(this.props)

    return (
      <div className={classNames.root} style={this.props.style}>
        {(this.props.activityPersonas || this.props.activityIcon || this.props.onRenderIcon) && (
          <div className={classNames.activityTypeIcon}>
            {animateBeaconSignal && isCompact && <div className={classNames.pulsingBeacon} />}
            {onRenderIcon(this.props)}
          </div>
        )}

        <div className={classNames.activityContent}>
          {onRenderActivityDescription(this.props, this._onRenderActivityDescription)}
          {onRenderComments(this.props, this._onRenderComments)}
          {onRenderTimeStamp(this.props, this._onRenderTimeStamp)}
        </div>
      </div>
    )
  }

  private _onRenderIcon = (props: IActivityItemProps): JSX.Element | React.ReactNode | null => {
    if (props.activityPersonas) {
      return this._onRenderPersonaArray(props)
    } else {
      return this.props.activityIcon
    }
  }

  private _onRenderActivityDescription = (props: IActivityItemProps): JSX.Element | null => {
    const classNames = this._getClassNames(props)

    const activityDescription = props.activityDescription || props.activityDescriptionText

    if (activityDescription) {
      return <span className={classNames.activityText}>{activityDescription}</span>
    }

    return null
  }

  private _onRenderComments = (props: IActivityItemProps): JSX.Element | null => {
    const classNames = this._getClassNames(props)

    const comments = props.comments || props.commentText

    if (!props.isCompact && comments) {
      return <div className={classNames.commentText}>{comments}</div>
    }

    return null
  }

  private _onRenderTimeStamp = (props: IActivityItemProps): JSX.Element | null => {
    const classNames = this._getClassNames(props)

    if (!props.isCompact && props.timeStamp) {
      return <div className={classNames.timeStamp}>{props.timeStamp}</div>
    }

    return null
  }

  // If activityPersonas is an array of persona props, build the persona cluster element.
  private _onRenderPersonaArray = (props: IActivityItemProps): JSX.Element | null => {
    const classNames = this._getClassNames(props)

    let personaElement: JSX.Element | null = null
    const activityPersonas = props.activityPersonas as Array<IPersonaSharedProps & OptionalReactKey>
    if (activityPersonas[0].imageUrl || activityPersonas[0].imageInitials) {
      const personaList: Array<JSX.Element> = []
      const showSize16Personas = activityPersonas.length > 1 || props.isCompact
      const personaLimit = props.isCompact ? 3 : 4
      let style: React.CSSProperties | undefined = undefined
      if (props.isCompact) {
        style = {
          display: "inline-block",
          width: "10px",
          minWidth: "10px",
          overflow: "visible"
        }
      }
      activityPersonas
        .filter((person: IPersonaCoinProps & OptionalReactKey, index: number) => index < personaLimit)
        .forEach((person: IPersonaCoinProps & OptionalReactKey, index: number) => {
          personaList.push(
            <PersonaCoin
              {...person}
              // tslint:disable-next-line:no-string-literal
              key={person["key"] ? person["key"] : index}
              className={classNames.activityPersona}
              size={showSize16Personas ? PersonaSize.size16 : PersonaSize.size32}
              style={style}
            />
          )
        })
      personaElement = <div className={classNames.personaContainer}>{personaList}</div>
    }
    return personaElement
  }

  private _getClassNames(props: IActivityItemProps): IActivityItemClassNames {
    return getActivityItemClassNames(
      getActivityItemStyles(
        undefined,
        props.styles,
        props.animateBeaconSignal,
        props.beaconColorOne,
        props.beaconColorTwo,
        props.isCompact
      ),
      props.className!,
      props.activityPersonas!,
      props.isCompact!
    )
  }
}

/**
 * {@docCategory ActivityItem}
 */
export interface IActivityItemProps extends React.AllHTMLAttributes<HTMLElement> {
  /**
   * An element describing the activity that took place. If no activityDescription, activityDescriptionText, or
   * onRenderActivityDescription are included, no description of the activity is shown.
   */
  activityDescription?: React.ReactNode[] | React.ReactNode

  /**
   * Text describing the activity that occurred and naming the people involved in it.
   * Deprecated, use `activityDescription` instead.
   * @deprecated Use `activityDescription` instead.
   */
  activityDescriptionText?: string

  /**
   * An element containing an icon shown next to the activity item.
   */
  activityIcon?: React.ReactNode

  /**
   * If activityIcon is not set, then the persona props in this array will be used as the icon for the this activity item.
   */
  activityPersonas?: Array<IPersonaSharedProps>

  /**
   * An element containing the text of comments or \@mention messages.
   * If no comments, commentText, or onRenderComments are included, no comments are shown.
   */
  comments?: React.ReactNode[] | React.ReactNode

  /**
   * Text of comments or \@mention messages.
   * Deprecated, use `comments` instead.
   * @deprecated Use `comments` instead.
   */
  commentText?: string

  /**
   * Indicated if the compact styling should be used.
   */
  isCompact?: boolean

  /**
   * A renderer for the description of the current activity.
   */
  onRenderActivityDescription?: IRenderFunction<IActivityItemProps>

  /**
   * A renderer that adds the text of a comment below the activity description.
   */
  onRenderComments?: IRenderFunction<IActivityItemProps>

  /**
   * A renderer to create the icon next to the activity item.
   */
  onRenderIcon?: IRenderFunction<IActivityItemProps>

  /**
   * A renderer adds a time stamp. If not included, timeStamp is shown as plain text below the activity.
   */
  onRenderTimeStamp?: IRenderFunction<IActivityItemProps>

  /**
   * Optional styling for the elements within the Activity Item.
   */
  styles?: IActivityItemStyles

  /**
   * Element shown as a timestamp on this activity. If not included, no timestamp is shown.
   */
  timeStamp?: string | React.ReactNode[] | React.ReactNode

  /**
   * Beacon color one
   */
  beaconColorOne?: string

  /**
   * Beacon color two
   */
  beaconColorTwo?: string

  /**
   * Enables/Disables the beacon that radiates
   * from the center of the center of the activity icon. Signals an activity has started.
   * @defaultvalue false
   */
  animateBeaconSignal?: boolean
}

/**
 * {@docCategory ActivityItem}
 */
export interface IActivityItemStyles {
  /**
   * Styles applied to the root activity item container.
   */
  root?: IStyle

  /**
   * Styles applied to the root activity item container.
   */
  pulsingBeacon?: IStyle

  /**
   * Styles applied to the main container of the activity's description.
   */
  activityContent?: IStyle

  /**
   * Styles applied to the persona of the user that did this activity.
   */
  activityPersona?: IStyle

  /**
   * Styles applied to the activity's description.
   */
  activityText?: IStyle

  /**
   * Styles applied to the icon indicating the type of the activity. Only shown when personas are unavailable.
   */
  activityTypeIcon?: IStyle

  /**
   * Styles applied to the text of comments.
   */
  commentText?: IStyle

  /**
   * Styles applied to personas when two users are involved in a single activity.
   */
  doublePersona?: IStyle

  /**
   * Styles applied to root in the compact variant.
   */
  isCompactRoot?: IStyle

  /**
   * Styles applied to personas and icons in the compact variant.
   */
  isCompactIcon?: IStyle

  /**
   * Styles applied to main text container in the compact variant.
   */
  isCompactContent?: IStyle

  /**
   * Styles applied to personas in the compact variant.
   */
  isCompactPersona?: IStyle

  /**
   * Styles applied to a wrapper around personas in the compact variant.
   */
  isCompactPersonaContainer?: IStyle

  /**
   * Styles applied to the container of the persona image or activity type icon.
   */
  personaContainer?: IStyle

  /**
   * Styles applied to the timestamp at the end of each activity item.
   */
  timeStamp?: IStyle

  /**
   * Styles applied to the timestamp in compact mode.
   * This can occur if a host overrides the render behavior to force the timestamp to render.
   */
  isCompactTimeStamp?: IStyle
}

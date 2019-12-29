import { classNamesFunction, styled } from "@uifabric/styleguide"
import { FontSizes, getGlobalClassNames, HighContrastSelector } from "@uifabric/styleguide"
import {} from "@uifabric/styleguide"
import * as React from "react"
import { Icon } from "./Icon"
import { IPersonaPresenceProps, IPersonaPresenceStyleProps, IPersonaPresenceStyles } from "./Persona"
import { PersonaPresenceEnum, personaPresenceSize, PersonaSize, presenceBoolean, sizeBoolean } from "./PersonaConsts"

const coinSizeFontScaleFactor = 6
const coinSizePresenceScaleFactor = 3
const presenceMaxSize = 40
const presenceFontMaxSize = 20

const GlobalPersonaPresenceClassNames = {
  presence: "ms-Persona-presence",
  presenceIcon: "ms-Persona-presenceIcon"
}

export const getPersonaPresenceStyles = (props: IPersonaPresenceStyleProps): IPersonaPresenceStyles => {
  const { theme } = props
  const { semanticColors } = theme

  const classNames = getGlobalClassNames(GlobalPersonaPresenceClassNames, theme)

  const size = sizeBoolean(props.size as PersonaSize)
  const presence = presenceBoolean(props.presence as PersonaPresenceEnum)

  // Presence colors
  const presenceColorAvailable = "#6BB700"
  const presenceColorAway = "#FFAA44"
  const presenceColorBusy = "#C43148"
  const presenceColorDnd = "#C50F1F"
  const presenceColorOffline = "#8A8886"

  return {
    presence: [
      classNames.presence,
      {
        position: "absolute",
        height: personaPresenceSize.size12,
        width: personaPresenceSize.size12,
        borderRadius: "50%",
        top: "auto",
        right: `-${personaPresenceSize.border}`,
        bottom: `-${personaPresenceSize.border}`,
        border: `${personaPresenceSize.border} solid ${semanticColors.bodyBackground}`,
        textAlign: "center",
        boxSizing: "content-box",
        backgroundClip: "content-box",
        MsHighContrastAdjust: "none",

        selectors: {
          [HighContrastSelector]: {
            borderColor: "Window",
            backgroundColor: "WindowText"
          }
        }
      },

      (size.isSize8 || size.isSize10) && {
        right: "auto",
        top: "7px",
        left: 0,
        border: 0,

        selectors: {
          [HighContrastSelector]: {
            top: "9px",
            border: "1px solid WindowText"
          }
        }
      },

      (size.isSize8 || size.isSize10 || size.isSize24 || size.isSize28 || size.isSize32) && {
        height: personaPresenceSize.size8,
        width: personaPresenceSize.size8
      },

      (size.isSize40 || size.isSize48) && {
        height: personaPresenceSize.size12,
        width: personaPresenceSize.size12
      },

      size.isSize16 && {
        height: personaPresenceSize.size6,
        width: personaPresenceSize.size6,
        borderWidth: "1.5px"
      },

      size.isSize56 && {
        height: personaPresenceSize.size16,
        width: personaPresenceSize.size16
      },

      size.isSize72 && {
        height: personaPresenceSize.size20,
        width: personaPresenceSize.size20
      },

      size.isSize100 && {
        height: personaPresenceSize.size28,
        width: personaPresenceSize.size28
      },

      presence.isAvailable && {
        backgroundColor: presenceColorAvailable,

        selectors: {
          [HighContrastSelector]: {
            backgroundColor: "Highlight"
          }
        }
      },

      presence.isAway && {
        backgroundColor: presenceColorAway
      },

      presence.isBlocked && [
        {
          backgroundColor: semanticColors.bodyBackground,

          selectors: {
            ":before": {
              content: '""',
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              border: `${personaPresenceSize.border} solid ${presenceColorBusy}`,
              borderRadius: "50%",
              boxSizing: "border-box"
            },

            // Only show :after at larger sizes
            ":after":
              size.isSize40 || size.isSize48 || size.isSize72 || size.isSize100
                ? {
                    content: '""',
                    width: "100%",
                    height: personaPresenceSize.border,
                    backgroundColor: presenceColorBusy,
                    transform: "translateY(-50%) rotate(-45deg)",
                    position: "absolute",
                    top: "50%",
                    left: 0
                  }
                : undefined,

            [HighContrastSelector]: {
              backgroundColor: "WindowText",

              selectors: {
                ":before": {
                  width: `calc(100% - ${personaPresenceSize.border})`,
                  height: `calc(100% - ${personaPresenceSize.border})`,
                  top: parseFloat(personaPresenceSize.border) / 2 + "px",
                  left: parseFloat(personaPresenceSize.border) / 2 + "px",
                  borderColor: "Window"
                },

                ":after": {
                  width: `calc(100% - ${parseFloat(personaPresenceSize.border) * 2}px)`,
                  left: personaPresenceSize.border,
                  backgroundColor: "Window"
                }
              }
            }
          }
        }
      ],

      presence.isBusy && {
        backgroundColor: presenceColorBusy
      },

      presence.isDoNotDisturb && {
        backgroundColor: presenceColorDnd
      },

      presence.isOffline && {
        backgroundColor: presenceColorOffline
      }
    ],

    presenceIcon: [
      classNames.presenceIcon,
      {
        color: semanticColors.bodyBackground,
        fontSize: "6px",
        lineHeight: personaPresenceSize.size12,
        verticalAlign: "top",

        selectors: {
          [HighContrastSelector]: {
            color: "Window"
          }
        }
      },

      size.isSize56 && {
        fontSize: "8px",
        lineHeight: personaPresenceSize.size16
      },

      size.isSize72 && {
        fontSize: FontSizes.xSmall,
        lineHeight: personaPresenceSize.size20
      },

      size.isSize100 && {
        fontSize: FontSizes.small,
        lineHeight: personaPresenceSize.size28
      },

      presence.isAway && {
        position: "relative",
        left: "1px"
      }
    ]
  }
}


/**
 * PersonaPresence with no default styles.
 * [Use the `getStyles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Styling)
 */
export class PersonaPresenceBase extends React.Component<IPersonaPresenceProps, {}> {
  constructor(props: IPersonaPresenceProps) {
    super(props)
  }

  public render(): JSX.Element | null {
    const {
      coinSize,
      styles, // Use getStyles from props.
      presence,
      theme
    } = this.props
    const size = sizeBoolean(this.props.size as PersonaSize)

    // Render Presence Icon if Persona is above size 32.
    const renderIcon =
      !(size.isSize8 || size.isSize10 || size.isSize16 || size.isSize24 || size.isSize28 || size.isSize32) &&
      (coinSize ? coinSize > 32 : true)

    const presenceHeightWidth: string = coinSize
      ? coinSize / coinSizePresenceScaleFactor < presenceMaxSize
        ? coinSize / coinSizePresenceScaleFactor + "px"
        : presenceMaxSize + "px"
      : ""
    const presenceFontSize: string = coinSize
      ? coinSize / coinSizeFontScaleFactor < presenceFontMaxSize
        ? coinSize / coinSizeFontScaleFactor + "px"
        : presenceFontMaxSize + "px"
      : ""
    const coinSizeWithPresenceIconStyle = coinSize ? { fontSize: presenceFontSize, lineHeight: presenceHeightWidth } : undefined
    const coinSizeWithPresenceStyle = coinSize ? { width: presenceHeightWidth, height: presenceHeightWidth } : undefined

    // Use getStyles from props, or fall back to getStyles from styles file.
    const classNames = classNamesFunction<IPersonaPresenceStyleProps, IPersonaPresenceStyles>()(styles, {
      theme: theme!,
      presence,
      size: this.props.size
    })

    if (presence === PersonaPresenceEnum.none) {
      return null
    }

    return (
      <div className={classNames.presence} style={coinSizeWithPresenceStyle}>
        {renderIcon && this._onRenderIcon(classNames.presenceIcon, coinSizeWithPresenceIconStyle)}
      </div>
    )
  }

  private _onRenderIcon = (className?: string, style?: React.CSSProperties): JSX.Element => (
    <Icon className={className} iconName={this._determineIcon()} style={style} />
  )

  private _determineIcon = (): string | undefined => {
    const { presence } = this.props

    if (presence !== PersonaPresenceEnum.none) {
      let userPresence = PersonaPresenceEnum[presence as PersonaPresenceEnum]

      switch (userPresence) {
        case "online":
          userPresence = "SkypeCheck"
          break
        case "away":
          userPresence = "SkypeClock"
          break
        case "dnd":
          userPresence = "SkypeMinus"
          break
        default:
          userPresence = ""
      }

      return userPresence
    }
  }
}

/**
 * PersonaPresence is used to render an individual's presence.
 */
export const PersonaPresence: React.FunctionComponent<IPersonaPresenceProps> = styled<
  IPersonaPresenceProps,
  IPersonaPresenceStyleProps,
  IPersonaPresenceStyles
>(PersonaPresenceBase, getPersonaPresenceStyles, undefined, { scope: "PersonaPresence" })

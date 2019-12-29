import { classNamesFunction, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import {
  getGlobalClassNames,
  HighContrastSelector,
  HighContrastSelectorBlack,
  HighContrastSelectorWhite,
  ITheme
} from "@uifabric/styleguide"
import { IRefObject } from "@uifabric/styleguide"
import * as React from "react"
import { IKeytipProps } from "./Keytip"
import { KeytipData } from "./KeytipData"


export class LinkBase extends React.Component<ILinkProps, any> implements ILink {
  private _link = React.createRef<HTMLAnchorElement | HTMLButtonElement | null>()

  public render(): JSX.Element {
    const { disabled, children, className, href, theme, styles, keytipProps } = this.props

    const classNames = classNamesFunction<ILinkStyleProps, ILinkStyles>()(styles!, {
      className,
      isButton: !href,
      isDisabled: disabled,
      theme: theme!
    })

    const RootType = this._getRootType(this.props)

    return (
      <KeytipData
        keytipProps={keytipProps}
        ariaDescribedBy={(this.props as { "aria-describedby": string })["aria-describedby"]}
        disabled={disabled}
      >
        {(keytipAttributes: any): JSX.Element => (
          <RootType
            {...keytipAttributes}
            {...this._adjustPropsForRootType(RootType, this.props)}
            className={classNames.root}
            onClick={this._onClick}
            ref={this._link}
            aria-disabled={disabled}
          >
            {children}
          </RootType>
        )}
      </KeytipData>
    )
  }

  public focus() {
    const { current } = this._link

    if (current && current.focus) {
      current.focus()
    }
  }

  private _onClick = (ev: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    const { onClick, disabled } = this.props

    if (disabled) {
      ev.preventDefault()
    } else if (onClick) {
      onClick(ev)
    }
  }

  private _adjustPropsForRootType(
    RootType: string | React.ComponentClass | React.FunctionComponent,
    props: ILinkProps & { getStyles?: any }
  ): Partial<ILinkProps> {
    // Deconstruct the props so we remove props like `as`, `theme` and `styles`
    // as those will always be removed. We also take some props that are optional
    // based on the RootType.
    const { children, as, disabled, target, href, theme, getStyles, styles, componentRef, ...restProps } = props

    // RootType will be a string if we're dealing with an html component
    if (typeof RootType === "string") {
      // Remove the disabled prop for anchor elements
      if (RootType === "a") {
        return {
          target,
          href: disabled ? undefined : href,
          ...restProps
        }
      }

      // Add the type='button' prop for button elements
      if (RootType === "button") {
        return {
          type: "button",
          disabled,
          ...restProps
        }
      }

      // Remove the target and href props for all other non anchor elements
      return { ...restProps, disabled }
    }

    // Retain all props except 'as' for ReactComponents
    return { target, href, disabled, ...restProps }
  }

  private _getRootType(props: ILinkProps): string | React.ComponentClass | React.FunctionComponent {
    if (props.as) {
      return props.as
    }

    if (props.href) {
      return "a"
    }

    return "button"
  }
}

const GlobalClassNames = {
  root: "ms-Link"
}

export const getLinkStyles = (props: ILinkStyleProps): ILinkStyles => {
  const { className, isButton, isDisabled, theme } = props
  const { semanticColors } = theme

  // Tokens
  const linkColor = semanticColors.link
  const linkInteractedColor = semanticColors.linkHovered
  const linkDisabledColor = semanticColors.disabledText
  const focusBorderColor = semanticColors.focusBorder

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  return {
    root: [
      classNames.root,
      theme.fonts.small,
      {
        color: linkColor,
        outline: "none",
        fontSize: "inherit",
        fontWeight: "inherit",
        selectors: {
          ".ms-Fabric--isFocusVisible &:focus": {
            // Can't use getFocusStyle because it doesn't support wrapping links
            // https://github.com/OfficeDev/office-ui-fabric-react/issues/4883#issuecomment-406743543
            // A box-shadow allows the focus rect to wrap links that span multiple lines
            // and helps the focus rect avoid getting clipped.
            boxShadow: `0 0 0 1px ${focusBorderColor} inset`,
            selectors: {
              [HighContrastSelector]: {
                outline: "1px solid WindowText"
              }
            }
          },
          [HighContrastSelector]: {
            // For IE high contrast mode
            borderBottom: "none"
          }
        }
      },
      isButton && {
        background: "none",
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
        display: "inline",
        margin: 0,
        overflow: "inherit",
        padding: 0,
        textAlign: "left",
        textOverflow: "inherit",
        userSelect: "text",
        borderBottom: "1px solid transparent", // For Firefox high contrast mode
        selectors: {
          [HighContrastSelectorBlack]: {
            color: "#FFFF00"
          },
          [HighContrastSelectorWhite]: {
            color: "#00009F"
          }
        }
      },
      !isButton && {
        textDecoration: "none"
      },
      isDisabled && [
        "is-disabled",
        {
          color: linkDisabledColor,
          cursor: "default"
        },
        {
          selectors: {
            "&:link, &:visited": {
              pointerEvents: "none"
            }
          }
        }
      ],
      !isDisabled && {
        selectors: {
          "&:active, &:hover, &:active:hover": {
            color: linkInteractedColor,
            textDecoration: "underline"
          },
          "&:focus": {
            color: linkColor
          }
        }
      },
      classNames.root,
      className
    ]
  }
}

export const Link: React.FunctionComponent<ILinkProps> = styled<ILinkProps, ILinkStyleProps, ILinkStyles>(
  LinkBase,
  getLinkStyles,
  undefined,
  {
    scope: "Link"
  }
)

/**
 * {@docCategory Link}
 */
export interface ILink {
  /** Sets focus to the link. */
  focus(): void
}

/**
 * {@docCategory Link}
 */
export interface ILinkHTMLAttributes<T> extends React.HTMLAttributes<T> {
  // Shared
  type?: string

  // Anchor
  download?: any
  href?: string
  hrefLang?: string
  media?: string
  rel?: string
  target?: string

  // Button
  autoFocus?: boolean
  disabled?: boolean
  form?: string
  formAction?: string
  formEncType?: string
  formMethod?: string
  formNoValidate?: boolean
  formTarget?: string
  name?: string
  value?: string | string[] | number

  // Any other props for HTMLElements or a React component passed to as=
  [index: string]: any
}

/**
 * {@docCategory Link}
 */
export interface ILinkProps extends ILinkHTMLAttributes<HTMLAnchorElement | HTMLButtonElement | HTMLElement | LinkBase> {
  /**
   * Optional callback to access the ILink interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<ILink>

  /**
   * Whether the link is disabled
   */
  disabled?: boolean

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<ILinkStyleProps, ILinkStyles>

  /**
   * Theme (provided through customization.)
   */
  theme?: ITheme

  /**
   * A component that should be used as the root element of the link returned from the Link component.
   */
  as?: string | React.ComponentClass | React.FunctionComponent

  /**
   * Optional keytip for this Link
   */
  keytipProps?: IKeytipProps
}

/**
 * {@docCategory Link}
 */
export interface ILinkStyleProps {
  className?: string
  isButton?: boolean
  isDisabled?: boolean
  theme: ITheme
}

/**
 * {@docCategory Link}
 */
export interface ILinkStyles {
  root: IStyle
}

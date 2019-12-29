import { classNamesFunction, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { getIcon, ITheme } from "@uifabric/styleguide"
import { getNativeProps, htmlElementProperties, IBaseProps } from "@uifabric/styleguide"
import * as React from "react"
import { IImageProps, Image, ImageLoadState } from "./Image"

export interface IIconState {
  imageLoadError: boolean
}


export class IconBase extends React.Component<IIconProps, IIconState> {
  constructor(props: IIconProps) {
    super(props)
    this.state = {
      imageLoadError: false
    }
  }

  public render() {
    const { ariaLabel, className, styles, iconName, imageErrorAs, theme } = this.props
    const isPlaceholder = typeof iconName === "string" && iconName.length === 0
    const isImage = this.props.iconType === IconType.image || this.props.iconType === IconType.Image
    const { iconClassName, children } = this._getIconContent(iconName)

    const classNames = classNamesFunction<IIconStyleProps, IIconStyles>()(styles, {
      theme: theme!,
      className,
      iconClassName,
      isImage,
      isPlaceholder
    })

    const containerProps = ariaLabel
      ? {
          "aria-label": ariaLabel
        }
      : {
          role: "presentation"
        }

    const RootType = isImage ? "div" : "i"
    const nativeProps = getNativeProps(this.props, htmlElementProperties)
    const { imageLoadError } = this.state
    const imageProps = {
      ...this.props.imageProps,
      onLoadingStateChange: this.onImageLoadingStateChange
    }
    const ImageType = (imageLoadError && imageErrorAs) || Image

    return (
      <RootType data-icon-name={iconName} {...nativeProps} {...containerProps} className={classNames.root}>
        {isImage ? <ImageType {...imageProps} /> : children}
      </RootType>
    )
  }

  private onImageLoadingStateChange = (state: ImageLoadState): void => {
    if (this.props.imageProps && this.props.imageProps.onLoadingStateChange) {
      this.props.imageProps.onLoadingStateChange(state)
    }
    if (state === ImageLoadState.error) {
      this.setState({ imageLoadError: true })
    }
  }

  private _getIconContent(name?: string) {
    const iconDefinition = getIcon(name) || {
      subset: {
        className: undefined
      },
      code: undefined
    }

    return {
      children: iconDefinition.code,
      iconClassName: iconDefinition.subset.className
    }
  }
}

export const getIconStyles = (props: IIconStyleProps): IIconStyles => {
  const { className, iconClassName, isPlaceholder, isImage, styles } = props

  return {
    root: [
      isImage && "ms-Icon-imageContainer",
      isPlaceholder && "ms-Icon-placeHolder",
      {
        display: "inline-block"
      },
      isPlaceholder && {
        width: "1em"
      },
      isImage && {
        overflow: "hidden"
      },
      iconClassName,
      className,
      styles && styles.root,
      styles && styles.imageContainer
    ]
  }
}

/**
 * Icons are used for rendering an individual's avatar, presence and details.
 * They are used within the PeoplePicker components.
 */
export const Icon: React.FunctionComponent<IIconProps> = styled<IIconProps, IIconStyleProps, IIconStyles>(
  IconBase,
  getIconStyles,
  undefined,
  {
    scope: "Icon"
  },
  true
)

// Please keep alphabetized
export enum IconType {
  /**
   * Render using the fabric icon font.
   */
  default = 0,

  /**
   * Render using an image, where imageProps would be used.
   */
  image = 1,

  /**
   * Deprecated, use `default`.
   * @deprecated Use `default`.
   */
  Default = 100000,

  /**
   * Deprecated, use `image`.
   * @deprecated Use `image`.
   */
  Image = 100001
}

/**
 * {@docCategory Icon}
 */
export interface IIconProps extends IBaseProps, React.HTMLAttributes<HTMLElement> {
  /**
   * The name of the icon to use from the icon font. If string is empty, a placeholder icon will be rendered the same width as an icon
   */
  iconName?: string

  /**
   * The aria label of the button for the benefit of screen readers.
   */
  ariaLabel?: string

  /**
   * The type of icon to render (image or icon font).
   */
  iconType?: IconType

  /**
   * If rendering an image icon, these props will be passed to the Image component.
   */
  imageProps?: IImageProps

  /**
   * If rendering an image icon, this function callback will be invoked in the event loading the image errors.
   */
  imageErrorAs?: React.FunctionComponent<IImageProps> | React.ComponentClass<IImageProps>

  /**
   * Gets the styles for an Icon.
   */
  styles?: IStyleFunctionOrObject<IIconStyleProps, IIconStyles>
  theme?: ITheme
}

/**
 * {@docCategory Icon}
 */
export interface IIconStyleProps {
  className?: string
  iconClassName?: string
  isPlaceholder: boolean
  isImage: boolean
  styles?: Partial<IIconStyles>
  theme?: ITheme
}

/**
 * {@docCategory Icon}
 */
export interface IIconStyles {
  root?: IStyle

  /**
   * Deprecated. Use `root`.
   * @deprecated Use `root`.
   */
  imageContainer?: IStyle
}

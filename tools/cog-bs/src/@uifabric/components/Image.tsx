import { classNamesFunction, getWindow, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { AnimationClassNames, getGlobalClassNames, ITheme } from "@uifabric/styleguide"
import { getNativeProps, imageProperties } from "@uifabric/styleguide"
import * as React from "react"


export interface IImageState {
  loadState?: ImageLoadState
}

const KEY_PREFIX = "fabricImage"

export class ImageBase extends React.Component<IImageProps, IImageState> {
  public static defaultProps = {
    shouldFadeIn: true
  }

  private static _svgRegex = /\.svg$/i

  // Make an initial assumption about the image layout until we can
  // check the rendered element. The value here only takes effect when
  // shouldStartVisible is true.
  private _coverStyle: ImageCoverStyle = ImageCoverStyle.portrait
  private _imageElement = React.createRef<HTMLImageElement>()
  private _frameElement = React.createRef<HTMLDivElement>()

  constructor(props: IImageProps) {
    super(props)

    this.state = {
      loadState: ImageLoadState.notLoaded
    }
  }

  public UNSAFE_componentWillReceiveProps(nextProps: IImageProps): void {
    if (nextProps.src !== this.props.src) {
      this.setState({
        loadState: ImageLoadState.notLoaded
      })
    } else if (this.state.loadState === ImageLoadState.loaded) {
      this._computeCoverStyle(nextProps)
    }
  }

  public componentDidUpdate(prevProps: IImageProps, prevState: IImageState) {
    this._checkImageLoaded()
    if (this.props.onLoadingStateChange && prevState.loadState !== this.state.loadState) {
      this.props.onLoadingStateChange(this.state.loadState!)
    }
  }

  public render(): JSX.Element {
    const imageProps = getNativeProps(this.props, imageProperties, ["width", "height"])
    const {
      src,
      alt,
      width,
      height,
      shouldFadeIn,
      shouldStartVisible,
      className,
      imageFit,
      role,
      maximizeFrame,
      styles,
      theme
    } = this.props
    const { loadState } = this.state
    const coverStyle = this.props.coverStyle !== undefined ? this.props.coverStyle : this._coverStyle
    const classNames = classNamesFunction<IImageStyleProps, IImageStyles>()(styles!, {
      theme: theme!,
      className,
      width,
      height,
      maximizeFrame,
      shouldFadeIn,
      shouldStartVisible,
      isLoaded: loadState === ImageLoadState.loaded || (loadState === ImageLoadState.notLoaded && this.props.shouldStartVisible),
      isLandscape: coverStyle === ImageCoverStyle.landscape,
      isCenter: imageFit === ImageFit.center,
      isCenterContain: imageFit === ImageFit.centerContain,
      isCenterCover: imageFit === ImageFit.centerCover,
      isContain: imageFit === ImageFit.contain,
      isCover: imageFit === ImageFit.cover,
      isNone: imageFit === ImageFit.none,
      isError: loadState === ImageLoadState.error,
      isNotImageFit: imageFit === undefined
    })

    // If image dimensions aren't specified, the natural size of the image is used.
    return (
      <div className={classNames.root} style={{ width: width, height: height }} ref={this._frameElement}>
        <img
          {...imageProps}
          onLoad={this._onImageLoaded}
          onError={this._onImageError}
          key={KEY_PREFIX + this.props.src || ""}
          className={classNames.image}
          ref={this._imageElement}
          src={src}
          alt={alt}
          role={role}
        />
      </div>
    )
  }

  private _onImageLoaded = (ev: React.SyntheticEvent<HTMLImageElement>): void => {
    const { src, onLoad } = this.props
    if (onLoad) {
      onLoad(ev)
    }

    this._computeCoverStyle(this.props)

    if (src) {
      this.setState({
        loadState: ImageLoadState.loaded
      })
    }
  }

  private _checkImageLoaded(): void {
    const { src } = this.props
    const { loadState } = this.state

    if (loadState === ImageLoadState.notLoaded) {
      // testing if naturalWidth and naturalHeight are greater than zero is better than checking
      // .complete, because .complete will also be set to true if the image breaks. However,
      // for some browsers, SVG images do not have a naturalWidth or naturalHeight, so fall back
      // to checking .complete for these images.
      const isLoaded: boolean = this._imageElement.current
        ? (src && (this._imageElement.current.naturalWidth > 0 && this._imageElement.current.naturalHeight > 0)) ||
          (this._imageElement.current.complete && ImageBase._svgRegex.test(src!))
        : false

      if (isLoaded) {
        this._computeCoverStyle(this.props)
        this.setState({
          loadState: ImageLoadState.loaded
        })
      }
    }
  }

  private _computeCoverStyle(props: IImageProps): void {
    const { imageFit, width, height } = props

    // Do not compute cover style if it was already specified in props
    if (
      (imageFit === ImageFit.cover ||
        imageFit === ImageFit.contain ||
        imageFit === ImageFit.centerContain ||
        imageFit === ImageFit.centerCover) &&
      this.props.coverStyle === undefined &&
      this._imageElement.current &&
      this._frameElement.current
    ) {
      // Determine the desired ratio using the width and height props.
      // If those props aren't available, measure measure the frame.
      let desiredRatio
      if (!!width && !!height && imageFit !== ImageFit.centerContain && imageFit !== ImageFit.centerCover) {
        desiredRatio = (width as number) / (height as number)
      } else {
        desiredRatio = this._frameElement.current.clientWidth / this._frameElement.current.clientHeight
      }

      // Examine the source image to determine its original ratio.
      const naturalRatio = this._imageElement.current.naturalWidth / this._imageElement.current.naturalHeight

      // Should we crop from the top or the sides?
      if (naturalRatio > desiredRatio) {
        this._coverStyle = ImageCoverStyle.landscape
      } else {
        this._coverStyle = ImageCoverStyle.portrait
      }
    }
  }

  private _onImageError = (ev: React.SyntheticEvent<HTMLImageElement>): void => {
    if (this.props.onError) {
      this.props.onError(ev)
    }
    this.setState({
      loadState: ImageLoadState.error
    })
  }
}

const GlobalClassNames = {
  root: "ms-Image",
  rootMaximizeFrame: "ms-Image--maximizeFrame",
  image: "ms-Image-image",
  imageCenter: "ms-Image-image--center",
  imageContain: "ms-Image-image--contain",
  imageCover: "ms-Image-image--cover",
  imageCenterContain: "ms-Image-image--centerContain",
  imageCenterCover: "ms-Image-image--centerCover",
  imageNone: "ms-Image-image--none",
  imageLandscape: "ms-Image-image--landscape",
  imagePortrait: "ms-Image-image--portrait"
}

export const getImageStyles = (props: IImageStyleProps): IImageStyles => {
  const {
    className,
    width,
    height,
    maximizeFrame,
    isLoaded,
    shouldFadeIn,
    shouldStartVisible,
    isLandscape,
    isCenter,
    isContain,
    isCover,
    isCenterContain,
    isCenterCover,
    isNone,
    isError,
    isNotImageFit,
    theme
  } = props

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  const ImageFitStyles: IStyle = {
    position: "absolute",
    left: "50% /* @noflip */",
    top: "50%",
    transform: "translate(-50%,-50%)" // @todo test RTL renders transform: translate(50%,-50%);
  }

  // Cut the mustard using msMaxTouchPoints to detect IE11 which does not support CSS object-fit
  const window: Window | undefined = getWindow()
  const supportsObjectFit: boolean = window !== undefined && window.navigator.msMaxTouchPoints === undefined
  const fallbackObjectFitStyles =
    (isContain && isLandscape) || (isCover && !isLandscape) ? { width: "100%", height: "auto" } : { width: "auto", height: "100%" }

  return {
    root: [
      classNames.root,
      theme.fonts.small,
      {
        overflow: "hidden"
      },
      maximizeFrame && [
        classNames.rootMaximizeFrame,
        {
          height: "100%",
          width: "100%"
        }
      ],
      isLoaded && shouldFadeIn && !shouldStartVisible && AnimationClassNames.fadeIn400,
      (isCenter || isContain || isCover || isCenterContain || isCenterCover) && {
        position: "relative"
      },
      className
    ],
    image: [
      classNames.image,
      {
        display: "block",
        opacity: 0
      },
      isLoaded && [
        "is-loaded",
        {
          opacity: 1
        }
      ],
      isCenter && [classNames.imageCenter, ImageFitStyles],
      isContain && [
        classNames.imageContain,
        supportsObjectFit && {
          width: "100%",
          height: "100%",
          objectFit: "contain"
        },
        !supportsObjectFit && fallbackObjectFitStyles,
        ImageFitStyles
      ],
      isCover && [
        classNames.imageCover,
        supportsObjectFit && {
          width: "100%",
          height: "100%",
          objectFit: "cover"
        },
        !supportsObjectFit && fallbackObjectFitStyles,
        ImageFitStyles
      ],
      isCenterContain && [
        classNames.imageCenterContain,
        isLandscape && {
          maxWidth: "100%"
        },
        !isLandscape && {
          maxHeight: "100%"
        },
        ImageFitStyles
      ],
      isCenterCover && [
        classNames.imageCenterCover,
        isLandscape && {
          maxHeight: "100%"
        },
        !isLandscape && {
          maxWidth: "100%"
        },
        ImageFitStyles
      ],
      isNone && [
        classNames.imageNone,
        {
          width: "auto",
          height: "auto"
        }
      ],
      isNotImageFit && [
        !!width &&
          !height && {
            height: "auto",
            width: "100%"
          },
        !width &&
          !!height && {
            height: "100%",
            width: "auto"
          },
        !!width &&
          !!height && {
            height: "100%",
            width: "100%"
          }
      ],
      isLandscape && classNames.imageLandscape,
      !isLandscape && classNames.imagePortrait,
      !isLoaded && "is-notLoaded",
      shouldFadeIn && "is-fadeIn",
      isError && "is-error"
    ]
  }
}

export const Image: React.FunctionComponent<IImageProps> = styled<IImageProps, IImageStyleProps, IImageStyles>(
  ImageBase,
  getImageStyles,
  undefined,
  {
    scope: "Image"
  },
  true
)

/**
 * {@docCategory Image}
 */
export interface IImage {}

/**
 * {@docCategory Image}
 */
export interface IImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Call to provide customized styling that will layer on top of the variant rules
   */
  styles?: IStyleFunctionOrObject<IImageStyleProps, IImageStyles>

  /**
   * Theme provided by HOC.
   */
  theme?: ITheme

  /**
   * Additional css class to apply to the Component
   * @defaultvalue undefined
   */
  className?: string

  /**
   * If true, fades the image in when loaded.
   * @defaultvalue true
   */
  shouldFadeIn?: boolean

  /**
   * If true, the image starts as visible and is hidden on error. Otherwise, the image is hidden until
   * it is successfully loaded. This disables shouldFadeIn.
   * @defaultvalue false;
   */
  shouldStartVisible?: boolean

  /**
   * Used to determine how the image is scaled and cropped to fit the frame.
   *
   * @defaultvalue If both dimensions are provided, then the image is fit using ImageFit.scale.
   * Otherwise, the image won't be scaled or cropped.
   */
  imageFit?: ImageFit

  /**
   * Deprecated at v1.3.6, to replace the src in case of errors, use `onLoadingStateChange` instead and
   * rerender the Image with a difference src.
   * @deprecated Use `onLoadingStateChange` instead and
   * rerender the Image with a difference src.
   */
  errorSrc?: string

  /**
   * If true, the image frame will expand to fill its parent container.
   */
  maximizeFrame?: boolean

  /**
   * Optional callback method for when the image load state has changed.
   * The 'loadState' parameter indicates the current state of the Image.
   */
  onLoadingStateChange?: (loadState: ImageLoadState) => void

  /**
   * Specifies the cover style to be used for this image. If not
   * specified, this will be dynamically calculated based on the
   * aspect ratio for the image.
   */
  coverStyle?: ImageCoverStyle
}

/**
 * The possible methods that can be used to fit the image.
 * {@docCategory Image}
 */
export enum ImageFit {
  /**
   * The image is not scaled. The image is centered and cropped within the content box.
   */
  center = 0,

  /**
   * The image is scaled to maintain its aspect ratio while being fully contained within the frame. The image will
   * be centered horizontally and vertically within the frame. The space in the top and bottom or in the sides of
   * the frame will be empty depending on the difference in aspect ratio between the image and the frame.
   */
  contain = 1,

  /**
   * The image is scaled to maintain its aspect ratio while filling the frame. Portions of the image will be cropped from
   * the top and bottom, or from the sides, depending on the difference in aspect ratio between the image and the frame.
   */
  cover = 2,

  /**
   * Neither the image nor the frame are scaled. If their sizes do not match, the image will either be cropped or the
   * frame will have empty space.
   */
  none = 3,

  /**
   * The image will be centered horizontally and vertically within the frame and maintains its aspect ratio. It will
   * behave as ImageFit.center if the image's natural height or width is less than the Image frame's height or width,
   * but if both natural height and width are larger than the frame it will behave as ImageFit.cover.
   */
  centerCover = 4,

  /**
   * The image will be centered horizontally and vertically within the frame and maintains its aspect ratio. It will
   * behave as ImageFit.center if the image's natural height and width is less than the Image frame's height and width,
   * but if either natural height or width are larger than the frame it will behave as ImageFit.contain.
   */
  centerContain = 5
}

/**
 * The cover style to be used on the image
 * {@docCategory Image}
 */
export enum ImageCoverStyle {
  /**
   * The image will be shown at 100% height of container and the width will be scaled accordingly
   */
  landscape = 0,

  /**
   * The image will be shown at 100% width of container and the height will be scaled accordingly
   */
  portrait = 1
}

/**
 * {@docCategory Image}
 */
export enum ImageLoadState {
  /**
   * The image has not yet been loaded, and there is no error yet.
   */
  notLoaded = 0,

  /**
   * The image has been loaded successfully.
   */
  loaded = 1,

  /**
   * An error has been encountered while loading the image.
   */
  error = 2,

  /**
   * Deprecated at v1.3.6, to replace the src in case of errors, use `onLoadingStateChange` instead
   * and rerender the Image with a difference src.
   * @deprecated Use `onLoadingStateChange` instead
   * and rerender the Image with a difference src.
   */
  errorLoaded = 3
}

/**
 * {@docCategory Image}
 */
export interface IImageStyleProps {
  /**
   * Accept theme prop.
   */
  theme: ITheme

  /**
   * Accept custom classNames
   */
  className?: string

  /**
   * If true, the image frame will expand to fill its parent container.
   */
  maximizeFrame?: boolean

  /**
   * If true, the image is loaded
   */
  isLoaded?: boolean

  /**
   * If true, fades the image in when loaded.
   * @defaultvalue true
   */
  shouldFadeIn?: boolean

  /**
   * If true, the image starts as visible and is hidden on error. Otherwise, the image is hidden until
   * it is successfully loaded. This disables shouldFadeIn.
   * @defaultvalue false;
   */
  shouldStartVisible?: boolean

  /**
   * If true the image is coverStyle landscape instead of portrait
   */
  isLandscape?: boolean

  /**
   * ImageFit booleans for center, cover, contain, centerContain, centerCover, none
   */
  isCenter?: boolean
  isContain?: boolean
  isCover?: boolean
  isCenterContain?: boolean
  isCenterCover?: boolean
  isNone?: boolean

  /**
   * if true image load is in error
   */
  isError?: boolean

  /**
   * if true, imageFit is undefined
   */
  isNotImageFit?: boolean

  /**
   * Image width value
   */
  width?: number | string

  /**
   * Image height value
   */
  height?: number | string
}

/**
 * {@docCategory Image}
 */
export interface IImageStyles {
  /**
   * Style set for the root div element.
   */
  root: IStyle
  /**
   * Style set for the img element.
   */
  image: IStyle
}

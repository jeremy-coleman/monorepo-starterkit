


export type IRefObject<T> = React.RefObject<T> | RefObject<T> | ((ref: T | null) => void);

export type RefObject<T> = {
  (component: T | null): void;
  current: T | null;

  /**
   * @deprecated Use .current as that is consistent the official React Api.
   */
  //value: T | null;
};


/**
 * BaseProps interface.
 *
 * @public
 * {@docCategory IBaseProps}
 */
// tslint:disable-next-line:no-any
export interface IBaseProps<T = any> {
  componentRef?: IRefObject<T>;
}


export interface IAccessiblePopupProps {
  /**
   * Sets the HTMLElement to focus on when exiting the FocusTrapZone.
   * @defaultvalue The element.target that triggered the Panel.
   */
  elementToFocusOnDismiss?: HTMLElement;

  /**
   * Indicates if this dialog will ignore keeping track of HTMLElement that activated the Zone.
   * @defaultvalue false
   */
  ignoreExternalFocusing?: boolean;

  /**
   * Indicates whether dialog should force focus inside the focus trap zone
   * @defaultvalue true
   */
  forceFocusInsideTrap?: boolean;

  /**
   * Indicates the selector for first focusable item
   */
  firstFocusableSelector?: string | (() => string);

  /**
   * Aria label on close button
   */
  closeButtonAriaLabel?: string;

  /**
   * Indicates if this dialog will allow clicks outside the FocusTrapZone
   * @defaultvalue false
   */
  isClickableOutsideFocusTrap?: boolean;
}

/**
 * Properties used by render function interface for providing overrideable render callbacks.
 *
 * @public
 * {@docCategory IComponentAsProps}
 */
export type IComponentAsProps<T> = T & { defaultRender?: React.ComponentType<T> };

/**
 * Render function interface for providing overrideable render callbacks.
 *
 * @public
 * {@docCategory IComponentAs}
 */
export type IComponentAs<T> = React.ComponentType<IComponentAsProps<T>>;

/**
 * Disposable interface.
 *
 * @public
 * {@docCategory IDisposable}
 */
export interface IDisposable {
  dispose: () => void;
}

/**
 * Point interface.
 *
 * @public
 * {@docCategory IPoint}
 */
export interface IPoint {
  x: number;
  y: number;
}

/**
 * Rectangle interface.
 *
 * @public
 * {@docCategory IRectangle}
 */
export interface IRectangle {
  left: number;
  top: number;
  width: number;
  height: number;
  right?: number;
  bottom?: number;
}

/**
 * An interface representing a component that will not output any DOM, will just render its children and
 * pass through items to modify the children.
 *
 * {@docCategory IRenderComponent}
 */
export interface IRenderComponent<TProps> {
  /**
   * JSX.Element to return in this component's render() function.
   */
  children: (props: TProps) => JSX.Element;
}

/**
 * Render function interface for providing overrideable render callbacks.
 *
 * @public
 */
export interface IRenderFunction<P> {
  (props?: P, defaultRender?: (props?: P) => JSX.Element | null): JSX.Element | null;
}

/**
 * {@docCategory ISize}
 */
export interface ISize {
  width: number;
  height: number;
}

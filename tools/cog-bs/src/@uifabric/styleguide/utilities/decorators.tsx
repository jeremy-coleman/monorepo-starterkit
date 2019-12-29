import * as React from 'react';
import { BaseComponent } from './BaseComponent';
import { getRect, getWindow } from './dom';
import { hoistMethods, unhoistMethods } from './hoist';
import { hoistStatics } from './hoistStatics';
import { findScrollableParent } from './scroll';

export class BaseDecorator<TProps, TState> extends BaseComponent<TProps, TState> {
  // tslint:disable-next-line:typedef
  protected _skipComponentRefResolution = true;

  protected _composedComponentInstance: React.Component<TProps, TState>;

  private _hoisted: string[];

  constructor(props: TProps) {
    super(props);
    this._updateComposedComponentRef = this._updateComposedComponentRef.bind(this);
  }

  /**
   * Updates the ref to the component composed by the decorator, which will also take care of hoisting
   * (and unhoisting as appropriate) methods from said component.
   *
   * Pass this method as the argument to the 'ref' property of the composed component.
   */
  protected _updateComposedComponentRef(composedComponentInstance: React.Component<TProps, TState>): void {
    this._composedComponentInstance = composedComponentInstance;
    if (composedComponentInstance) {
      this._hoisted = hoistMethods(this, composedComponentInstance);
    } else if (this._hoisted) {
      unhoistMethods(this, this._hoisted);
    }
  }
}


export function withContainsFocus<TProps extends { containsFocus?: boolean }, S>(
  ComposedComponent: new (props: TProps, ...args: any[]) => React.Component<TProps, S>
): any {
  return class WithContainsFocusComponent extends BaseDecorator<TProps & { containsFocus?: boolean }, { containsFocus?: boolean }> {
    private _newContainsFocus: boolean;
    private _delayedSetContainsFocus: () => void;

    constructor(props: TProps) {
      super(props);

      this.state = {
        containsFocus: false
      };

      this._delayedSetContainsFocus = this._async.debounce(this._setContainsFocus, 20);
      this._updateComposedComponentRef = this._updateComposedComponentRef.bind(this);
      this._handleFocus = this._handleFocus.bind(this);
      this._handleBlur = this._handleBlur.bind(this);
    }

    public componentWillUnmount(): void {
      this._async.dispose();
    }

    public render(): JSX.Element {
      const { containsFocus } = this.state;

      return (
        <div onFocus={this._handleFocus} onBlur={this._handleBlur}>
          <ComposedComponent ref={this._updateComposedComponentRef} containsFocus={containsFocus} {...this.props as any} />
        </div>
      );
    }

    public forceUpdate(): void {
      this._composedComponentInstance.forceUpdate();
    }

    private _handleFocus(ev: React.FocusEvent<HTMLDivElement>): void {
      this._newContainsFocus = true;
      this._delayedSetContainsFocus();
    }

    private _handleBlur(ev: React.FocusEvent<HTMLDivElement>): void {
      this._newContainsFocus = false;
      this._delayedSetContainsFocus();
    }

    private _setContainsFocus(): void {
      if (this.state.containsFocus !== this._newContainsFocus) {
        this.setState({ containsFocus: this._newContainsFocus });
      }
    }
  };
}

//import { getWindow, hoistStatics } from '../utilities';

export interface IWithResponsiveModeState {
  responsiveMode?: ResponsiveMode;
}

export enum ResponsiveMode {
  small = 0,
  medium = 1,
  large = 2,
  xLarge = 3,
  xxLarge = 4,
  xxxLarge = 5
}

const RESPONSIVE_MAX_CONSTRAINT = [479, 639, 1023, 1365, 1919, 99999999];

let _defaultMode: ResponsiveMode | undefined;

/**
 * Allows a server rendered scenario to provide a default responsive mode.
 */
export function setResponsiveMode(responsiveMode: ResponsiveMode | undefined): void {
  _defaultMode = responsiveMode;
}

export function withResponsiveMode<TProps extends { responsiveMode?: ResponsiveMode }, TState>(
  ComposedComponent: new (props: TProps, ...args: any[]) => React.Component<TProps, TState>
): any {
  const resultClass = class WithResponsiveMode extends BaseDecorator<TProps, IWithResponsiveModeState> {
    constructor(props: TProps) {
      super(props);
      this._updateComposedComponentRef = this._updateComposedComponentRef.bind(this);

      this.state = {
        responsiveMode: this._getResponsiveMode()
      };
    }

    public componentDidMount(): void {
      this._events.on(window, 'resize', () => {
        const responsiveMode = this._getResponsiveMode();

        if (responsiveMode !== this.state.responsiveMode) {
          this.setState({
            responsiveMode: responsiveMode
          });
        }
      });
    }

    public componentWillUnmount(): void {
      this._events.dispose();
    }

    public render(): JSX.Element {
      const { responsiveMode } = this.state;

      return <ComposedComponent ref={this._updateComposedComponentRef} responsiveMode={responsiveMode} {...this.props as any} />;
    }

    private _getResponsiveMode(): ResponsiveMode {
      let responsiveMode = ResponsiveMode.small;
      const win = getWindow();

      if (typeof win !== 'undefined') {
        try {
          while (win.innerWidth > RESPONSIVE_MAX_CONSTRAINT[responsiveMode]) {
            responsiveMode++;
          }
        } catch (e) {
          // Return a best effort result in cases where we're in the browser but it throws on getting innerWidth.
          responsiveMode = ResponsiveMode.large;
        }
      } else {
        if (_defaultMode !== undefined) {
          responsiveMode = _defaultMode;
        } else {
          throw new Error(
            'Content was rendered in a server environment without providing a default responsive mode. ' +
              'Call setResponsiveMode to define what the responsive mode is.'
          );
        }
      }

      return responsiveMode;
    }
  };
  return hoistStatics(ComposedComponent, resultClass);
}

//import { findScrollableParent, getRect, getWindow } from '../utilities';

/**
 * Viewport rectangle dimensions.
 *
 * {@docCategory DetailsList}
 */
export interface IViewport {
  /**
   * Width in pixels.
   */
  width: number;
  /**
   * Height in pixels.
   */
  height: number;
}

export interface IWithViewportState {
  viewport?: IViewport;
}

/**
 * Props interface for the withViewport component.
 *
 * {@docCategory DetailsList}
 */
export interface IWithViewportProps {
  /**
   * Whether or not to use ResizeObserver (if available) to detect
   * and measure viewport on 'resize' events.
   *
   * Falls back to window 'resize' event.
   *
   * @defaultValue false
   */
  skipViewportMeasures?: boolean;
}

const RESIZE_DELAY = 500;
const MAX_RESIZE_ATTEMPTS = 3;

/**
 * A decorator to update decorated component on viewport or window resize events.
 *
 * @param ComposedComponent decorated React component reference.
 */
export function withViewport<TProps extends { viewport?: IViewport }, TState>(
  ComposedComponent: new (props: TProps, ...args: any[]) => React.Component<TProps, TState>
): any {
  return class WithViewportComponent extends BaseDecorator<TProps, IWithViewportState> {
    private _root = React.createRef<HTMLDivElement>();
    private _resizeAttempts: number;
    private _viewportResizeObserver: any;

    constructor(props: TProps) {
      super(props);
      this._resizeAttempts = 0;

      this.state = {
        viewport: {
          width: 0,
          height: 0
        }
      };
    }

    public componentDidMount(): void {
      const { skipViewportMeasures } = this.props as IWithViewportProps;
      const win = getWindow();

      this._onAsyncResize = this._async.debounce(this._onAsyncResize, RESIZE_DELAY, {
        leading: false
      });

      // ResizeObserver seems always fire even window is not resized. This is
      // particularly bad when skipViewportMeasures is set when optimizing fixed layout lists.
      // It will measure and update and re-render the entire list after list is fully rendered.
      // So fallback to listen to resize event when skipViewportMeasures is set.
      if (!skipViewportMeasures && this._isResizeObserverAvailable()) {
        this._registerResizeObserver();
      } else {
        this._events.on(win, 'resize', this._onAsyncResize);
      }

      if (!skipViewportMeasures) {
        this._updateViewport();
      }
    }

    public componentDidUpdate(newProps: TProps) {
      const { skipViewportMeasures: oldSkipViewportMeasures } = this.props as IWithViewportProps;
      const { skipViewportMeasures: newSkipViewportMeasures } = newProps as IWithViewportProps;
      const win = getWindow();

      if (oldSkipViewportMeasures !== newSkipViewportMeasures) {
        if (newSkipViewportMeasures) {
          this._unregisterResizeObserver();
          this._events.on(win, 'resize', this._onAsyncResize);
        } else if (!newSkipViewportMeasures && this._isResizeObserverAvailable()) {
          this._events.off(win, 'resize', this._onAsyncResize);
          this._registerResizeObserver();
        }
      }
    }

    public componentWillUnmount(): void {
      this._events.dispose();

      if (this._viewportResizeObserver) {
        this._viewportResizeObserver.disconnect();
      }
    }

    public render(): JSX.Element {
      const { viewport } = this.state;
      const { skipViewportMeasures } = this.props as IWithViewportProps;
      const isViewportVisible = skipViewportMeasures || (viewport!.width > 0 && viewport!.height > 0);

      return (
        <div className="ms-Viewport" ref={this._root} style={{ minWidth: 1, minHeight: 1 }}>
          {isViewportVisible && <ComposedComponent ref={this._updateComposedComponentRef} viewport={viewport} {...this.props as any} />}
        </div>
      );
    }

    public forceUpdate(): void {
      this._updateViewport(true);
    }

    private _onAsyncResize(): void {
      this._updateViewport();
    }

    private _isResizeObserverAvailable(): boolean {
      const win = getWindow();

      return win && (win as any).ResizeObserver;
    }

    private _registerResizeObserver = () => {
      const win = getWindow();

      this._viewportResizeObserver = new (win as any).ResizeObserver(this._onAsyncResize);
      this._viewportResizeObserver.observe(this._root.current);
    };

    private _unregisterResizeObserver = () => {
      if (this._viewportResizeObserver) {
        this._viewportResizeObserver.disconnect();
        this._viewportResizeObserver = null;
      }
    };

    /* Note: using lambda here because decorators don't seem to work in decorators. */
    private _updateViewport = (withForceUpdate?: boolean) => {
      const { viewport } = this.state;
      const viewportElement = this._root.current;
      const scrollElement = findScrollableParent(viewportElement);
      const scrollRect = getRect(scrollElement);
      const clientRect = getRect(viewportElement);
      const updateComponent = () => {
        if (withForceUpdate && this._composedComponentInstance) {
          this._composedComponentInstance.forceUpdate();
        }
      };

      const isSizeChanged = (clientRect && clientRect.width) !== viewport!.width || (scrollRect && scrollRect.height) !== viewport!.height;

      if (isSizeChanged && this._resizeAttempts < MAX_RESIZE_ATTEMPTS && clientRect && scrollRect) {
        this._resizeAttempts++;
        this.setState(
          {
            viewport: {
              width: clientRect.width,
              height: scrollRect.height
            }
          },
          () => {
            this._updateViewport(withForceUpdate);
          }
        );
      } else {
        this._resizeAttempts = 0;
        updateComponent();
      }
    };
  };
}

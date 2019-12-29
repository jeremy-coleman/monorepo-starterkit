import { concatStyleSets } from '../merge-styles';
import * as React from 'react';
import { GlobalSettings } from './GlobalSettings';
import { hoistStatics } from './hoistStatics';
import { IBaseProps } from './types';

export interface ICustomizerContext {
  customizations: ICustomizations;
}

export const CustomizerContext = React.createContext<ICustomizerContext>({
  customizations: {
    inCustomizerContext: false,
    settings: {},
    scopedSettings: {}
  }
});

export function customizable(
  scope: string,
  fields: string[],
  concatStyles?: boolean
  // tslint:disable-next-line:no-any
): <P>(ComposedComponent: React.ComponentType<P>) => any {
  // tslint:disable-next-line:no-shadowed-variable
  return function customizableFactory<P>(
    // tslint:disable-next-line:no-any
    ComposedComponent: React.ComponentType<P>
    // tslint:disable-next-line:no-any
  ): any {
    const resultClass = class ComponentWithInjectedProps extends React.Component<P, {}> {
      public static displayName: string = 'Customized' + scope;

      // tslint:disable-next-line:no-any
      constructor(props: P) {
        super(props);

        this._onSettingChanged = this._onSettingChanged.bind(this);
      }

      public componentDidMount(): void {
        Customizations.observe(this._onSettingChanged);
      }

      public componentWillUnmount(): void {
        Customizations.unobserve(this._onSettingChanged);
      }

      public render(): JSX.Element {
        return (
          <CustomizerContext.Consumer>
            {(context: ICustomizerContext) => {
              const defaultProps = Customizations.getSettings(fields, scope, context.customizations);

              // tslint:disable-next-line:no-any
              const componentProps = this.props as any;

              // If defaultProps.styles is a function, evaluate it before calling concatStyleSets
              if (defaultProps.styles && typeof defaultProps.styles === 'function') {
                defaultProps.styles = defaultProps.styles({ ...defaultProps, ...componentProps });
              }

              if (concatStyles) {
                const mergedStyles = concatStyleSets(defaultProps.styles, componentProps.styles);
                return <ComposedComponent {...defaultProps} {...componentProps} styles={mergedStyles} />;
              }

              return <ComposedComponent {...defaultProps} {...componentProps} />;
            }}
          </CustomizerContext.Consumer>
        );
      }

      private _onSettingChanged(): void {
        this.forceUpdate();
      }
    };

    return hoistStatics(ComposedComponent, resultClass);
  };
}


// tslint:disable-next-line:no-any
export type ISettings = { [key: string]: any };
export type ISettingsFunction = (settings: ISettings) => ISettings;

/**
 * @deprecated Use ISettings.
 */
export type Settings = ISettings;

/**
 * @deprecated Use ISettingsFunction.
 */
export type SettingsFunction = ISettingsFunction;

export interface ICustomizations {
  settings: ISettings;
  scopedSettings: { [key: string]: ISettings };
  inCustomizerContext?: boolean;
}

const CustomizationsGlobalKey = 'customizations';
const NO_CUSTOMIZATIONS = { settings: {}, scopedSettings: {}, inCustomizerContext: false };

let _allSettings = GlobalSettings.getValue<ICustomizations>(CustomizationsGlobalKey, {
  settings: {},
  scopedSettings: {},
  inCustomizerContext: false
});

let _events: (() => void)[] = [];

export class Customizations {
  public static reset(): void {
    _allSettings.settings = {};
    _allSettings.scopedSettings = {};
  }

  // tslint:disable-next-line:no-any
  public static applySettings(settings: ISettings): void {
    _allSettings.settings = { ..._allSettings.settings, ...settings };
    Customizations._raiseChange();
  }

  // tslint:disable-next-line:no-any
  public static applyScopedSettings(scopeName: string, settings: ISettings): void {
    _allSettings.scopedSettings[scopeName] = { ..._allSettings.scopedSettings[scopeName], ...settings };
    Customizations._raiseChange();
  }

  public static getSettings(
    properties: string[],
    scopeName?: string,
    localSettings: ICustomizations = NO_CUSTOMIZATIONS
    // tslint:disable-next-line:no-any
  ): any {
    // tslint:disable-next-line:no-any
    const settings: ISettings = {};
    const localScopedSettings = (scopeName && localSettings.scopedSettings[scopeName]) || {};
    const globalScopedSettings = (scopeName && _allSettings.scopedSettings[scopeName]) || {};

    for (let property of properties) {
      settings[property] =
        localScopedSettings[property] ||
        localSettings.settings[property] ||
        globalScopedSettings[property] ||
        _allSettings.settings[property];
    }

    return settings;
  }

  public static observe(onChange: () => void): void {
    _events.push(onChange);
  }

  public static unobserve(onChange: () => void): void {
    _events = _events.filter((cb: () => void) => cb !== onChange);
  }

  private static _raiseChange(): void {
    _events.forEach((cb: () => void) => cb());
  }
}



export class Customizer extends React.Component<ICustomizerProps> {
  public componentDidMount(): void {
    Customizations.observe(this._onCustomizationChange);
  }

  public componentWillUnmount(): void {
    Customizations.unobserve(this._onCustomizationChange);
  }

  public render(): React.ReactElement<{}> {
    const { contextTransform } = this.props;
    return (
      <CustomizerContext.Consumer>
        {(parentContext: ICustomizerContext) => {
          let newContext = mergeCustomizations(this.props, parentContext);

          if (contextTransform) {
            newContext = contextTransform(newContext);
          }

          return <CustomizerContext.Provider value={newContext}>{this.props.children}</CustomizerContext.Provider>;
        }}
      </CustomizerContext.Consumer>
    );
  }

  private _onCustomizationChange = () => this.forceUpdate();
}


export type ICustomizerProps = IBaseProps &
  Partial<{
    settings: ISettings | ISettingsFunction;
    scopedSettings: ISettings | ISettingsFunction;
  }> & {
    contextTransform?: (context: Readonly<ICustomizerContext>) => ICustomizerContext;
  };





/**
 * Merge props and customizations giving priority to props over context.
 * NOTE: This function will always perform multiple merge operations. Use with caution.
 * @param props - New settings to merge in.
 * @param parentContext - Context containing current settings.
 * @returns Merged customizations.
 */
export function mergeCustomizations(props: ICustomizerProps, parentContext: ICustomizerContext): ICustomizerContext {
  const { customizations = { settings: {}, scopedSettings: {} } } = parentContext || {};

  return {
    customizations: {
      settings: mergeSettings(customizations.settings, props.settings),
      scopedSettings: mergeScopedSettings(customizations.scopedSettings, props.scopedSettings),
      inCustomizerContext: true
    }
  };
}


/**
 * Merge new and old settings, giving priority to new settings.
 * New settings is optional in which case oldSettings is returned as-is.
 * @param oldSettings - Old settings to fall back to.
 * @param newSettings - New settings that will be merged over oldSettings.
 * @returns Merged settings.
 */
export function mergeSettings(oldSettings: ISettings = {}, newSettings?: ISettings | ISettingsFunction): ISettings {
  const mergeSettingsWith = _isSettingsFunction(newSettings) ? newSettings : _settingsMergeWith(newSettings);

  return mergeSettingsWith(oldSettings);
}

export function mergeScopedSettings(oldSettings: ISettings = {}, newSettings?: ISettings | ISettingsFunction): ISettings {
  const mergeSettingsWith = _isSettingsFunction(newSettings) ? newSettings : _scopedSettingsMergeWith(newSettings);

  return mergeSettingsWith(oldSettings);
}

function _isSettingsFunction(settings?: ISettings | ISettingsFunction): settings is ISettingsFunction {
  return typeof settings === 'function';
}

function _settingsMergeWith(newSettings?: object): (settings: ISettings) => ISettings {
  return (settings: ISettings) => (newSettings ? { ...settings, ...newSettings } : settings);
}

function _scopedSettingsMergeWith(scopedSettingsFromProps: ISettings = {}): (scopedSettings: ISettings) => ISettings {
  return (oldScopedSettings: ISettings): ISettings => {
    const newScopedSettings: ISettings = { ...oldScopedSettings };

    for (let scopeName in scopedSettingsFromProps) {
      if (scopedSettingsFromProps.hasOwnProperty(scopeName)) {
        newScopedSettings[scopeName] = { ...oldScopedSettings[scopeName], ...scopedSettingsFromProps[scopeName] };
      }
    }

    return newScopedSettings;
  };
}

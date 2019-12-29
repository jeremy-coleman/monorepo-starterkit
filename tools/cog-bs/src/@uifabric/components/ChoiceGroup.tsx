import { classNamesFunction, IStyle, IStyleFunctionOrObject, styled } from "@uifabric/styleguide"
import { getGlobalClassNames, ITheme } from "@uifabric/styleguide"
import {
  divProperties,
  find,
  getId,
  getNativeProps,
  initializeComponentRef,
  IRefObject,
  IRenderFunction,
  warnDeprecations,
  warnMutuallyExclusive
} from "@uifabric/styleguide"
import * as React from "react"
import {
  ChoiceGroupOption,
  IChoiceGroupOptionStyleProps,
  IChoiceGroupOptionStyles,
  OnChangeCallback,
  OnFocusCallback
} from "./ChoiceGroupOption"
import { IIconProps } from "./Icon"
import { Label } from "./Label"


export interface IChoiceGroupState {
  keyChecked: string | number

  /** Is true when the control has focus. */
  keyFocused?: string | number
}

/**
 * {@docCategory ChoiceGroup}
 */
export class ChoiceGroupBase extends React.Component<IChoiceGroupProps, IChoiceGroupState> implements IChoiceGroup {
  public static defaultProps: IChoiceGroupProps = {
    options: []
  }

  private _id: string
  private _labelId: string
  private _inputElement = React.createRef<HTMLInputElement>()
  private focusedVars: { [key: string]: OnFocusCallback } = {}
  private changedVars: { [key: string]: OnChangeCallback } = {}

  constructor(props: IChoiceGroupProps) {
    super(props)

    initializeComponentRef(this)

    if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
      warnDeprecations("ChoiceGroup", props, { onChanged: "onChange" })
      warnMutuallyExclusive("ChoiceGroup", props, {
        selectedKey: "defaultSelectedKey"
      })
    }

    const validDefaultSelectedKey: boolean = !!props.options && props.options.some((option) => option.key === props.defaultSelectedKey)

    this.state = {
      keyChecked:
        props.defaultSelectedKey === undefined || !validDefaultSelectedKey ? this._getKeyChecked(props)! : props.defaultSelectedKey,
      keyFocused: undefined
    }

    this._id = getId("ChoiceGroup")
    this._labelId = getId("ChoiceGroupLabel")
  }

  /**
   * Gets the current checked option.
   */
  public get checkedOption(): IChoiceGroupOption | undefined {
    const { options = [] } = this.props
    const { keyChecked: key } = this.state
    return find(options, (value: IChoiceGroupOption) => value.key === key)
  }

  public UNSAFE_componentWillReceiveProps(newProps: IChoiceGroupProps): void {
    const newKeyChecked = this._getKeyChecked(newProps)
    const oldKeyChecked = this._getKeyChecked(this.props)

    if (newKeyChecked !== oldKeyChecked) {
      this.setState({
        keyChecked: newKeyChecked!
      })
    }
  }

  public render(): JSX.Element {
    const { className, theme, styles, options, label, required, disabled, name, role } = this.props
    const { keyChecked, keyFocused } = this.state

    const divProps = getNativeProps(this.props, divProperties, ["onChange", "className", "required"])

    const classNames = classNamesFunction<IChoiceGroupStyleProps, IChoiceGroupStyles>()(styles!, {
      theme: theme!,
      className,
      optionsContainIconOrImage: options!.some((option) => Boolean(option.iconProps || option.imageSrc))
    })

    const ariaLabelledBy = this.props.ariaLabelledBy
      ? this.props.ariaLabelledBy
      : label
      ? this._id + "-label"
      : (this.props as any)["aria-labelledby"]

    return (
      <div role={role} className={classNames.applicationRole} {...divProps}>
        <div className={classNames.root} role="radiogroup" {...(ariaLabelledBy && { "aria-labelledby": ariaLabelledBy })}>
          {label && (
            <Label className={classNames.label} required={required} id={this._id + "-label"}>
              {label}
            </Label>
          )}
          <div className={classNames.flexContainer}>
            {options!.map((option: IChoiceGroupOption) => {
              const innerOptionProps = {
                ...option,
                focused: option.key === keyFocused,
                checked: option.key === keyChecked,
                disabled: option.disabled || disabled,
                id: `${this._id}-${option.key}`,
                labelId: `${this._labelId}-${option.key}`,
                name: name || this._id,
                required
              }

              return (
                <ChoiceGroupOption
                  key={option.key}
                  onBlur={this._onBlur}
                  onFocus={this._onFocus(option.key)}
                  onChange={this._onChange(option.key)}
                  {...innerOptionProps}
                />
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  public focus() {
    const { options } = this.props
    if (options) {
      for (const option of options) {
        const elementToFocus = document.getElementById(`${this._id}-${option.key}`)
        if (elementToFocus && elementToFocus.getAttribute("data-is-focusable") === "true") {
          elementToFocus.focus() // focus on checked or default focusable key
          return
        }
      }
    }
    if (this._inputElement.current) {
      this._inputElement.current.focus()
    }
  }

  private _onFocus = (key: string) =>
    this.focusedVars[key]
      ? this.focusedVars[key]
      : (this.focusedVars[key] = (ev: React.FocusEvent<HTMLElement>, option: IChoiceGroupOption) => {
          this.setState({
            keyFocused: key,
            keyChecked: this.state.keyChecked
          })
        })

  private _onBlur = (ev: React.FocusEvent<HTMLElement>, option: IChoiceGroupOption) => {
    this.setState({
      keyFocused: undefined,
      keyChecked: this.state.keyChecked
    })
  }

  private _onChange = (key: string) =>
    this.changedVars[key]
      ? this.changedVars[key]
      : (this.changedVars[key] = (evt, option: IChoiceGroupOption) => {
          const { onChanged, onChange, selectedKey, options = [] } = this.props

          // Only manage state in uncontrolled scenarios.
          if (selectedKey === undefined) {
            this.setState({
              keyChecked: key
            })
          }

          const originalOption = find(options, (value: IChoiceGroupOption) => value.key === key)

          // TODO: onChanged deprecated, remove else if after 07/17/2017 when onChanged has been removed.
          if (onChange) {
            onChange(evt, originalOption)
          } else if (onChanged) {
            onChanged(originalOption!)
          }
        })

  private _getKeyChecked(props: IChoiceGroupProps): string | number | undefined {
    if (props.selectedKey !== undefined) {
      return props.selectedKey
    }

    const { options = [] } = props

    const optionsChecked = options.filter((option: IChoiceGroupOption) => {
      return option.checked
    })

    if (optionsChecked.length === 0) {
      return undefined
    } else {
      return optionsChecked[0].key
    }
  }
}

const GlobalClassNames = {
  root: "ms-ChoiceFieldGroup",
  flexContainer: "ms-ChoiceFieldGroup-flexContainer"
}

export const getChoiceGroupStyles = (props: IChoiceGroupStyleProps): IChoiceGroupStyles => {
  const { className, optionsContainIconOrImage, theme } = props

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  return {
    applicationRole: className,
    root: [
      classNames.root,
      theme.fonts.small,
      {
        display: "block"
      }
    ],
    flexContainer: [
      classNames.flexContainer,
      optionsContainIconOrImage && {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap"
      }
    ]
  }
}

export const ChoiceGroup: React.FunctionComponent<IChoiceGroupProps> = styled<
  IChoiceGroupProps,
  IChoiceGroupStyleProps,
  IChoiceGroupStyles
>(ChoiceGroupBase, getChoiceGroupStyles, undefined, { scope: "ChoiceGroup" })

/**
 * {@docCategory ChoiceGroup}
 */
export interface IChoiceGroup {
  /**
   * Gets the current checked option.
   */
  checkedOption: IChoiceGroupOption | undefined

  /**
   * Sets focus to the choiceGroup.
   */
  focus: () => void
}

/**
 * {@docCategory ChoiceGroup}
 */
export interface IChoiceGroupProps extends React.InputHTMLAttributes<HTMLElement | HTMLInputElement> {
  /**
   * Optional callback to access the IChoiceGroup interface. Use this instead of ref for accessing
   * the public methods and properties of the component.
   */
  componentRef?: IRefObject<IChoiceGroup>

  /**
   * The options for the choice group.
   */
  options?: IChoiceGroupOption[]

  /**
   * The key of the option that will be initially checked.
   */
  defaultSelectedKey?: string | number

  /**
   * The key of the selected option. If you provide this, you must maintain selection
   * state by observing onChange events and passing a new value in when changed.
   */
  selectedKey?: string | number

  /**
   * A callback for receiving a notification when the choice has been changed.
   */
  onChange?: (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: IChoiceGroupOption) => void

  /**
   * Descriptive label for the choice group.
   */
  label?: string

  /**
   * Deprecated and will be removed by 07/17/2017. Use `onChange` instead.
   * @deprecated Use `onChange` instead.
   */
  onChanged?: (option: IChoiceGroupOption, evt?: React.FormEvent<HTMLElement | HTMLInputElement>) => void

  /**
   * Theme (provided through customization.)
   */
  theme?: ITheme

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<IChoiceGroupStyleProps, IChoiceGroupStyles>

  /**
   * Aria labelled by prop for the ChoiceGroup itself
   */
  ariaLabelledBy?: string
}

/**
 * {@docCategory ChoiceGroup}
 */
export interface IChoiceGroupOption extends React.HTMLAttributes<HTMLElement | HTMLInputElement> {
  /**
   * A required key to uniquely identify the option.
   */
  key: string

  /**
   * The text string for the option.
   */
  text: string

  /**
   * Optional override of option render
   */
  onRenderField?: IRenderFunction<IChoiceGroupOption>

  /**
   * Optional override of label render
   */
  onRenderLabel?: (option: IChoiceGroupOption) => JSX.Element

  /**
   * The Icon component props for choice field
   */
  iconProps?: IIconProps

  /**
   * The src of image for choice field.
   */
  imageSrc?: string

  /**
   * The alt of image for choice field. Defaults to '' if not set.
   */
  imageAlt?: string

  /**
   * The src of image for choice field which is selected.
   */
  selectedImageSrc?: string

  /**
   * The width and height of the image in px for choice field.
   * @defaultvalue \{ width: 32, height: 32 \}
   */
  imageSize?: { width: number; height: number }

  /**
   * Whether or not the option is disabled.
   */
  disabled?: boolean

  /**
   * Whether or not the option is checked.
   */
  checked?: boolean

  /**
   * DOM id to tag the ChoiceGroup input with, for reference.
   * Should be used for 'aria-owns' and other such uses, rather than direct reference for programmatic purposes.
   */
  id?: string

  /**
   * DOM id to tag the ChoiceGroup label with, for reference.
   * Should be used for 'aria-owns' and other such uses, rather than direct reference for programmatic purposes.
   */
  labelId?: string

  /**
   * The aria label of the ChoiceGroupOption for the benefit of screen readers.
   */
  ariaLabel?: string

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<IChoiceGroupOptionStyleProps, IChoiceGroupOptionStyles>
}

/**
 * {@docCategory ChoiceGroup}
 */
export interface IChoiceGroupStyleProps {
  theme: ITheme
  className?: string
  optionsContainIconOrImage?: boolean
}

/**
 * {@docCategory ChoiceGroup}
 */
export interface IChoiceGroupStyles {
  applicationRole?: IStyle
  root?: IStyle
  label?: IStyle
  flexContainer?: IStyle
}

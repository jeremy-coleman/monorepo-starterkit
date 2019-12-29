import { MessageBar, MessageBarType } from "@uifabric/components"
import { concatStyleSets, IStyle, memoizeFunction, mergeStyleSets } from "@uifabric/styleguide"
import { FontWeights, getTheme, ITheme } from "@uifabric/styleguide"
import * as React from "react"

export interface IValidationErrorsStyles {
  root?: IStyle
  error?: IStyle
  errorLabel?: IStyle
}

const ValidationCSS = (theme: ITheme): IValidationErrorsStyles => {
  return {
    root: {},
    error: {},
    errorLabel: {
      fontWeight: FontWeights.semibold
    }
  }
}

const getStyles = memoizeFunction((theme: ITheme, customStyles?: IValidationErrorsStyles) => {
  return concatStyleSets(ValidationCSS(theme || getTheme()), customStyles)
})

export interface IValidationErrorsClassNames {
  root?: string
  error?: string
  errorLabel?: string
}

const getClassNames = memoizeFunction((styles: IValidationErrorsStyles, className?: string) => {
  return mergeStyleSets({
    root: ["validation-errors", className, styles.root],
    error: ["validation-errors-error", styles.error],
    errorLabel: ["validation-errors-error-label", styles.errorLabel]
  })
})

export interface IValidationErrorsProps {
  errors?: any[]
  className?: string
  styles?: IValidationErrorsStyles
}

export class ValidationErrors extends React.Component<IValidationErrorsProps, any> {
  private _classNames: IValidationErrorsClassNames
  protected _renderError = (error: any, idx: number) => {
    return (
      <MessageBar key={idx} className={this._classNames.error} messageBarType={MessageBarType.error}>
        {error.keyTitle ? <label className={this._classNames.errorLabel}>{error.keyTitle}: </label> : undefined}
        {error.message}
      </MessageBar>
    )
  }
  render() {
    this._classNames = getClassNames(getStyles(null, this.props.styles), this.props.className)
    if (this.props.errors && this.props.errors.length > 0) {
      const errors = this.props.errors.map(this._renderError)
      return <div className={this._classNames.root}>{errors}</div>
    }
    return null
  }
}

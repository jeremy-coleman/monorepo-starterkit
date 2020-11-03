import { getTheme, mergeStyleSets } from "@fluentui/react"
import * as React from "react"

export type IStyleFunction<Props> = (props: Props) => Partial<Props>

const _augmentations = {}

export interface IComponentOptions {
  scope: string
  state?: React.ComponentType<any>
  styles?: any
  view?: React.ComponentType<any>
}

export function createComponent<Props>({ scope, state, styles, view }: IComponentOptions) {
  const result = (userProps: Props) => {
    const augmented = _augmentations[scope] || {}
    const StateComponent = augmented.state || state
    const ViewComponent = augmented.view || view
    const getStyles = augmented.styles || styles
    const theme = getTheme()

    ViewComponent.displayName = ViewComponent.displayName || scope + "View"
    const content = (processedProps: Props) => {
      let styles: Props | undefined = undefined

      switch (typeof getStyles) {
        case "function":
          styles = getStyles({ theme, ...(processedProps as {}) })
          break
        case "object":
          styles = getStyles
          break
        default:
          break
      }

      return <ViewComponent {...processedProps} styles={mergeStyleSets(styles)} />
    }

    return !!StateComponent ? <StateComponent>{content}</StateComponent> : content(userProps)
  }

  result.displayName = scope

  return result as React.ComponentType<Props>
}

// Helper function to augment existing components that have been created.

export function augmentComponent(options: IComponentOptions) {
  _augmentations[options.scope] = {
    ..._augmentations[options.scope],
    ...options
  }
}

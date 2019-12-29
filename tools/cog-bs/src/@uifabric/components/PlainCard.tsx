import { classNamesFunction, styled } from "@uifabric/styleguide"
import { getGlobalClassNames, HighContrastSelector } from "@uifabric/styleguide"
import { IRenderFunction, KeyCodes } from "@uifabric/styleguide"
import * as React from "react"
import { IBaseCardProps, IBaseCardStyleProps, IBaseCardStyles } from "./BaseCard"
import { CardCallout } from "./CardCallout"

export interface IPlainCard {}

export interface IPlainCardProps extends IBaseCardProps<IPlainCard, IPlainCardStyles, IPlainCardStyleProps> {
  /**
   *  Render function to populate compact content area
   */
  onRenderPlainCard?: IRenderFunction<any>
}

export interface IPlainCardStyleProps extends IBaseCardStyleProps {}
export interface IPlainCardStyles extends IBaseCardStyles {}

const GlobalClassNames = {
  root: "ms-PlainCard-root"
}

function getStyles(props: IPlainCardStyleProps): IPlainCardStyles {
  const { theme, className } = props

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  return {
    root: [
      classNames.root,
      {
        pointerEvents: "auto",
        selectors: {
          [HighContrastSelector]: {
            border: "1px solid WindowText"
          }
        }
      },
      className
    ]
  }
}


export class PlainCardBase extends React.Component<IPlainCardProps, {}> {
  private _classNames: { [key in keyof IPlainCardStyles]: string }

  public render(): JSX.Element {
    const { styles, theme, className } = this.props

    this._classNames = classNamesFunction<IPlainCardStyleProps, IPlainCardStyles>()(styles!, {
      theme: theme!,
      className
    })

    const content: JSX.Element = (
      <div onMouseEnter={this.props.onEnter} onMouseLeave={this.props.onLeave} onKeyDown={this._onKeyDown}>
        {this.props.onRenderPlainCard!(this.props.renderData)}
      </div>
    )

    return <CardCallout {...this.props} content={content} className={this._classNames.root} />
  }

  private _onKeyDown = (ev: React.KeyboardEvent<HTMLElement>): void => {
    if (ev.which === KeyCodes.escape) {
      this.props.onLeave && this.props.onLeave(ev)
    }
  }
}

export const PlainCard: React.FunctionComponent<IPlainCardProps> = styled<IPlainCardProps, IPlainCardStyleProps, IPlainCardStyles>(
  PlainCardBase,
  getStyles,
  undefined,
  {
    scope: "PlainCard"
  }
)

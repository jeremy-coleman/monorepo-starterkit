import { classNamesFunction, getWindow, IStyle, IStyleFunctionOrObject } from "@uifabric/styleguide"
import { getGlobalClassNames, ITheme } from "@uifabric/styleguide"
import { divProperties, getNativeProps, IRefObject, isDirectionalKeyCode, on, styled } from "@uifabric/styleguide"
import * as React from "react"


export class FabricBase extends React.Component<
  IFabricProps,
  {
    isFocusVisible: boolean
  }
> {
  private _rootElement = React.createRef<HTMLDivElement>()
  private _disposables: (() => void)[] = []

  constructor(props: IFabricProps) {
    super(props)
    this.state = { isFocusVisible: false }
  }

  public render() {
    const classNames = classNamesFunction<IFabricStyleProps, IFabricStyles>()(getFabricStyles, {
      ...(this.props as IFabricStyleProps),
      ...this.state
    })
    const divProps = getNativeProps(this.props, divProperties)

    return <div {...divProps} className={classNames.root} ref={this._rootElement} />
  }

  public componentDidMount(): void {
    const win = getWindow(this._rootElement.current)

    if (win) {
      this._disposables.push(on(win, "mousedown", this._onMouseDown, true), on(win, "keydown", this._onKeyDown, true))
    }
  }

  public componentWillUnmount(): void {
    this._disposables.forEach((dispose: () => void) => dispose())
  }

  private _onMouseDown = (ev: MouseEvent): void => {
    this.setState({ isFocusVisible: false })
  }

  private _onKeyDown = (ev: KeyboardEvent): void => {
    if (isDirectionalKeyCode(ev.which)) {
      this.setState({ isFocusVisible: true })
    }
  }
}

const inheritFont = { fontFamily: "inherit" }

const GlobalClassNames = {
  root: "ms-Fabric"
}

export interface IFabricClassNames {
  root: string
}

export const getFabricStyles = (props: IFabricStyleProps): IFabricStyles => {
  const { theme, className, isFocusVisible } = props

  const classNames = getGlobalClassNames(GlobalClassNames, theme)

  return {
    root: [
      classNames.root,
      isFocusVisible && "is-focusVisible",
      theme.fonts.small,
      {
        color: theme.palette.neutralPrimary,
        selectors: {
          "& button": inheritFont,
          "& input": inheritFont,
          "& textarea": inheritFont,
          ":global(button)": {
            overflow: "visible",
            margin: 0
          }
        }
      },
      className
    ]
  }
}

export const Fabric: React.FunctionComponent<IFabricProps> = styled<IFabricProps, IFabricStyleProps, IFabricStyles>(
  FabricBase,
  getFabricStyles,
  undefined,
  {
    scope: "Fabric"
  }
)

export interface IFabricProps extends React.HTMLAttributes<HTMLDivElement> {
  componentRef?: IRefObject<{}>
  theme?: ITheme
  styles?: IStyleFunctionOrObject<IFabricStyleProps, IFabricStyles>
}

export interface IFabricStyleProps extends IFabricProps {
  theme: ITheme
  isFocusVisible: boolean
}

export interface IFabricStyles {
  root: IStyle
}

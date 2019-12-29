import { CommandBar, ICommandBar, ICommandBarProps } from "@uifabric/components"
import { mergeStyleSets } from "@uifabric/styleguide"
import { FontWeights } from "@uifabric/styleguide"
import { theme } from "coglite/shared/theme/defaultTheme"
import { observer } from "mobx-react"
import * as React from "react"

const styleConfig = {
  menuHeight: 28
}

const AppViewStylesheet = mergeStyleSets({
  root: [
    "app-view",
    {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      selectors: {
        ".ms-CommandBar": {
          height: styleConfig.menuHeight,
          paddingLeft: 0,
          paddingRight: 0,
          selectors: {
            ".ms-CommandBar-primaryCommands": {
              marginLeft: 0,
              lineHeight: styleConfig.menuHeight,
              height: styleConfig.menuHeight
            },
            ".ms-CommandBar-sideCommands": {
              paddingRight: 0,
              lineHeight: styleConfig.menuHeight,
              height: styleConfig.menuHeight
            },
            ".ms-CommandBarItem": {
              height: styleConfig.menuHeight,
              selectors: {
                ".ms-Icon, .ms-Button-icon": {
                  fontSize: "12px"
                },
                ".ms-Button": {
                  lineHeight: styleConfig.menuHeight,
                  height: styleConfig.menuHeight,
                  fontSize: "12px"
                },
                ".ms-CommandBarItem-link": {
                  lineHeight: styleConfig.menuHeight,
                  height: styleConfig.menuHeight,
                  fontSize: "12px"
                },
                ".ms-CommandBarItem-commandText": {
                  lineHeight: styleConfig.menuHeight,
                  height: styleConfig.menuHeight,
                  fontSize: "12px"
                },
                ".ms-CommandBarItem-text": {
                  lineHeight: styleConfig.menuHeight,
                  height: styleConfig.menuHeight,
                  fontSize: "12px"
                },
                ".ms-CommandBarItem-custom-button": {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: FontWeights.regular,
                  color: theme.palette.themeSecondary,
                  position: "relative",
                  background: "0 0",
                  border: "none",
                  lineHeight: styleConfig.menuHeight,
                  minWidth: 20,
                  textAlign: "center",
                  padding: "0 4px",
                  height: styleConfig.menuHeight,
                  cursor: "pointer",
                  outline: "transparent",
                  selectors: {
                    "&[disabled]": {
                      color: theme.palette.neutralTertiary
                    },
                    ".material-icons": {
                      padding: "0px 4px"
                    }
                  }
                },
                ".ms-CommandBarItem-icon": {
                  lineHeight: styleConfig.menuHeight,
                  height: styleConfig.menuHeight,
                  fontSize: "16px"
                }
              }
            }
          }
        }
      }
    }
  ],
  menuContainer: [
    "app-view-menu-container",
    {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      height: 28
    }
  ],
  rootMenuContainer: [
    "app-view-menu-container--root",
    {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      height: 28,
      selectors: {
        ".ms-CommandBar": {
          backgroundColor: theme.palette.neutralDark,
          selectors: {
            ".ms-Button--commandBar": {
              backgroundColor: theme.palette.neutralDark,
              color: theme.palette.neutralLighter,
              selectors: {
                ".ms-Button-icon": {
                  color: theme.palette.neutralLighter
                },
                ".ms-Button-menuIcon": {
                  color: theme.palette.neutralLighter
                },
                ".ms-CommandBarItem-icon": {
                  color: theme.palette.neutralLighter,
                  fontSize: "12px"
                },
                ".ms-CommandBarItem-chevronDown": {
                  color: theme.palette.neutralLighter
                },
                ":hover": {
                  backgroundColor: theme.palette.neutralPrimary
                }
              }
            },
            ".ms-Button--commandBar.is-disabled": {
              color: theme.palette.neutralTertiary,
              selectors: {
                ".ms-Button-icon": {
                  color: theme.palette.neutralTertiary
                },
                ".ms-Button-menuIcon": {
                  color: theme.palette.neutralTertiary
                },
                ".ms-CommandBarItem-icon": {
                  color: theme.palette.neutralTertiary,
                  fontSize: "12px"
                },
                ".ms-CommandBarItem-chevronDown": {
                  color: theme.palette.neutralTertiary
                },
                ":hover": {
                  backgroundColor: theme.palette.neutralDark
                }
              }
            },
            ".ms-CommandBarItem": {
              selectors: {
                ":hover": {
                  backgroundColor: theme.palette.neutralPrimary
                }
              }
            },
            ".ms-CommandBarItem-text": {
              backgroundColor: theme.palette.neutralDark,
              color: theme.palette.neutralLighter
            },
            ".ms-CommandBarItem-link": {
              backgroundColor: theme.palette.neutralDark,
              color: theme.palette.neutralLighter,
              selectors: {
                ".ms-Button-icon": {
                  color: theme.palette.neutralLighter
                },
                ".ms-Button-menuIcon": {
                  color: theme.palette.neutralLighter
                },
                ".ms-CommandBarItem-icon": {
                  color: theme.palette.neutralLighter,
                  fontSize: "12px"
                },
                ".ms-CommandBarItem-chevronDown": {
                  color: theme.palette.neutralLighter
                },
                ":hover": {
                  backgroundColor: theme.palette.neutralPrimary
                }
              }
            },
            ".ms-SearchBox": {
              backgroundColor: theme.palette.neutralSecondary,
              color: theme.palette.white,
              selectors: {
                ".ms-SearchBox-icon": {
                  color: theme.palette.neutralLight
                },
                ".ms-SearchBox-field": {
                  backgroundColor: theme.palette.neutralSecondary,
                  color: theme.palette.white
                },
                ".ms-SearchBox-clearButton": {
                  selectors: {
                    ".ms-Button-icon": {
                      color: theme.palette.neutralLight
                    }
                  }
                }
              }
            },
            ".ms-TextField": {
              selectors: {
                ".ms-TextField-fieldGroup": {
                  border: `1px solid ${theme.palette.neutralPrimary}`,
                  backgroundColor: theme.palette.neutralSecondary,
                  color: theme.palette.white,
                  selectors: {
                    ".ms-TextField-prefix": {
                      backgroundColor: theme.palette.neutralPrimaryAlt,
                      color: theme.palette.white,
                      selectors: {
                        ".ms-Button": {
                          backgroundColor: "transparent",
                          color: theme.palette.white,
                          selectors: {
                            ".ms-Button-icon": {
                              color: theme.palette.white
                            }
                          }
                        }
                      }
                    },
                    ".ms-TextField-field": {
                      color: theme.palette.white,
                      selectors: {
                        "::placeholder": {
                          color: theme.palette.neutralTertiary
                        }
                      }
                    },
                    ".ms-TextField-suffix": {
                      backgroundColor: theme.palette.neutralPrimaryAlt,
                      color: theme.palette.white,
                      selectors: {
                        ".ms-Button": {
                          backgroundColor: "transparent",
                          color: theme.palette.white,
                          selectors: {
                            ".ms-Button-icon": {
                              color: theme.palette.white
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  ],
  main: [
    "app-view-main",
    {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: "auto",
      zIndex: 1
    }
  ],
  mainWithMenu: [
    "app-view-main--with-menu",
    {
      position: "absolute",
      top: 28,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: "auto",
      zIndex: 1
    }
  ]
})

export interface IAppViewProps {
  commandBarProps?: ICommandBarProps
  onRenderMenu?: (props: IAppViewProps) => React.ReactNode
  onRenderMenuOther?: (props: IAppViewProps) => React.ReactNode
  root?: boolean
  //styles?: IAppViewStyles
  className?: string
  children?: any
}

export interface IAppView {
  commandBar: ICommandBar
  remeasure(): void
}

const _hasCommandBar = (p) => {
  const props: ICommandBarProps = p.commandBarProps
  return props && ((props.items && props.items.length > 0) || (props.farItems && props.farItems.length > 0)) ? true : false
}

const _hasMenu = (p) => {
  return _hasCommandBar(p) || (p.onRenderMenu || p.onRenderMenuOther) ? true : false
}

//return a menu or null
const AppViewMenu = observer((props: IAppViewProps) => {
  var _commandBar = React.useRef<ICommandBar>()

  const _onRenderMenu = (): React.ReactNode => {
    let menu
    let menuOther
    if (props.onRenderMenu) {
      menu = props.onRenderMenu(props)
    } else if (_hasCommandBar(props)) {
      menu = <CommandBar {...props.commandBarProps} componentRef={_commandBar} />
    }
    if (props.onRenderMenuOther) {
      menuOther = props.onRenderMenuOther(props)
    }

    if (menu || menuOther) {
      return (
        <div className={props.root ? AppViewStylesheet.rootMenuContainer : AppViewStylesheet.menuContainer}>
          {menu}
          {menuOther}
        </div>
      )
    }
    return null
  }

  return <React.Fragment>{_onRenderMenu()}</React.Fragment>
})

//returns an app view with styles for no menu
const AppViewWithoutMenu = observer((props: IAppViewProps) => {
  return (
    <div className={AppViewStylesheet.root}>
      <div className={AppViewStylesheet.main}>{props.children}</div>
    </div>
  )
})

//returns app view with styles for menu
const AppViewWithMenu = observer((props: IAppViewProps) => {
  return (
    <div className={AppViewStylesheet.root}>
      <AppViewMenu {...props} />
      <div className={AppViewStylesheet.mainWithMenu}>{props.children}</div>
    </div>
  )
})

export //returns app view with or without menu based on input props
const AppView = observer((props: IAppViewProps) => {
  const renderAppView = () => {
    return (_hasMenu(props) && <AppViewWithMenu {...props} />) || <AppViewWithoutMenu {...props} />
  }
  return renderAppView()
})

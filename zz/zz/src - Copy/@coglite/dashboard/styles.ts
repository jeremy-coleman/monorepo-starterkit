import { concatStyleSets, DefaultFontStyles, DefaultPalette, FontSizes, FontWeights, mergeStyleSets } from "@fluentui/react"


export const windowStyles = mergeStyleSets({
  root: {
    backgroundColor: DefaultPalette.white,
    borderColor: DefaultPalette.neutralSecondary,
    borderStyle: "solid",
    selectors: {
      "&.content-hidden": {
        height: 28
      },
      "&.animate-position": {
        transition:
          "top 0.2s ease, right 0.2s ease, bottom 0.2s ease, left 0.2s ease, width 0.2s ease, height 0.2s ease"
      },
      "&.manager-type-grid": {
        boxShadow: `0 0 5px 0 rgba(0, 0, 0, 0.4)`
      }
    }
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    cursor: "pointer",
    overflow: "hidden",
    backgroundColor: DefaultPalette.neutralSecondary,
    color: DefaultPalette.white
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    height: 20,
    maxHeight: 20,
    maxWidth: 20,
    overflow: "hidden",
    marginLeft: 4
  },
  titleContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    overflow: "hidden",
    paddingLeft: 8,
    paddingRight: 8
  },
  title: {
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    fontSize: FontSizes.small
  },
  action: {
    color: DefaultPalette.white,
    height: 28,
    width: 28,
    lineHeight: 28,
    cursor: "pointer",
    padding: "0px",
    outline: "none",
    border: "none",
    background: "transparent",
    selectors: {
      ":hover": {
        color: DefaultPalette.white,
        backgroundColor: DefaultPalette.neutralTertiary
      },
      "&.close-action": {
        selectors: {
          ":hover": {
            color: DefaultPalette.white,
            backgroundColor: DefaultPalette.redDark
          }
        }
      },
      "& .window-action-icon": {
        lineHeight: "16px",
        fontSize: FontSizes.mini,
        fontWeight: FontWeights.regular,
        margin: "0px",
        height: "16px",
        width: "16px"
      }
    }
  },
  actionBar: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  body: {
    position: "absolute",
    left: 0,
    bottom: 0,
    right: 0,
    overflow: "auto",
    backgroundColor: DefaultPalette.white,
    selectors: {
      "&.content-hidden": {
        height: 0,
        overflow: "hidden"
      }
    }
  },
  resize: {
    selectors: {
      "&.top": {
        position: "absolute",
        zIndex: 2,
        top: -2,
        height: 5,
        left: 0,
        right: 0,
        cursor: "n-resize"
      },
      "&.right": {
        position: "absolute",
        zIndex: 2,
        right: -2,
        width: 5,
        top: 0,
        bottom: 0,
        cursor: "e-resize"
      },
      "&.bottom": {
        position: "absolute",
        zIndex: 2,
        bottom: -2,
        height: 5,
        left: 0,
        right: 0,
        cursor: "s-resize"
      },
      "&.left": {
        position: "absolute",
        zIndex: 2,
        left: -2,
        width: 5,
        top: 0,
        bottom: 0,
        cursor: "w-resize"
      },
      "&.topLeft": {
        position: "absolute",
        zIndex: 3,
        left: -4,
        top: -4,
        width: 10,
        height: 10,
        cursor: "nw-resize"
      },
      "&.topRight": {
        position: "absolute",
        zIndex: 3,
        right: -4,
        top: -4,
        width: 10,
        height: 10,
        cursor: "ne-resize"
      },
      "&.bottomLeft": {
        position: "absolute",
        zIndex: 3,
        left: -4,
        bottom: -4,
        width: 10,
        height: 10,
        cursor: "sw-resize"
      },
      "&.bottomRight": {
        position: "absolute",
        zIndex: 3,
        right: -4,
        bottom: -4,
        width: 10,
        height: 10,
        cursor: "se-resize"
      }
    }
  }
})






export const VSplitStylesheet = mergeStyleSets({
  root: [
    "vsplit",
    {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  ],
  splitter: [
    "vsplit-splitter",
    {
      cursor: "ns-resize",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      backgroundColor: "gray", //DefaultPalette.themeDark,
      left: 0,
      right: 0
    }
  ],
  splitterHandle: [
    "vsplit-splitter-content",
    {
      position: "absolute",
      top: -2,
      right: 0,
      bottom: -2,
      left: 0,
      overflow: "hidden",
      backgroundColor: "transparent",
      color: "gray", //DefaultPalette.themeDark,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
      transition: "background-color 0.3s ease",
      selectors: {
        ":hover": {
          backgroundColor: "gray", //DefaultPalette.themeDark,
          opacity: 0.5
        },
        ".vsplit-icon": {
          fontSize: "10px",
          visibility: "hidden",
          color: "white" //DefaultPalette.white
        },
        "&.active": {
          backgroundColor: "gray", //DefaultPalette.themeDark,
          opacity: 1.0,
          selectors: {
            ".vsplit-icon": {
              visibility: "visible"
            }
          }
        }
      }
    }
  ],
  topPane: [
    "vsplit-top-pane",
    {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      overflow: "hidden"
    }
  ],
  topContent: [
    "vsplit-top-content",
    {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: "auto"
    }
  ],
  bottomPane: [
    "vsplit-bottom-pane",
    {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      overflow: "hidden"
    }
  ],
  bottomContent: [
    "vsplit-bottom-content",
    {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: "auto"
    }
  ]
})


export const stackStyles = mergeStyleSets({
  root: ["stack", {}],
  header: [
    "stack-header",
    {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      backgroundColor: DefaultPalette.neutralQuaternary,
      color: DefaultPalette.white,
      overflow: "hidden"
    }
  ],
  tabBar: [
    "stack-tab-bar",
    {
      background: "transparent",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "flex-end",
      height: "100%"
    }
  ],
  actionBar: [
    "stack-action-bar",
    {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      backgroundColor: DefaultPalette.neutralQuaternary
    }
  ],
  action: [
    "stack-action",
    {
      color: DefaultPalette.neutralPrimary,
      height: "100%",
      background: "transparent",
      border: "none",
      outline: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      selectors: {
        "&.close-action": {
          selectors: {
            ":hover": {
              color: DefaultPalette.white,
              backgroundColor: DefaultPalette.redDark
            }
          }
        }
      }
    }
  ],
  actionIcon: [
    "stack-action-icon",
    {
      fontSize: FontSizes.small,
      fontWeight: FontWeights.regular
    }
  ],
  addAction: [
    "stack-add-action",
    {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: DefaultPalette.neutralQuaternary,
      color: DefaultPalette.neutralPrimary,
      outline: "none",
      border: "none",
      height: "100%",
      width: 28,
      cursor: "pointer",
      transition: "background-color 0.3s ease",
      selectors: {
        ":hover": {
          backgroundColor: DefaultPalette.neutralQuaternaryAlt
        },
        "&.stack-add-action-icon": {
          color: DefaultPalette.neutralPrimary,
          fontSize: FontSizes.medium
        }
      }
    }
  ],
  addActionIcon: ["stack-add-action-icon", {}],
  tab: [
    "stack-tab",
    {
      position: "relative",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      overflow: "hidden",
      //color of the tab when its not active
      backgroundColor: DefaultPalette.neutralQuaternary,
      color: DefaultPalette.neutralSecondary,
      cursor: "pointer",
      height: "100%",
      transition: "background-color 0.3s ease",
      zIndex: 0,
      selectors: {
        ".close-action": {
          visibility: "hidden"
        },
        "&.active": {
          //color of the tab when it's active
          backgroundColor: "white", //DefaultPalette.neutralLighter,
          color: DefaultPalette.neutralPrimary,
          boxShadow: `3px 0px 3px -2px ${DefaultPalette.neutralTertiary}, -3px 0px 3px -2px ${DefaultPalette.neutralTertiary}`,
          zIndex: 1,
          selectors: {
            ".close-action": {
              visibility: "visible"
            },
            ":hover": {
              backgroundColor: "white" //DefaultPalette.neutralLighter
            }
          }
        },
        ":hover": {
          selectors: {
            ".close-action": {
              visibility: "visible"
            }
          },
          backgroundColor: DefaultPalette.neutralQuaternaryAlt
        }
      }
    }
  ],
  tabIconContainer: [
    "stack-tab-icon-container",
    {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: 20,
      height: 20,
      maxHeight: 20,
      maxWidth: 20,
      overflow: "hidden",
      marginLeft: 4
    }
  ],
  tabTitleContainer: [
    "stack-tab-title-container",
    {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      maxWidth: 130,
      overflow: "hidden",
      paddingLeft: 8,
      paddingRight: 8
    }
  ],
  tabTitle: [
    "stack-tab-title",
    {
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
      fontSize: FontSizes.small
    }
  ],

  tabActionBar: [
    "stack-tab-action-bar",
    {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center"
    }
  ],
  tabAction: [
    "stack-tab-action",
    {
      color: DefaultPalette.neutralPrimary,
      marginLeft: 4,
      marginRight: 4,
      height: 20,
      width: 20,
      lineHeight: 0, //16,
      padding: "0px",
      outline: "none",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      selectors: {
        "&.active": {
          color: DefaultPalette.neutralPrimary
        },
        "&.close-action": {
          selectors: {
            ":hover": {
              color: DefaultPalette.white,
              backgroundColor: DefaultPalette.redDark
            }
          }
        }
      }
    }
  ],
  tabActionIcon: [
    "stack-tab-action-icon",
    {
      lineHeight: FontSizes.mini,
      fontSize: FontSizes.mini,
      fontWeight: FontWeights.regular,
      margin: 0,
      height: FontSizes.mini,
      width: FontSizes.mini
    }
  ],
  tabPanel: ["stack-tab-panel", {}],
  body: [
    "stack-body",
    {
      position: "absolute",
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: DefaultPalette.white,
      boxShadow: `0px -3px 3px -2px ${DefaultPalette.neutralTertiary}`
    }
  ],
  dragOverlay: [
    "stack-drag-overlay",
    {
      position: "absolute",
      left: 0,
      bottom: 0,
      right: 0,
      background: DefaultPalette.white,
      opacity: 0.2,
      zIndex: 3
    }
  ],
  dragFeedbackContainer: [
    "stack-drag-feedback-container",
    {
      position: "absolute",
      left: 0,
      bottom: 0,
      right: 0,
      background: "transparent",
      zIndex: 2
    }
  ],
  dragFeedback: [
    "stack-drag-feedback",
    {
      position: "absolute",
      transition: "all 100ms ease",
      backgroundColor: DefaultPalette.neutralTertiary,
      opacity: 0.5
    }
  ]
})


export const HSplitStyles = mergeStyleSets({
  root: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  splitter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "gray" //DefaultPalette.themeDark
  },
  splitterHandle: {
    cursor: "ew-resize",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: -2,
    right: -2,
    overflow: "hidden",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    transition: "background-color 0.3s ease",
    selectors: {
      ":hover": {
        backgroundColor: "grey", //DefaultPalette.themeDark,
        opacity: 0.5
      },
      ".hsplit-icon": {
        fontSize: "10px",
        visibility: "hidden",
        color: "white" //DefaultPalette.white
      },
      "&.active": {
        backgroundColor: "gray", //DefaultPalette.themeDark,
        opacity: 1.0,
        selectors: {
          ".hsplit-icon": {
            visibility: "visible"
          }
        }
      }
    }
  },
  leftPane: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    overflow: "hidden"
  },
  leftContent: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "auto"
  },
  rightPane: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    overflow: "hidden"
  },
  rightContent: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "auto"
  }
})

export const GridStylesheet = mergeStyleSets({
  root: {},
  gridCells: {},
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "white",
    opacity: 0.1,
    zIndex: 2
  },
  row: {
    display: "flex"
  },
  cell: {
    backgroundColor: "gainsboro"
  }
})

export const dashboardListStyles = mergeStyleSets({
  root: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden"
  }
})


export const DashboardStylesheet = mergeStyleSets({
  root: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: "transparent",
    overflow: "hidden",
    selectors: {
      "&.hidden": {
        top: -1,
        left: -1,
        width: 0,
        height: 0,
        overflow: "hidden"
      }
    }
  },
  content: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
    background: "transparent",
    selectors: {
      "&.requires-overflow": {
        overflow: "auto"
      }
    }
  },
  overlay: {
    backgroundColor: DefaultPalette.white,
    opacity: 0.1,
    selectors: {
      "&.hsplit": {
        cursor: "ew-resize"
      },
      "&.vsplit": {
        cursor: "ns-resize"
      }
    }
  }
})


export const DashboardAddPanelStylesheet = mergeStyleSets({
  root: ["dashboard-add", {}],
  editor: [
    "dashboard-add-editor",
    {
      padding: 8
    }
  ],
  actions: ["dashboard-add-actions", {}],
  action: [
    "dasboard-add-action",
    {
      marginRight: 8
    }
  ]
})


export const createStackStyles = () => {
  const styles = concatStyleSets({
    root: {},
    rootFill: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      right: 0,
      overflow: "hidden"
    },
    materialIcons: {
      fontFamily: 'Material Icons',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fontSize: 24,
      display: 'inline-block',
      //lineHeight: 1,
      textTransform: 'none',
      letterSpacing: 'normal',
      wordWrap: 'normal',
      //whiteSpace: 'nowrap',
      direction: 'ltr',
      WebkitFontSmoothing: "antialiased",
      textRendering: 'optimizeLegibility',
      MozOsxFontSmoothing:"grayscale",
      fontVariantAlternates: 'liga'
    },
    header: {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      backgroundColor: DefaultPalette.neutralQuaternary,
      color: DefaultPalette.white,
      overflow: "hidden"
    },
    tabBar: {
      background: "transparent",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "flex-end",
      height: "100%"
    },
    tab: {
      position: "relative",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      overflow: "hidden",
      backgroundColor: DefaultPalette.neutralQuaternary,
      color: DefaultPalette.neutralSecondary,
      cursor: "pointer",
      height: "100%",
      transition: "background-color 0.3s ease",
      zIndex: 0,
      selectors: {
        ".close-action": {
          visibility: "hidden"
        },
        "&.active": {
          backgroundColor: DefaultPalette.neutralLighter,
          color: DefaultPalette.neutralPrimary,
          boxShadow: `3px 0px 3px -2px ${
            DefaultPalette.neutralTertiary
          }, -3px 0px 3px -2px ${DefaultPalette.neutralTertiary}`,
          zIndex: 1,
          selectors: {
            ".close-action": {
              visibility: "visible"
            },
            ":hover": {
              backgroundColor: DefaultPalette.neutralLighter
            }
          }
        },
        ":hover": {
          selectors: {
            ".close-action": {
              visibility: "visible"
            }
          },
          backgroundColor: DefaultPalette.neutralQuaternaryAlt
        }
      }
    },
    addAction: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: DefaultPalette.neutralQuaternary,
      color: DefaultPalette.neutralPrimary,
      outline: "none",
      border: "none",
      height: "100%",
      width: 28,
      cursor: "pointer",
      transition: "background-color 0.3s ease",
      selectors: {
        ":hover": {
          backgroundColor: DefaultPalette.neutralQuaternaryAlt
        },
        "&.stack-add-action-icon": {
          color: DefaultPalette.neutralPrimary,
          fontSize: DefaultFontStyles.medium.fontSize
        }
      }
    },
    addActionIcon: {},
    tabIconContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: 20,
      height: 20,
      maxHeight: 20,
      maxWidth: 20,
      overflow: "hidden",
      marginLeft: 4
    },
    tabTitleContainer: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      maxWidth: 130,
      overflow: "hidden",
      paddingLeft: 8,
      paddingRight: 8
    },
    tabTitle: {
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
      fontSize: DefaultFontStyles.small.fontSize
    },
    tabAction: {
      color: DefaultPalette.neutralPrimary,
      marginLeft: 8,
      marginRight: 8,
      height: 16,
      width: 16,
      lineHeight: 16,
      padding: "0px",
      outline: "none",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      selectors: {
        "&.active": {
          color: DefaultPalette.neutralPrimary
        },
        "&.close-action": {
          selectors: {
            ":hover": {
              color: DefaultPalette.white,
              backgroundColor: DefaultPalette.redDark
            }
          }
        }
      }
    },
    tabActionIcon: {
      lineHeight: DefaultFontStyles.tiny.fontSize,
      fontSize: DefaultFontStyles.tiny.fontSize,
      fontWeight: FontWeights.regular,
      margin: 0,
      height: DefaultFontStyles.tiny.fontSize,
      width: DefaultFontStyles.tiny.fontSize
    },
    tabActionBar: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center"
    },
    tabPanel: {},
    action: {
      color: DefaultPalette.neutralPrimary,
      height: "100%",
      background: "transparent",
      border: "none",
      outline: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      selectors: {
        "&.close-action": {
          selectors: {
            ":hover": {
              color: DefaultPalette.white,
              backgroundColor: DefaultPalette.redDark
            }
          }
        }
      }
    },
    actionIcon: {
      fontSize: DefaultFontStyles.small.fontSize,
      fontWeight: FontWeights.regular
    },
    actionBar: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      backgroundColor: DefaultPalette.neutralQuaternary
    },
    body: {
      position: "absolute",
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: DefaultPalette.white,
      boxShadow: `0px -3px 3px -2px ${DefaultPalette.neutralTertiary}`
    },
    dragOverlay: {
      position: "absolute",
      left: 0,
      bottom: 0,
      right: 0,
      background: DefaultPalette.white,
      opacity: 0.2,
      zIndex: 3
    },
    dragFeedbackContainer: {
      position: "absolute",
      left: 0,
      bottom: 0,
      right: 0,
      background: "transparent",
      zIndex: 2
    },
    dragFeedback: {
      position: "absolute",
      transition: "all 100ms ease",
      backgroundColor: DefaultPalette.neutralTertiary,
      opacity: 0.5
    }
  });

  return mergeStyleSets({
    root: ["stack", styles.root],
    header: ["stack-header", styles.header],
    tabBar: ["stack-tab-bar", styles.tabBar],
    actionBar: ["stack-action-bar", styles.actionBar],
    action: ["stack-action", styles.action],
    actionIcon: ["stack-action-icon", styles.actionIcon],
    addAction: ["stack-add-action", styles.addAction],
    addActionIcon: ["stack-add-action-icon", styles.addActionIcon],
    tab: ["stack-tab", styles.tab],
    tabIconContainer: ["stack-tab-icon-container", styles.tabIconContainer],
    tabTitleContainer: ["stack-tab-title-container", styles.tabTitleContainer],
    tabTitle: ["stack-tab-title", styles.tabTitle],
    tabActionBar: ["stack-tab-action-bar", styles.tabActionBar],
    tabAction: ["stack-tab-action", styles.tabAction],
    tabActionIcon: ["stack-tab-action-icon", styles.tabActionIcon],
    tabPanel: ["stack-tab-panel", styles.tabPanel],
    body: ["stack-body", styles.body],
    dragOverlay: ["stack-drag-overlay", styles.dragOverlay],
    dragFeedbackContainer: [
      "stack-drag-feedback-container",
      styles.dragFeedbackContainer
    ],
    dragFeedback: ["stack-drag-feedback", styles.dragFeedback]
})
}

export const stackStyles2 = createStackStyles()
import { mergeStyleSets } from "@uifabric/styleguide"

export const stackStyles = mergeStyleSets({
  root: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    overflow: "hidden"
  },
  header: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    backgroundColor: "var(--neutralTertiary)",
    color: "white",
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
    backgroundColor: "var(--neutralTertiary)",

    //this is the tab icon/text color
    color: "black",
    borderRight: "black solid 1px",
    cursor: "pointer",
    height: "100%",
    transition: "background-color 0.1s ease",
    //zIndex: 0,
    selectors: {
      ".close-action": {
        visibility: "hidden"
      },
      "&.active": {
        backgroundColor: "var(--white)",
        //borderBottom:"5px solid",
        color: "var(--neutralPrimary)",
        boxShadow: "3px 0px 3px -2px var(--neutralSecondary), -3px 0px 3px -2px var(--neutralSecondary)",
        zIndex: 1,
        selectors: {
          ".close-action": {
            visibility: "visible"
          },
          ":hover": {
            backgroundColor: "var(--white)"
            //cursor: 'grab'
          }
        }
      },
      ":hover": {
        selectors: {
          ".close-action": {
            visibility: "visible"
          }
        },
        backgroundColor: "var(--neutralQuaternaryAlt)",
        background: "var(--neutralQuaternaryAlt)"
      }
    }
  },
  addAction: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "var(--neutralTertiary)",
    color: "var(--neutralPrimary)",
    outline: "none",
    border: "none",
    height: "100%",
    width: 28,
    cursor: "pointer",
    transition: "background-color 0.1s ease",
    selectors: {
      "&:hover": {
        backgroundColor: "var(--neutralQuaternaryAlt)",
        background: "var(--neutralQuaternaryAlt)"
      },
      "&.stack-add-action-icon": {
        color: "var(--neutralPrimary)",
        fontSize: "12px"
      }
    }
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
    fontSize: "12px"
  },
  tabAction: {
    color: "var(--neutralPrimary)",
    marginLeft: 8,
    marginRight: 8,
    //height: 16,
    //width: 16,
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
        color: "var(--neutralPrimary)"
      },
      "&.close-action": {
        selectors: {
          ":hover": {
            color: "var(--white)",
            backgroundColor: "var(--redDark)"
          }
        }
      }
    }
  },

  tabActionBar: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  tabPanel: {},

  //this is the X icon wrapped on the inactive tabs
  //color is the inactive tab X on hovever
  action: {
    color: "var(--neutralPrimary)",
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
            color: "var(--white)",
            backgroundColor: "var(--redDark)"
          }
        }
      }
    }
  },
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

  actionIcon: {
    fontSize: "20px",
    fontWeight: 400
  },
  actionBar: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "var(--neutralTertiary)"
  },
  body: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "var(--white)",
    boxShadow: `0px -3px 3px -2px var(--neutralSecondary)`
  },
  dragOverlay: {
    position: "absolute",
    left: 0,
    bottom: 0,
    right: 0,
    //background: 'var(--white,
    //background: 'var(--white,
    background: "var(--white)",
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
    backgroundColor: "var(--neutralTertiary)",
    opacity: 0.5
  }
})

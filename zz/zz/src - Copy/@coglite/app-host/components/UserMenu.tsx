import {
  ContextualMenuItemType,
  DefaultPalette,
  FontWeights,
  IContextualMenuItem,
  mergeStyleSets
} from "@fluentui/react"
import * as React from "react"

export type IGroup = {
  name?: string
}

export type IUser = {
  username?: string
  email?: string
  groups?:
    | {
        name?: string
      }[]
    | IGroup[]
  profile?: {
    id?: number
    display_name?: string
    bio?: string
    user?: IUser
  }
}

const UserProfileStylesheet = mergeStyleSets({
  root: {
    minWidth: 300,
    alignSelf: "center"
  },
  userInfo: {
    display: "flex",
    flexDirection: "row",
    textAlign: "center",
    padding: 8
  },
  userInfoText: {
    marginLeft: 10,
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    padding: 1
  },
  body: {
    borderTop: `1px solid ${DefaultPalette.neutralLight}`
  },
  groups: {
    padding: 8,
    lineHeight: "14px"
  },
  groupsTitle: {
    fontSize: "14px",
    fontWeight: FontWeights.semibold,
    margin: 0,
    paddingTop: 4,
    paddingBottom: 8
  },
  groupList: {},
  group: {
    backgroundColor: DefaultPalette.neutralSecondary,
    color: DefaultPalette.white,
    fontSize: "14px",
    lineHeight: "14px",
    fontWeight: FontWeights.semilight,
    padding: 4,
    borderRadius: 4,
    margin: 4,
    textAlign: "center",
    verticalAlign: "middle"
  },
  avatar: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: 40,
    height: 40,
    fontFamily: "inherit",
    fontSize: "24",
    lineHeight: 1,
    borderRadius: "50%",
    overflow: "hidden",
    userSelect: "none",
    color: "white",
    backgroundColor: "grey"
  }
})

const getInitials = (userProfile: IUser["profile"]) => {
  if (!userProfile || !userProfile.display_name) return "G"
  let allnames = userProfile && userProfile.display_name.split(" ")
  let firstInitial = userProfile.display_name[0]

  if (allnames.length > 0) {
    let lastInitial = allnames[allnames.length - 1][0]
    firstInitial += lastInitial
  }
  return firstInitial
}

type IUserProfileProps = {
  userProfile: IUser["profile"]
  className?: string
}

export const UserInfo = React.memo((props: IUserProfileProps) => {
  const { userProfile } = props
  if (userProfile) {
    const displayName = userProfile.display_name || "Unknown"
    const initials = getInitials(userProfile)
    return (
      <div className={UserProfileStylesheet.userInfo}>
        <div className={UserProfileStylesheet.avatar}>{String(initials)}</div>
        <span className={UserProfileStylesheet.userInfoText}>
          <div>{displayName}</div>
          <div>{userProfile.user ? userProfile.user.email : undefined}</div>
        </span>
      </div>
    )
  }
  return null
})

interface IUserGroupProps {
  group: IGroup
  className?: string
}

const UserGroup = (props: IUserGroupProps) => {
  return (
    <div className={props.className} role="listitem">
      {props.group.name}
    </div>
  )
}

const UserGroups = (props: IUserProfileProps) => {
  const groups = props.userProfile!.user!.groups
  if (groups && groups.length > 0) {
    return (
      <div className={UserProfileStylesheet.groupList} role="list">
        {groups.map((g) => (
          <UserGroup key={g.name} group={g} className={UserProfileStylesheet.group} />
        ))}
      </div>
    )
  }
  return null
}

export const createUserProfileMenu = (userProfile: IUser["profile"]): IContextualMenuItem => {
  return {
    key: "userProfileMenu",
    ariaLabel: "User Profile for " + userProfile!.display_name,
    iconProps: {
      iconName: "Contact"
    },
    subMenuProps: {
      items: [
        {
          key: "userInfo",
          userProfile: userProfile,
          onRender(item) {
            return <UserInfo key={item.key} userProfile={userProfile} />
          }
        },
        {
          key: "userGroupsHeader",
          itemType: ContextualMenuItemType.Header,
          name: "Groups"
        },
        {
          key: "userGroups",
          onRender(item) {
            return <UserGroups key={item.key} userProfile={userProfile} />
          }
        }
      ]
    }
  }
}

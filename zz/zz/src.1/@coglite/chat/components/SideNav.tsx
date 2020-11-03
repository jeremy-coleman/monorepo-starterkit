import { ITheme } from "office-ui-fabric-react"
import * as React from "react"
import { createComponent } from "../utilities"

type SideNavProps = {
  styles: { [key in keyof ReturnType<typeof getStyles>]: string }
  theme: ITheme
}

const getStyles = (props: SideNavProps) => ({
  root: []
})

const view = (props: SideNavProps) => {
  return <div className={props.styles.root} />
}

export const SideNav = createComponent<SideNavProps>({
  scope: "SideNav",
  styles: getStyles,
  view: view
})

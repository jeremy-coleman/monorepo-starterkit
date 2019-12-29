import { CommandBarButton, Image } from "@uifabric/components"
import { mergeStyleSets } from "@uifabric/styleguide"
import * as React from "react"

//import * as logoUrl from "../assets/Logo.png";

let BrandCSS = mergeStyleSets({
  root: {},
  logo: {
    zIndex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  title: {
    color: "orange",
    zIndex: 2,
    fontSize: "14px"
  }
})

interface IBrandButtonProps {
  onClick?: () => void
  className?: string
  logoUrl?: any
  alt?: any
}

export const BrandButton = (props: IBrandButtonProps) => {
  const _renderLogo = (): React.ReactNode => {
    return (
      <div className={BrandCSS.root} aria-hidden={false}>
        {props.logoUrl ? <Image className={BrandCSS.logo} src={props.logoUrl} alt="X" /> : <span className={BrandCSS.title}>C</span>}
      </div>
    )
  }
  const _renderTitle = (): React.ReactNode => {
    return <div className={BrandCSS.title} />
  }

  return (
    <CommandBarButton onClick={props.onClick}>
      {_renderLogo()}
      {_renderTitle()}
    </CommandBarButton>
  )
}

import { Icon } from "@uifabric/components"
import { theme } from "coglite/shared/theme"
import { IRequest } from "coglite/types"
import * as React from "react"
import { AppLink, IAppHostProps } from "../host/views"
import { sampleGroups } from "./sampleGroups"
import { SampleHostAppView } from "./SampleHostAppView"

interface ISampleAppTileProps extends IAppHostProps {
  request: IRequest
}

const SampleAppTile = (props: ISampleAppTileProps) => {
  return (
    <AppLink host={props.host} request={props.request} style={{ textDecoration: "none" }} title={props.request.title}>
      <div
        style={{
          position: "relative",
          width: 100,
          height: 100,
          margin: 10,
          boxShadow: "0 0 5px 0px rgba(0,0,0,0.4)"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            top: 0,
            right: 0,
            left: 0,
            height: 60,
            backgroundColor: theme.palette.neutralLight
          }}
        >
          <Icon iconName="Puzzle" />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            fontSize: 10,
            top: 60,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: theme.palette.themeDark,
            color: theme.palette.white
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 8
            }}
          >
            {props.request.title}
          </div>
        </div>
      </div>
    </AppLink>
  )
}

const Home = (props: IAppHostProps) => {
  props.host.setTitle("Samples Home")

  return (
    <SampleHostAppView host={props.host}>
      <div>
        <div style={{ padding: 8 }}>
          <h2>Samples Home</h2>
          <div>
            {sampleGroups.map((group) => {
              return (
                <div key={group.key}>
                  <h3>{group.title}</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", padding: 8 }}>
                    {group.items.map((item) => {
                      return <SampleAppTile key={item.path} host={props.host} request={Object.assign({}, item, { replace: false })} />
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </SampleHostAppView>
  )
}

export { Home }

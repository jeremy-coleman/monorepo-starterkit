import { Link } from "@uifabric/components"
import { mergeStyleSets } from "@uifabric/styleguide"
import { FontWeights } from "@uifabric/styleguide"
import { IAppProps } from "coglite/types"
import * as React from "react"

const REPO_URL = "github.com"

const aboutStyles = mergeStyleSets({
  root: ["about", {}],
  section: ["about-section", {}],
  sectionTitle: [
    "about-section-title",
    {
      margin: 0,
      paddingTop: 16,
      paddingBottom: 8,
      fontSize: "14px"
    }
  ],
  sectionBody: ["about-section-body", {}],
  config: [
    "about-config",
    {
      fontSize: "12px",
      fontWeight: FontWeights.semilight
    }
  ]
})

//import packageInfo from 'package.json';

var packageInfo = {
  dependencies: {
    react: "1.0.0"
  }
}

var AppConfig = {
  buildVersion: "dev",
  buildDate: new Date().toLocaleDateString()
}

const dependencies = Object.keys(packageInfo.dependencies || {})
  .map((key) => {
    return {
      name: key,
      version: packageInfo.dependencies[key]
    }
  })
  .sort((l, r) => {
    return String(l.name).localeCompare(String(r.name))
  })

const dependencyColumns = [
  {
    key: "name",
    name: "Name",
    fieldName: "name",
    minWidth: 40,
    maxWidth: 200,
    isResizable: true
  },
  {
    key: "version",
    name: "Version",
    fieldName: "version",
    minWidth: 40,
    isResizable: true
  }
]

// class DependenciesDetailsList extends React.Component<any, any> {
//   private _onShouldVirtualize = () => {
//     return false
//   }
//   render() {
//     return (
//       <DetailsList
//         items={dependencies}
//         columns={dependencyColumns}
//         selectionMode={SelectionMode.none}
//         onShouldVirtualize={this._onShouldVirtualize}
//       />
//     )
//   }
// }

interface IAboutProps {
  //styles?: IAboutStyles;
  className?: string
}

class AboutView extends React.Component<IAboutProps, any> {
  render() {
    return (
      <div className={aboutStyles.root}>
        <section className={aboutStyles.section}>
          <h5 className={aboutStyles.sectionTitle}>Build Version</h5>
          <div className={aboutStyles.sectionBody}>{AppConfig.buildVersion}</div>
        </section>
        <section className={aboutStyles.section}>
          <h5 className={aboutStyles.sectionTitle}>Build Date</h5>
          <div className={aboutStyles.sectionBody}>{AppConfig.buildDate}</div>
        </section>
        <section className={aboutStyles.section}>
          <h5 className={aboutStyles.sectionTitle}>Repository</h5>
          <div className={aboutStyles.sectionBody}>
            <Link target="_blank" href={REPO_URL}>
              {REPO_URL}
            </Link>
          </div>
        </section>
        <section className={aboutStyles.section}>
          <h5 className={aboutStyles.sectionTitle}>Configuration</h5>
          <div className={aboutStyles.sectionBody}>
            <pre className={aboutStyles.config}>{JSON.stringify(AppConfig, null, "\t")}</pre>
          </div>
        </section>
        <section className={aboutStyles.section}>
          <h5 className={aboutStyles.sectionTitle}>Dependencies</h5>
          <div className={aboutStyles.sectionBody}></div>
        </section>
      </div>
    )
  }
}

//<DependenciesDetailsList />

export class About extends React.Component<IAppProps, any> {
  UNSAFE_componentWillMount() {
    this.props.match.host.setTitle("About Coglite")
  }
  render() {
    return <AboutView />
  }
}

export default About

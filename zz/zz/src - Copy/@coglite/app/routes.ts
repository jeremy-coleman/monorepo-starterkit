export type ISampleRoute = {
  key: string
  title: string
  moduleLoader?: () => Promise<any>
  moduleComponent?: string
  path?: string
  items?: ISampleRoute[]
  page?: any
}

export const sampleRoutes = [
  {
    key: "common",
    title: "Common Samples",
    items: [
      {
        path: "/samples/opener",
        title: "Opener"
      },
      {
        path: "/samples/tester",
        title: "Client Tester",
        page: "tester"
      }
    ]
  },
  {
    key: "dashboard",
    title: "Dashboard Samples",
    items: [
      {
        path: "/samples/dashboard/stack",
        title: "Stack Sample"
      },
      {
        path: "/samples/dashboard/hsplit",
        title: "HSplit Sample"
      },
      {
        path: "/samples/dashboard/vsplit",
        title: "VSplit Sample"
      },
      {
        path: "/samples/dashboard/grid",
        title: "Grid Sample"
      },
      {
        path: "/samples/dashboard/flow",
        title: "Flow Sample"
      }
    ]
  },
  {
    key: "hpjs.distributions",
    title: "Distributions",
    items: [
      {
        path: "/samples/hpjs/choice",
        title: "Choice(pick any categories)"
      },
      {
        path: "/samples/fabric/personform",
        title: "Randint(Upper)"
      },
      {
        path: "/samples/hpjs/uniform",
        title: "Uniform(low, high)"
      },
      {
        path: "/samples/hpjs/quniform",
        title: "QUniform(low, high, q)"
      },
      {
        path: "/samples/hpjs/loguniform",
        title: "LogUniform(low, high)"
      },
      {
        path: "/samples/hpjs/qloguniform",
        title: "QLogUniform(low, high, q)"
      },
      {
        path: "/samples/hpjs/normal",
        title: "Normal(mu, sigma)"
      },
      {
        path: "/samples/hpjs/qnormal",
        title: "QNormal(mu, signa, q)"
      },
      {
        path: "/samples/hpjs/lognormal",
        title: "LogNormal(mu, sigma)"
      },
      {
        path: "/samples/hpjs/qlognormal",
        title: "QLogNormal(mu, signa, q)"
      }
    ]
  },
  {
    key: "hpjs.fmin",
    title: "FMin",
    items: [
      {
        path: "/samples/hpjs/equation",
        title: "Equation"
      },
      {
        path: "/samples/hpjs/tiny",
        title: "Tiny"
      },
      {
        path: "/samples/hpjs/iris",
        title: "Iris"
      },
      {
        path: "/samples/hpjs/mnist",
        title: "Mnist"
      }
    ]
  },
  {
    key: "rmwc-samples",
    title: "RMWC Samples",
    items: [
      {
        path: "/samples/rmwc/card",
        title: "Card Sample"
      },
      {
        path: "/samples/rmwc/gridlist",
        title: "Grid List Sample"
      },
      {
        path: "/samples/rmwc/form",
        title: "Form/Input Sample"
      },
      {
        path: "/samples/rmwc/tabs",
        title: "Tabs Sample"
      },
      {
        path: "/samples/rmwc/toolbar",
        title: "Toolbar Sample"
      }
    ]
  },
  {
    key: "blueprint-samples",
    title: "Blueprint Samples",
    items: [
      {
        path: "/samples/blueprint/alert",
        title: "Alert Sample"
      },
      {
        path: "/samples/blueprint/dialog",
        title: "Dialog Sample"
      },
      {
        path: "/samples/blueprint/contextmenu",
        title: "Context Menu Sample"
      },
      {
        path: "/samples/blueprint/collapse",
        title: "Collapse Sample"
      },
      {
        path: "/samples/blueprint/navbar",
        title: "Navbar Sample"
      },
      {
        path: "/samples/blueprint/tabs",
        title: "Tabs Sample"
      },
      {
        path: "/samples/blueprint/callout",
        title: "Callout Sample"
      },
      {
        path: "/samples/blueprint/collapsibleList",
        title: "Collapsible List Sample"
      },
      {
        path: "/samples/blueprint/slider",
        title: "Slider Sample"
      },
      {
        path: "/samples/blueprint/tagInput",
        title: "Tag Input Sample"
      },
      {
        path: "/samples/blueprint/popover",
        title: "Popover Sample"
      },
      {
        path: "/samples/blueprint/dateInput",
        title: "Date Input Sample"
      },
      {
        path: "/samples/blueprint/table",
        title: "Table Sample"
      }
    ]
  },
  {
    key: "antd-samples",
    title: "Ant Design of React Samples",
    items: [
      {
        path: "/samples/antd/layout",
        title: "Layout Sample"
      },
      {
        path: "/samples/antd/button",
        title: "Button Sample"
      }
    ]
  }
]

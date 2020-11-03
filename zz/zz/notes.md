
```ts

//loading the host anywhere except in render method in a class component would cause app to crash during hmr
//or, if used as a hook componnet, it causes re-render flashes when closing app tabs..idk
@observer
export class AppHostContainer extends React.Component<any, any> {
  render() {
        if (!this.props.noLoadOnMount) {
      this.props.host.load()
    }
    return <AppHostContainerView key="view" {...this.props} />
  }
}

```
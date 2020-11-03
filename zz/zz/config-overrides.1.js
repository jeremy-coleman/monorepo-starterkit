const {
  override,
  //addBundleVisualizer,
  useBabelRc,
  addDecoratorsLegacy,
  disableEsLint,
  addWebpackAlias,
} = require('customize-cra')
const { addReactRefresh } = require('customize-cra-react-refresh')

const PrefreshPlugin = require("@prefresh/webpack")

const addWebpackPlugins = () => config => {
  config.plugins.push(new PrefreshPlugin())
  return config
}


module.exports = override(
  useBabelRc(),
  addDecoratorsLegacy(),
  disableEsLint(),
  addWebpackAlias({
    "react": 'preact/compat',
    'react-dom': 'preact/compat'
  }),
  addWebpackPlugins()
  //addReactRefresh(),
  //process.env.BUNDLE_VISUALIZE && addBundleVisualizer(),
)

const {
  override,
  //addBundleVisualizer,
  useBabelRc,
  addDecoratorsLegacy,
  disableEsLint,
  addWebpackAlias,
} = require('customize-cra')
const { addReactRefresh } = require('customize-cra-react-refresh')



module.exports = override(
  useBabelRc(),
  addDecoratorsLegacy(),
  disableEsLint(),
  addReactRefresh(),
)

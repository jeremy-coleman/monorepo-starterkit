import { Context } from "coglite/shared/services"

import { IShopettePaths, ShopettePaths } from "./Paths"

const ShopettePathsContext = new Context<IShopettePaths>({
  factory() {
    return new ShopettePaths()
  }
})

export { ShopettePathsContext }

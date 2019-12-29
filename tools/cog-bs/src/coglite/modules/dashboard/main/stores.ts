
import { ComponentRemove } from "./models/ComponentRemove"
import { DashboardAdd } from "./models/DashboardAdd"
import { IDashboard, IDashboardList } from "./types"
import { Supplier } from "coglite/shared/models/Supplier"

const DashboardAddStore = new DashboardAdd()
const ComponentRemoveStore = new ComponentRemove()
const DashboardRemoveStore = new Supplier<IDashboard>()
const DashboardListClearStore = new Supplier<IDashboardList>()

export { DashboardListClearStore }
export { DashboardRemoveStore }
export { ComponentRemoveStore }
export { DashboardAddStore }

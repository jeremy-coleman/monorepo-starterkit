import { ContextualMenuItemType, IContextualMenuItem, IIconProps } from "@fluentui/react"
import { ListModel } from "@coglite/app-host";
import { ComponentTypes } from './constants';
import { onRenderGridCellMargin, onRenderGridCellSize } from './Menus';
import { Grid, HSplit, IDashboard, IGrid, IHSplit, IStack, IVSplit, IWindow, Stack } from './models';


export type IDashboardLayout = {
    doLayout?: (dashboard : IDashboard) => Promise<any>;
    key: string;
    name: string;
    title?: string;
    iconProps?: IIconProps;
    applyLayout: (dashboard : IDashboard) => Promise<any> | any;
    isLayoutApplied: (dashboard : IDashboard) => boolean;
    createActions?: (dashboard : IDashboard) => IContextualMenuItem[];
}

const getColumnCount = (dashboard : IDashboard) : number => {
    return dashboard && dashboard.component && dashboard.component.type === ComponentTypes.hsplit ?
            (dashboard.component as IHSplit).columnCount : 0;
}

const getRowCount = (dashboard : IDashboard) : number => {
    return dashboard && dashboard.component && dashboard.component.type === ComponentTypes.vsplit ?
            (dashboard.component as IVSplit).rowCount : 0;
};

const assignWindows = (windows : IWindow[], stacks : IStack[]) => {
    if(windows && windows.length > 0) {
        const stackQuota = Math.ceil(windows.length / stacks.length);
        let stackIdx = 0;
        let c: IStack;
        windows.forEach(w => {
            c = stacks[stackIdx];
            if(c.windowCount === stackQuota) {
                stackIdx ++;
                c = stacks[stackIdx];
            }
            c.add(w, false);
        });
        stacks.forEach(c => {
            if(c.windowCount > 0) {
                c.setActiveIndex(0);
            } else {
                c.addNew();
            }
        });
    }
};


const GridDashboardLayout : IDashboardLayout = {
    key: "grid",
    name: "Grid",
    title: "Grid",
    iconProps: { iconName: "GridViewMedium"},
    applyLayout: (dashboard : IDashboard) => {
        const windows = dashboard.windows;
        const grid = new Grid();
        dashboard.setComponent(grid);
        windows.forEach(w => grid.add(w));
    },
    
    isLayoutApplied: (dashboard : IDashboard) => {
        return dashboard.component && dashboard.component.type === ComponentTypes.grid;
    },
    createActions(dashboard : IDashboard) {
        const items : IContextualMenuItem[] = [];
        const grid = dashboard.component as IGrid;
        // this is the grid settings icon
        items.push(
            {
                key: "settings",
                iconProps: {
                    iconName: "Equalizer"
                },
                subMenuProps: {
                    shouldFocusOnContainer: true,
                    items: [
                        {
                            key: "gridCellSizeHeader",
                            itemType: ContextualMenuItemType.Header,
                            name: "Cell Size"
                        },
                        {
                            key: "gridCellSize",
                            name: "Cell Size",
                            grid: grid,
                            onRender: onRenderGridCellSize
                        },
                        {
                            key: "gridCellMarginHeader",
                            itemType: ContextualMenuItemType.Header,
                            name: "Cell Margin"
                        },
                        {
                            key: "gridCellMargin",
                            name: "Cell Margin",
                            grid: grid,
                            onRender: onRenderGridCellMargin
                        }
                    ]
                }
            }
        );
        if(grid.addApp) {
            items.push(
                {
                    key: "add",
                    name: "Add",
                    iconProps: {
                        iconName: "Add"
                    },
                    onClick() {
                        grid.addNew();
                    }
                }
            );
        }
        return items;
    }
};



const TabDashboardLayout : IDashboardLayout = {
    key: "tabs",
    name: "Tabs",
    iconProps: { iconName: "BrowserTab" },
    applyLayout:(dashboard : IDashboard) => {
        // grab windows
        const windows = dashboard.windows;
        // grab active window
        const active = windows.find(w => w.active);
        const stack = new Stack();
        dashboard.setComponent(stack);
        windows.forEach(w => {
            stack.add(w);
        });
        if(active) {
            stack.setActive(active);
        } else {
            stack.setActiveIndex(0);
        }
    },

    isLayoutApplied:(dashboard : IDashboard) => {
        return dashboard.component && dashboard.component.type === ComponentTypes.stack;
    },

    createActions(dashboard : IDashboard) {
     const items : IContextualMenuItem[] = [];
     const tabStack = dashboard.component as IStack;
     // this is the grid settings icon
     items.push(
         {
             key: "settings",
             iconProps: {
                 iconName: "ArrangeSendToBack"
             },
             subMenuProps: {
                 shouldFocusOnContainer: true,
                 items: [
                     {
                         key: "gridCellSizeHeader",
                         itemType: ContextualMenuItemType.Header,
                         name: "Cell Size"
                     },
                     {
                         key: "gridCellSize",
                         name: "Cell Size",
                         grid: tabStack,
                        // onRender: onRenderGridCellSize
                     },
                     {
                         key: "gridCellMarginHeader",
                         itemType: ContextualMenuItemType.Header,
                         name: "Cell Margin"
                     },
                     {
                         key: "gridCellMargin",
                         name: "Cell Margin",
                         grid: tabStack,
                         //onRender: onRenderGridCellMargin
                     }
                 ]
             }
         }
     );
     if(tabStack.addApp) {
         items.push(
             {
                 key: "add",
                 name: "Add",
                 iconProps: {
                     iconName: "Add"
                 },
                 onClick() {
                     tabStack.addNew();
                 }
             }
         );
     }
     return items;
 }
};


const ThreeColumnSplitDashboardLayout : IDashboardLayout = {
    key: "threeColumnSplit",
    name: "Three Columns",
    iconProps: { iconName: "TripleColumn" },
    applyLayout: (dashboard : IDashboard) => {
        const windows = dashboard.windows;
        const stacks = [
            new Stack(),
            new Stack(),
            new Stack()
        ];
        const outerSplit = new HSplit();
        outerSplit.setOffset(0.33);
        const innerSplit = new HSplit();
        outerSplit.setLeft(stacks[0]);
        outerSplit.setRight(innerSplit);
        innerSplit.setLeft(stacks[1]);
        innerSplit.setRight(stacks[2]);
        dashboard.setComponent(outerSplit);
        assignWindows(windows, stacks);
    },
    
    isLayoutApplied: (dashboard : IDashboard) => {
        return getColumnCount(dashboard) === 3;
    }
};


const TwoColumnSplitDashboardLayout : IDashboardLayout = {
    key: "twoColumnSplit",
    name: "Two Columns",
    iconProps: { iconName: "DoubleColumn" },
    applyLayout:(dashboard : IDashboard) => {
        const windows = dashboard.windows;
        // create the new containers
        const stacks = [
            new Stack(),
            new Stack()
        ];
        const split = new HSplit();
        split.setLeft(stacks[0]);
        split.setRight(stacks[1]);
        dashboard.setComponent(split);
        assignWindows(windows, stacks);
    },
    isLayoutApplied: (dashboard : IDashboard) => {
        return getColumnCount(dashboard) === 2;
    }
};


// the dashboard layout register - initialized with defaults
const DashboardLayoutRegistry = new ListModel<IDashboardLayout>([
    TabDashboardLayout,
    TwoColumnSplitDashboardLayout,
    ThreeColumnSplitDashboardLayout,
    GridDashboardLayout
  ]);

export { GridDashboardLayout };
export { getColumnCount, getRowCount, assignWindows };
//export { IDashboardLayout };
export { DashboardLayoutRegistry };
export { TabDashboardLayout };
export { ThreeColumnSplitDashboardLayout };
export { TwoColumnSplitDashboardLayout };


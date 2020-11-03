import { observer } from 'mobx-react';
import * as React from 'react';
import { when } from 'when-switch';
import { ComponentTypes } from './constants';
import { GridView } from './GridView';
import { Grid, HSplit, IComponent, Stack, VSplit } from './models';
import { HSplitView, StackView, VSplitView } from './Stack';

const renderView = (comp: IComponent) => {
       return when(comp && comp.type)
        .is(ComponentTypes["stack"], <StackView stack={comp as Stack} />)
        .is(ComponentTypes["hsplit"], <HSplitView hsplit={comp as HSplit}/>)
        .is(ComponentTypes["vsplit"], <VSplitView vsplit={comp as VSplit}/>)
        .is(ComponentTypes["grid"], <GridView grid={comp as Grid}/>)
        .else(() => <StackView stack={comp as Stack} />)
}

type Props = {
    component: IComponent;
}

export const ComponentView = observer(({component}: Props) => renderView(component))

import { ComponentGlobals } from './ComponentGlobals';

const dispatchWindowResize = () => {
    ComponentGlobals.ignoreResize = true;
    window && window.dispatchEvent(new CustomEvent("resize", {bubbles: true, cancelable: true}));
    ComponentGlobals.ignoreResize = false;
};

export { dispatchWindowResize };

import { Component, options } from 'preact';

export const VNODE_COMPONENT = '__c';
export const DIFF_OPTION = '__b';
export const NAMESPACE = '__PREFRESH__';
export const COMPONENT_HOOKS = '__H';
export const HOOKS_LIST = '__';
export const EFFECTS_LIST = '__h';

// Options for Preact.

const signaturesForType = new WeakMap();

// all vnodes referencing a given constructor
export const vnodesForComponent = new WeakMap();

/**
 *
 * This part has been vendored from "react-refresh"
 * https://github.com/facebook/react/blob/master/packages/react-refresh/src/ReactFreshRuntime.js#L83
 */
const computeKey = signature => {
	let fullKey = signature.key;
	let hooks;

	try {
		hooks = signature.getCustomHooks();
	} catch (err) {
		signature.forceReset = true;
		return fullKey;
	}

	for (let i = 0; i < hooks.length; i++) {
		const hook = hooks[i];
		if (typeof hook !== 'function') {
			signature.forceReset = true;
			return fullKey;
		}

		const nestedHookSignature = signaturesForType.get(hook);
		if (nestedHookSignature === undefined) continue;

		const nestedHookKey = computeKey(nestedHookSignature);
		if (nestedHookSignature.forceReset) signature.forceReset = true;

		fullKey += '\n---\n' + nestedHookKey;
	}

	return fullKey;
};

function sign(type, key, forceReset, getCustomHooks, status) {
	if (type) {
		let signature = signaturesForType.get(type);
		if (status === 'begin') {
			signaturesForType.set(type, {
				type,
				key,
				forceReset,
				getCustomHooks: getCustomHooks || (() => [])
			});

			return 'needsHooks';
		} else if (status === 'needsHooks') {
			signature.fullKey = computeKey(signature);
		}
	}
}

function replaceComponent(OldType, NewType, resetHookState) {
	const vnodes = vnodesForComponent.get(OldType);
	if (!vnodes) return;

	// migrate the list to our new constructor reference
	vnodesForComponent.delete(OldType);
	vnodesForComponent.set(NewType, vnodes);

	vnodes.forEach(vnode => {
		// update the type in-place to reference the new component
		vnode.type = NewType;

		if (vnode[VNODE_COMPONENT]) {
			vnode[VNODE_COMPONENT].constructor = vnode.type;

			try {
				if (vnode[VNODE_COMPONENT] instanceof OldType) {
					const oldInst = vnode[VNODE_COMPONENT];

					const newInst = new NewType(
						vnode[VNODE_COMPONENT].props,
						vnode[VNODE_COMPONENT].context
					);

					vnode[VNODE_COMPONENT] = newInst;
					// copy old properties onto the new instance.
					//   - Objects (including refs) in the new instance are updated with their old values
					//   - Missing or null properties are restored to their old values
					//   - Updated Functions are not reverted
					//   - Scalars are copied
					for (let i in oldInst) {
						const type = typeof oldInst[i];
						if (!(i in newInst)) {
							newInst[i] = oldInst[i];
						} else if (type !== 'function' && typeof newInst[i] === type) {
							if (
								type === 'object' &&
								newInst[i] != null &&
								newInst[i].constructor === oldInst[i].constructor
							) {
								Object.assign(newInst[i], oldInst[i]);
							} else {
								newInst[i] = oldInst[i];
							}
						}
					}
				}
			} catch (e) {
				/* Functional component */
			}

			if (resetHookState) {
				vnode[VNODE_COMPONENT][COMPONENT_HOOKS] = {
					[HOOKS_LIST]: [],
					[EFFECTS_LIST]: []
				};
			}

			Component.prototype.forceUpdate.call(vnode[VNODE_COMPONENT]);
		}
	});
}

function register(type, id) {
	// Unused atm
}

self[NAMESPACE] = {
	getSignature: type => signaturesForType.get(type),
	register,
	replaceComponent,
	sign,
	computeKey
};


const oldDiff = options[DIFF_OPTION];
options[DIFF_OPTION] = newVNode => {
	if (newVNode[VNODE_COMPONENT]) {
		newVNode[VNODE_COMPONENT].constructor = newVNode.type;
	}

	if (oldDiff) oldDiff(newVNode);
};


const oldUnmount = options.unmount;
options.unmount = vnode => {
	const type = (vnode || {}).type;
	if (typeof type === 'function' && vnodesForComponent.has(type)) {
		const vnodes = vnodesForComponent.get(type);
		const index = vnodes.indexOf(vnode);
		if (index !== -1) {
			vnodes.splice(index, 1);
		}
	}
	if (oldUnmount) oldUnmount(vnode);
};


const oldVnode = options.vnode;
options.vnode = vnode => {
	if (vnode && typeof vnode.type === 'function') {
		const vnodes = vnodesForComponent.get(vnode.type);
		if (!vnodes) {
			vnodesForComponent.set(vnode.type, [vnode]);
		} else {
			vnodes.push(vnode);
		}
	}

	if (oldVnode) oldVnode(vnode);
};



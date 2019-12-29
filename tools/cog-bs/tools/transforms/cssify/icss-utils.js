import postcss from './postcss';

const matchValueName = /[$]?[\w-]+/g;
const replaceValueSymbols = (value, replacements) => {
    let matches;
    while ((matches = matchValueName.exec(value))) {
        const replacement = replacements[matches[0]];
        if (replacement) {
            value =
                value.slice(0, matches.index) +
                    replacement +
                    value.slice(matchValueName.lastIndex);
            matchValueName.lastIndex -= matches[0].length - replacement.length;
        }
    }
    return value;
};

const replaceSymbols = (css, replacements) => {
    css.walk(node => {
        if (node.type === "decl" && node.value) {
            node.value = replaceValueSymbols(node.value.toString(), replacements);
        }
        else if (node.type === "rule" && node.selector) {
            node.selector = replaceValueSymbols(node.selector.toString(), replacements);
        }
        else if (node.type === "atrule" && node.params) {
            node.params = replaceValueSymbols(node.params.toString(), replacements);
        }
    });
};

const importPattern = /^:import\(("[^"]*"|'[^']*'|[^"']+)\)$/;
const getDeclsObject = rule => {
    const object = {};
    rule.walkDecls(decl => {
        const before = decl.raws.before ? decl.raws.before.trim() : "";
        object[before + decl.prop] = decl.value;
    });
    return object;
};
const extractICSS = (css, removeRules = true) => {
    const icssImports = {};
    const icssExports = {};
    css.each(node => {
        if (node.type === "rule") {
            if (node.selector.slice(0, 7) === ":import") {
                const matches = importPattern.exec(node.selector);
                if (matches) {
                    const path = matches[1].replace(/'|"/g, "");
                    icssImports[path] = Object.assign(icssImports[path] || {}, getDeclsObject(node));
                    if (removeRules) {
                        node.remove();
                    }
                }
            }
            if (node.selector === ":export") {
                Object.assign(icssExports, getDeclsObject(node));
                if (removeRules) {
                    node.remove();
                }
            }
        }
    });
    return { icssImports, icssExports };
};

const createImports = imports => {
    return Object.keys(imports).map(path => {
        const aliases = imports[path];
        const declarations = Object.keys(aliases).map(key => postcss.decl({
            prop: key,
            value: aliases[key],
            raws: { before: "\n  " }
        }));
        const hasDeclarations = declarations.length > 0;
        const rule = postcss.rule({
            selector: `:import('${path}')`,
            raws: { after: hasDeclarations ? "\n" : "" }
        });
        if (hasDeclarations) {
            rule.append(declarations);
        }
        return rule;
    });
};
const createExports = exports => {
    const declarations = Object.keys(exports).map(key => postcss.decl({
        prop: key,
        value: exports[key],
        raws: { before: "\n  " }
    }));
    if (declarations.length === 0) {
        return [];
    }
    const rule = postcss
        .rule({
        selector: `:export`,
        raws: { after: "\n" }
    })
        .append(declarations);
    return [rule];
};
const createICSSRules = (imports, exports) => [
    ...createImports(imports),
    ...createExports(exports)
];

export { createICSSRules, extractICSS, replaceSymbols, replaceValueSymbols };

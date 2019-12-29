import Parser from './fastparse';
import regexpu from 'regexpu-core';
import cssesc from './cssesc';

function unescape(str) {
    return str.replace(/\\(.)/g, "$1");
}
function commentMatch(match, content) {
    this.selector.nodes.push({
        type: "comment",
        content: content
    });
}
function typeMatch(type) {
    return function (match, name) {
        this.selector.nodes.push({
            type: type,
            name: unescape(name)
        });
    };
}
function pseudoClassStartMatch(match, name) {
    var newToken = {
        type: "pseudo-class",
        name: unescape(name),
        content: ""
    };
    this.selector.nodes.push(newToken);
    this.token = newToken;
    this.brackets = 1;
    return "inBrackets";
}
function nestedPseudoClassStartMatch(match, name, after) {
    var newSelector = {
        type: "selector",
        nodes: []
    };
    var newToken = {
        type: "nested-pseudo-class",
        name: unescape(name),
        nodes: [newSelector]
    };
    if (after) {
        newSelector.before = after;
    }
    this.selector.nodes.push(newToken);
    this.stack.push(this.root);
    this.root = newToken;
    this.selector = newSelector;
}
function nestedEnd(match, before) {
    if (this.stack.length > 0) {
        if (before) {
            this.selector.after = before;
        }
        this.root = this.stack.pop();
        this.selector = this.root.nodes[this.root.nodes.length - 1];
    }
    else {
        this.selector.nodes.push({
            type: "invalid",
            value: match
        });
    }
}
function operatorMatch(match, before, operator, after) {
    var token = {
        type: "operator",
        operator: operator
    };
    if (before) {
        token.before = before;
    }
    if (after) {
        token.after = after;
    }
    this.selector.nodes.push(token);
}
function spacingMatch(match) {
    this.selector.nodes.push({
        type: "spacing",
        value: match
    });
}
function elementMatch(match, namespace, name) {
    var newToken = {
        type: "element",
        name: unescape(name)
    };
    if (namespace) {
        newToken.namespace = unescape(namespace.substr(0, namespace.length - 1));
    }
    this.selector.nodes.push(newToken);
}
function universalMatch(match, namespace) {
    var newToken = {
        type: "universal"
    };
    if (namespace) {
        newToken.namespace = unescape(namespace.substr(0, namespace.length - 1));
    }
    this.selector.nodes.push(newToken);
}
function attributeMatch(match, content) {
    this.selector.nodes.push({
        type: "attribute",
        content: content
    });
}
function invalidMatch(match) {
    this.selector.nodes.push({
        type: "invalid",
        value: match
    });
}
function irrelevantSpacingStartMatch(match) {
    this.selector.before = match;
}
function irrelevantSpacingEndMatch(match) {
    this.selector.after = match;
}
function nextSelectorMatch(match, before, after) {
    var newSelector = {
        type: "selector",
        nodes: []
    };
    if (before) {
        this.selector.after = before;
    }
    if (after) {
        newSelector.before = after;
    }
    this.root.nodes.push(newSelector);
    this.selector = newSelector;
}
function addToCurrent(match) {
    this.token.content += match;
}
function bracketStart(match) {
    this.token.content += match;
    this.brackets++;
}
function bracketEnd(match) {
    if (--this.brackets === 0) {
        return "selector";
    }
    this.token.content += match;
}
function getSelectors() {
    // The assignment here is split to preserve the property enumeration order.
    var selectors = {
        "/\\*([\\s\\S]*?)\\*/": commentMatch
    };
    // https://www.w3.org/TR/CSS21/syndata.html#characters
    // 4.1.3: identifiers (...) can contain only the characters [a-zA-Z0-9] and
    // ISO 10646 characters U+00A0 and higher, plus the hyphen (-) and the underscore (_)
    //
    // 10ffff is the maximum allowed in current Unicode
    selectors[regexpu("\\.((?:\\\\.|[A-Za-z_\\-\\u{00a0}-\\u{10ffff}])(?:\\\\.|[A-Za-z_\\-0-9\\u{00a0}-\\u{10ffff}])*)", "u")] = typeMatch("class");
    selectors[regexpu("#((?:\\\\.|[A-Za-z_\\-\\u{00a0}-\\u{10ffff}])(?:\\\\.|[A-Za-z_\\-0-9\\u{00a0}-\\u{10ffff}])*)", "u")] = typeMatch("id");
    var selectorsSecondHalf = {
        ":(not|matches|has|local|global)\\((\\s*)": nestedPseudoClassStartMatch,
        ":((?:\\\\.|[A-Za-z_\\-0-9])+)\\(": pseudoClassStartMatch,
        ":((?:\\\\.|[A-Za-z_\\-0-9])+)": typeMatch("pseudo-class"),
        "::((?:\\\\.|[A-Za-z_\\-0-9])+)": typeMatch("pseudo-element"),
        "(\\*\\|)((?:\\\\.|[A-Za-z_\\-0-9])+)": elementMatch,
        "(\\*\\|)\\*": universalMatch,
        "((?:\\\\.|[A-Za-z_\\-0-9])*\\|)?\\*": universalMatch,
        "((?:\\\\.|[A-Za-z_\\-0-9])*\\|)?((?:\\\\.|[A-Za-z_\\-])(?:\\\\.|[A-Za-z_\\-0-9])*)": elementMatch,
        "\\[([^\\]]+)\\]": attributeMatch,
        "(\\s*)\\)": nestedEnd,
        "(\\s*)((?:\\|\\|)|(?:>>)|[>+~])(\\s*)": operatorMatch,
        "(\\s*),(\\s*)": nextSelectorMatch,
        "\\s+$": irrelevantSpacingEndMatch,
        "^\\s+": irrelevantSpacingStartMatch,
        "\\s+": spacingMatch,
        ".": invalidMatch
    };
    var selector;
    for (selector in selectorsSecondHalf) {
        if (Object.prototype.hasOwnProperty.call(selectorsSecondHalf, selector)) {
            selectors[selector] = selectorsSecondHalf[selector];
        }
    }
    return selectors;
}
var parser = new Parser({
    selector: getSelectors(),
    inBrackets: {
        "/\\*[\\s\\S]*?\\*/": addToCurrent,
        "\"([^\\\\\"]|\\\\.)*\"": addToCurrent,
        "'([^\\\\']|\\\\.)*'": addToCurrent,
        "[^()'\"/]+": addToCurrent,
        "\\(": bracketStart,
        "\\)": bracketEnd,
        ".": addToCurrent
    }
});
function parse(str) {
    var selectorNode = {
        type: "selector",
        nodes: []
    };
    var rootNode = {
        type: "selectors",
        nodes: [
            selectorNode
        ]
    };
    parser.parse("selector", str, {
        stack: [],
        root: rootNode,
        selector: selectorNode
    });
    return rootNode;
}

var stringify;
var identifierEscapeRegexp = new RegExp(regexpu("(^[^A-Za-z_\\-\\u{00a0}-\\u{10ffff}]|^\\-\\-|[^A-Za-z_0-9\\-\\u{00a0}-\\u{10ffff}])", "ug"), "g");
function escape(str, identifier) {
    if (str === "*") {
        return "*";
    }
    if (identifier) {
        return str.replace(identifierEscapeRegexp, "\\$1");
    }
    else {
        return str.replace(/(^[^A-Za-z_\\-]|^\-\-|[^A-Za-z_0-9\\-])/g, "\\$1");
    }
}
function stringifyWithoutBeforeAfter(tree) {
    switch (tree.type) {
        case "selectors":
            return tree.nodes.map(stringify).join(",");
        case "selector":
            return tree.nodes.map(stringify).join("");
        case "element":
            return (typeof tree.namespace === "string" ? escape(tree.namespace) + "|" : "") + escape(tree.name);
        case "class":
            return "." + escape(tree.name, true);
        case "id":
            return "#" + escape(tree.name, true);
        case "attribute":
            return "[" + tree.content + "]";
        case "spacing":
            return tree.value;
        case "pseudo-class":
            return ":" + escape(tree.name) + (typeof tree.content === "string" ? "(" + tree.content + ")" : "");
        case "nested-pseudo-class":
            return ":" + escape(tree.name) + "(" + tree.nodes.map(stringify).join(",") + ")";
        case "pseudo-element":
            return "::" + escape(tree.name);
        case "universal":
            return (typeof tree.namespace === "string" ? escape(tree.namespace) + "|" : "") + "*";
        case "operator":
            return tree.operator;
        case "comment":
            return "/*" + tree.content + "*/";
        case "invalid":
            return tree.value;
    }
}
stringify = function stringify(tree) {
    var str = stringifyWithoutBeforeAfter(tree);
    if (tree.before) {
        str = tree.before + str;
    }
    if (tree.after) {
        str = str + tree.after;
    }
    return str;
};
var stringify$1 = stringify;

function commentMatch$1(match, content) {
    this.value.nodes.push({
        type: "comment",
        content: content
    });
}
function spacingMatch$1(match) {
    var item = this.value.nodes[this.value.nodes.length - 1];
    item.after = (item.after || "") + match;
}
function initialSpacingMatch(match) {
    this.value.before = match;
}
function endSpacingMatch(match) {
    this.value.after = match;
}
function unescapeString(content) {
    return content.replace(/\\(?:([a-fA-F0-9]{1,6})|(.))/g, function (all, unicode, otherCharacter) {
        if (otherCharacter) {
            return otherCharacter;
        }
        var C = parseInt(unicode, 16);
        if (C < 0x10000) {
            return String.fromCharCode(C);
        }
        else {
            return String.fromCharCode(Math.floor((C - 0x10000) / 0x400) + 0xD800) +
                String.fromCharCode((C - 0x10000) % 0x400 + 0xDC00);
        }
    });
}
function stringMatch(match, content) {
    var value = unescapeString(content);
    this.value.nodes.push({
        type: "string",
        value: value,
        stringType: match[0]
    });
}
function commaMatch(match, spacing) {
    var newValue = {
        type: "value",
        nodes: []
    };
    if (spacing) {
        newValue.before = spacing;
    }
    this.root.nodes.push(newValue);
    this.value = newValue;
}
function itemMatch(match) {
    this.value.nodes.push({
        type: "item",
        name: match
    });
}
function nestedItemMatch(match, name, spacing) {
    this.stack.push(this.root);
    this.root = {
        type: "nested-item",
        name: name,
        nodes: [
            { type: "value", nodes: [] }
        ]
    };
    if (spacing) {
        this.root.nodes[0].before = spacing;
    }
    this.value.nodes.push(this.root);
    this.value = this.root.nodes[0];
}
function nestedItemEndMatch(match, spacing, remaining) {
    if (this.stack.length === 0) {
        if (spacing) {
            var item = this.value.nodes[this.value.nodes.length - 1];
            item.after = (item.after || "") + spacing;
        }
        this.value.nodes.push({
            type: "invalid",
            value: remaining
        });
    }
    else {
        if (spacing) {
            this.value.after = spacing;
        }
        this.root = this.stack.pop();
        this.value = this.root.nodes[this.root.nodes.length - 1];
    }
}
function urlMatch(match, innerSpacingBefore, content, innerSpacingAfter) {
    var item = {
        type: "url"
    };
    if (innerSpacingBefore) {
        item.innerSpacingBefore = innerSpacingBefore;
    }
    if (innerSpacingAfter) {
        item.innerSpacingAfter = innerSpacingAfter;
    }
    switch (content[0]) {
        case "\"":
            item.stringType = "\"";
            item.url = unescapeString(content.substr(1, content.length - 2));
            break;
        case "'":
            item.stringType = "'";
            item.url = unescapeString(content.substr(1, content.length - 2));
            break;
        default:
            item.url = unescapeString(content);
            break;
    }
    this.value.nodes.push(item);
}
var parser$1 = new Parser({
    decl: {
        "^\\s+": initialSpacingMatch,
        "/\\*([\\s\\S]*?)\\*/": commentMatch$1,
        "\"((?:[^\\\\\"]|\\\\.)*)\"": stringMatch,
        "'((?:[^\\\\']|\\\\.)*)'": stringMatch,
        "url\\((\\s*)(\"(?:[^\\\\\"]|\\\\.)*\")(\\s*)\\)": urlMatch,
        "url\\((\\s*)('(?:[^\\\\']|\\\\.)*')(\\s*)\\)": urlMatch,
        "url\\((\\s*)((?:[^\\\\)'\"]|\\\\.)*)(\\s*)\\)": urlMatch,
        "([\\w\-]+)\\((\\s*)": nestedItemMatch,
        "(\\s*)(\\))": nestedItemEndMatch,
        ",(\\s*)": commaMatch,
        "\\s+$": endSpacingMatch,
        "\\s+": spacingMatch$1,
        "[^\\s,\)]+": itemMatch
    }
});
function parseValues(str) {
    var valueNode = {
        type: "value",
        nodes: []
    };
    var rootNode = {
        type: "values",
        nodes: [
            valueNode
        ]
    };
    parser$1.parse("decl", str, {
        stack: [],
        root: rootNode,
        value: valueNode
    });
    return rootNode;
}

var stringify$2;
function escape$1(str, stringType) {
    return cssesc(str, {
        quotes: stringType === "\"" ? "double" : "single"
    });
}
function stringifyWithoutBeforeAfter$1(tree) {
    switch (tree.type) {
        case "values":
            return tree.nodes.map(stringify$2).join(",");
        case "value":
            return tree.nodes.map(stringify$2).join("");
        case "item":
            return tree.name;
        case "nested-item":
            return tree.name + "(" + tree.nodes.map(stringify$2).join(",") + ")";
        case "invalid":
            return tree.value;
        case "comment":
            return "/*" + tree.content + "*/";
        case "string":
            switch (tree.stringType) {
                case "'":
                    return "'" + escape$1(tree.value, "'") + "'";
                case "\"":
                    return "\"" + escape$1(tree.value, "\"") + "\"";
            }
            /* istanbul ignore next */
            throw new Error("Invalid stringType");
        case "url":
            var start = "url(" + (tree.innerSpacingBefore || "");
            var end = (tree.innerSpacingAfter || "") + ")";
            switch (tree.stringType) {
                case "'":
                    return start + "'" + tree.url.replace(/(\\)/g, "\\$1").replace(/'/g, "\\'") + "'" + end;
                case "\"":
                    return start + "\"" + tree.url.replace(/(\\)/g, "\\$1").replace(/"/g, "\\\"") + "\"" + end;
                default:
                    return start + tree.url.replace(/("|'|\)|\\)/g, "\\$1") + end;
            }
    }
}
stringify$2 = function stringify(tree) {
    var str = stringifyWithoutBeforeAfter$1(tree);
    if (tree.before) {
        str = tree.before + str;
    }
    if (tree.after) {
        str = str + tree.after;
    }
    return str;
};
var stringify$3 = stringify$2;

const Tokenizer ={ parse, parseValues, stringify: stringify$1, stringifyValues: stringify$3 }
export default Tokenizer
export {Tokenizer}
export { parse, parseValues, stringify$1 as stringify, stringify$3 as stringifyValues };

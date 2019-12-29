const whitespace = '[\\x20\\t\\r\\n\\f]';
const unescapeRegExp = new RegExp('\\\\([\\da-f]{1,6}' + whitespace + '?|(' + whitespace + ')|.)', 'ig');
function unesc(str) {
    return str.replace(unescapeRegExp, (_, escaped, escapedWhitespace) => {
        const high = '0x' + escaped - 0x10000;
        // NaN means non-codepoint
        // Workaround erroneous numeric interpretation of +"0x"
        // eslint-disable-next-line no-self-compare
        return high !== high || escapedWhitespace
            ? escaped
            : high < 0
                ? // BMP codepoint
                    String.fromCharCode(high + 0x10000)
                : // Supplemental Plane codepoint (surrogate pair)
                    String.fromCharCode((high >> 10) | 0xd800, (high & 0x3ff) | 0xdc00);
    });
}

function getProp(obj, ...props) {
    while (props.length > 0) {
        const prop = props.shift();
        if (!obj[prop]) {
            return undefined;
        }
        obj = obj[prop];
    }
    return obj;
}

function ensureObject(obj, ...props) {
    while (props.length > 0) {
        const prop = props.shift();
        if (!obj[prop]) {
            obj[prop] = {};
        }
        obj = obj[prop];
    }
}

let cloneNode = function (obj, parent) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    let cloned = new obj.constructor();
    for (let i in obj) {
        if (!obj.hasOwnProperty(i)) {
            continue;
        }
        let value = obj[i];
        let type = typeof value;
        if (i === 'parent' && type === 'object') {
            if (parent) {
                cloned[i] = parent;
            }
        }
        else if (value instanceof Array) {
            cloned[i] = value.map(j => cloneNode(j, cloned));
        }
        else {
            cloned[i] = cloneNode(value, cloned);
        }
    }
    return cloned;
};
class Node {
    constructor(opts = {}) {
        Object.assign(this, opts);
        this.spaces = this.spaces || {};
        this.spaces.before = this.spaces.before || '';
        this.spaces.after = this.spaces.after || '';
    }
    remove() {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.parent = undefined;
        return this;
    }
    replaceWith() {
        if (this.parent) {
            for (let index in arguments) {
                this.parent.insertBefore(this, arguments[index]);
            }
            this.remove();
        }
        return this;
    }
    next() {
        return this.parent.at(this.parent.index(this) + 1);
    }
    prev() {
        return this.parent.at(this.parent.index(this) - 1);
    }
    clone(overrides = {}) {
        let cloned = cloneNode(this);
        for (let name in overrides) {
            cloned[name] = overrides[name];
        }
        return cloned;
    }
    /**
     * Some non-standard syntax doesn't follow normal escaping rules for css.
     * This allows non standard syntax to be appended to an existing property
     * by specifying the escaped value. By specifying the escaped value,
     * illegal characters are allowed to be directly inserted into css output.
     * @param {string} name the property to set
     * @param {any} value the unescaped value of the property
     * @param {string} valueEscaped optional. the escaped value of the property.
     */
    appendToPropertyAndEscape(name, value, valueEscaped) {
        if (!this.raws) {
            this.raws = {};
        }
        let originalValue = this[name];
        let originalEscaped = this.raws[name];
        this[name] = originalValue + value; // this may trigger a setter that updates raws, so it has to be set first.
        if (originalEscaped || valueEscaped !== value) {
            this.raws[name] = (originalEscaped || originalValue) + valueEscaped;
        }
        else {
            delete this.raws[name]; // delete any escaped value that was created by the setter.
        }
    }
    /**
     * Some non-standard syntax doesn't follow normal escaping rules for css.
     * This allows the escaped value to be specified directly, allowing illegal
     * characters to be directly inserted into css output.
     * @param {string} name the property to set
     * @param {any} value the unescaped value of the property
     * @param {string} valueEscaped the escaped value of the property.
     */
    setPropertyAndEscape(name, value, valueEscaped) {
        if (!this.raws) {
            this.raws = {};
        }
        this[name] = value; // this may trigger a setter that updates raws, so it has to be set first.
        this.raws[name] = valueEscaped;
    }
    /**
     * When you want a value to passed through to CSS directly. This method
     * deletes the corresponding raw value causing the stringifier to fallback
     * to the unescaped value.
     * @param {string} name the property to set.
     * @param {any} value The value that is both escaped and unescaped.
     */
    setPropertyWithoutEscape(name, value) {
        this[name] = value; // this may trigger a setter that updates raws, so it has to be set first.
        if (this.raws) {
            delete this.raws[name];
        }
    }
    /**
     *
     * @param {number} line The number (starting with 1)
     * @param {number} column The column number (starting with 1)
     */
    isAtPosition(line, column) {
        if (this.source && this.source.start && this.source.end) {
            if (this.source.start.line > line) {
                return false;
            }
            if (this.source.end.line < line) {
                return false;
            }
            if (this.source.start.line === line && this.source.start.column > column) {
                return false;
            }
            if (this.source.end.line === line && this.source.end.column < column) {
                return false;
            }
            return true;
        }
        return undefined;
    }
    stringifyProperty(name) {
        return (this.raws && this.raws[name]) || this[name];
    }
    get rawSpaceBefore() {
        let rawSpace = this.raws && this.raws.spaces && this.raws.spaces.before;
        if (rawSpace === undefined) {
            rawSpace = this.spaces && this.spaces.before;
        }
        return rawSpace || "";
    }
    set rawSpaceBefore(raw) {
        ensureObject(this, "raws", "spaces");
        this.raws.spaces.before = raw;
    }
    get rawSpaceAfter() {
        let rawSpace = this.raws && this.raws.spaces && this.raws.spaces.after;
        if (rawSpace === undefined) {
            rawSpace = this.spaces.after;
        }
        return rawSpace || "";
    }
    set rawSpaceAfter(raw) {
        ensureObject(this, "raws", "spaces");
        this.raws.spaces.after = raw;
    }
    valueToString() {
        return String(this.stringifyProperty("value"));
    }
    toString() {
        return [
            this.rawSpaceBefore,
            this.valueToString(),
            this.rawSpaceAfter,
        ].join('');
    }
}

const TAG = 'tag';
const STRING = 'string';
const SELECTOR = 'selector';
const ROOT = 'root';
const PSEUDO = 'pseudo';
const NESTING = 'nesting';
const ID = 'id';
const COMMENT = 'comment';
const COMBINATOR = 'combinator';
const CLASS = 'class';
const ATTRIBUTE = 'attribute';
const UNIVERSAL = 'universal';

class Container extends Node {
    constructor(opts) {
        super(opts);
        if (!this.nodes) {
            this.nodes = [];
        }
    }
    append(selector) {
        selector.parent = this;
        this.nodes.push(selector);
        return this;
    }
    prepend(selector) {
        selector.parent = this;
        this.nodes.unshift(selector);
        return this;
    }
    at(index) {
        return this.nodes[index];
    }
    index(child) {
        if (typeof child === 'number') {
            return child;
        }
        return this.nodes.indexOf(child);
    }
    get first() {
        return this.at(0);
    }
    get last() {
        return this.at(this.length - 1);
    }
    get length() {
        return this.nodes.length;
    }
    removeChild(child) {
        child = this.index(child);
        this.at(child).parent = undefined;
        this.nodes.splice(child, 1);
        let index;
        for (let id in this.indexes) {
            index = this.indexes[id];
            if (index >= child) {
                this.indexes[id] = index - 1;
            }
        }
        return this;
    }
    removeAll() {
        for (let node of this.nodes) {
            node.parent = undefined;
        }
        this.nodes = [];
        return this;
    }
    empty() {
        return this.removeAll();
    }
    insertAfter(oldNode, newNode) {
        newNode.parent = this;
        let oldIndex = this.index(oldNode);
        this.nodes.splice(oldIndex + 1, 0, newNode);
        newNode.parent = this;
        let index;
        for (let id in this.indexes) {
            index = this.indexes[id];
            if (oldIndex <= index) {
                this.indexes[id] = index + 1;
            }
        }
        return this;
    }
    insertBefore(oldNode, newNode) {
        newNode.parent = this;
        let oldIndex = this.index(oldNode);
        this.nodes.splice(oldIndex, 0, newNode);
        newNode.parent = this;
        let index;
        for (let id in this.indexes) {
            index = this.indexes[id];
            if (index <= oldIndex) {
                this.indexes[id] = index + 1;
            }
        }
        return this;
    }
    _findChildAtPosition(line, col) {
        let found = undefined;
        this.each(node => {
            if (node.atPosition) {
                let foundChild = node.atPosition(line, col);
                if (foundChild) {
                    found = foundChild;
                    return false;
                }
            }
            else if (node.isAtPosition(line, col)) {
                found = node;
                return false;
            }
        });
        return found;
    }
    /**
     * Return the most specific node at the line and column number given.
     * The source location is based on the original parsed location, locations aren't
     * updated as selector nodes are mutated.
     *
     * Note that this location is relative to the location of the first character
     * of the selector, and not the location of the selector in the overall document
     * when used in conjunction with postcss.
     *
     * If not found, returns undefined.
     * @param {number} line The line number of the node to find. (1-based index)
     * @param {number} col  The column number of the node to find. (1-based index)
     */
    atPosition(line, col) {
        if (this.isAtPosition(line, col)) {
            return this._findChildAtPosition(line, col) || this;
        }
        else {
            return undefined;
        }
    }
    _inferEndPosition() {
        if (this.last && this.last.source && this.last.source.end) {
            this.source = this.source || {};
            this.source.end = this.source.end || {};
            Object.assign(this.source.end, this.last.source.end);
        }
    }
    each(callback) {
        if (!this.lastEach) {
            this.lastEach = 0;
        }
        if (!this.indexes) {
            this.indexes = {};
        }
        this.lastEach++;
        let id = this.lastEach;
        this.indexes[id] = 0;
        if (!this.length) {
            return undefined;
        }
        let index, result;
        while (this.indexes[id] < this.length) {
            index = this.indexes[id];
            result = callback(this.at(index), index);
            if (result === false) {
                break;
            }
            this.indexes[id] += 1;
        }
        delete this.indexes[id];
        if (result === false) {
            return false;
        }
    }
    walk(callback) {
        return this.each((node, i) => {
            let result = callback(node, i);
            if (result !== false && node.length) {
                result = node.walk(callback);
            }
            if (result === false) {
                return false;
            }
        });
    }
    walkAttributes(callback) {
        return this.walk((selector) => {
            if (selector.type === ATTRIBUTE) {
                return callback.call(this, selector);
            }
        });
    }
    walkClasses(callback) {
        return this.walk((selector) => {
            if (selector.type === CLASS) {
                return callback.call(this, selector);
            }
        });
    }
    walkCombinators(callback) {
        return this.walk((selector) => {
            if (selector.type === COMBINATOR) {
                return callback.call(this, selector);
            }
        });
    }
    walkComments(callback) {
        return this.walk((selector) => {
            if (selector.type === COMMENT) {
                return callback.call(this, selector);
            }
        });
    }
    walkIds(callback) {
        return this.walk((selector) => {
            if (selector.type === ID) {
                return callback.call(this, selector);
            }
        });
    }
    walkNesting(callback) {
        return this.walk(selector => {
            if (selector.type === NESTING) {
                return callback.call(this, selector);
            }
        });
    }
    walkPseudos(callback) {
        return this.walk((selector) => {
            if (selector.type === PSEUDO) {
                return callback.call(this, selector);
            }
        });
    }
    walkTags(callback) {
        return this.walk((selector) => {
            if (selector.type === TAG) {
                return callback.call(this, selector);
            }
        });
    }
    walkUniversals(callback) {
        return this.walk((selector) => {
            if (selector.type === UNIVERSAL) {
                return callback.call(this, selector);
            }
        });
    }
    split(callback) {
        let current = [];
        return this.reduce((memo, node, index) => {
            let split = callback.call(this, node);
            current.push(node);
            if (split) {
                memo.push(current);
                current = [];
            }
            else if (index === this.length - 1) {
                memo.push(current);
            }
            return memo;
        }, []);
    }
    map(callback) {
        return this.nodes.map(callback);
    }
    reduce(callback, memo) {
        return this.nodes.reduce(callback, memo);
    }
    every(callback) {
        return this.nodes.every(callback);
    }
    some(callback) {
        return this.nodes.some(callback);
    }
    filter(callback) {
        return this.nodes.filter(callback);
    }
    sort(callback) {
        return this.nodes.sort(callback);
    }
    toString() {
        return this.map(String).join('');
    }
}

class Root extends Container {
    constructor(opts) {
        super(opts);
        this.type = ROOT;
    }
    toString() {
        let str = this.reduce((memo, selector) => {
            memo.push(String(selector));
            return memo;
        }, []).join(',');
        return this.trailingComma ? str + ',' : str;
    }
    error(message, options) {
        if (this._error) {
            return this._error(message, options);
        }
        else {
            return new Error(message);
        }
    }
    set errorGenerator(handler) {
        this._error = handler;
    }
}

class Selector extends Container {
    constructor(opts) {
        super(opts);
        this.type = SELECTOR;
    }
}

/*! https://mths.be/cssesc v3.0.0 by @mathias */
var object = {};
var hasOwnProperty = object.hasOwnProperty;
var merge = function merge(options, defaults) {
    if (!options) {
        return defaults;
    }
    var result = {};
    for (var key in defaults) {
        // `if (defaults.hasOwnProperty(key) { … }` is not needed here, since
        // only recognized option names are used.
        result[key] = hasOwnProperty.call(options, key) ? options[key] : defaults[key];
    }
    return result;
};
var regexAnySingleEscape = /[ -,\.\/:-@\[-\^`\{-~]/;
var regexSingleEscape = /[ -,\.\/:-@\[\]\^`\{-~]/;
var regexExcessiveSpaces = /(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g;
// https://mathiasbynens.be/notes/css-escapes#css
var cssesc = function cssesc(string, options) {
    options = merge(options, cssesc.options);
    if (options.quotes != 'single' && options.quotes != 'double') {
        options.quotes = 'single';
    }
    var quote = options.quotes == 'double' ? '"' : '\'';
    var isIdentifier = options.isIdentifier;
    var firstChar = string.charAt(0);
    var output = '';
    var counter = 0;
    var length = string.length;
    while (counter < length) {
        var character = string.charAt(counter++);
        var codePoint = character.charCodeAt();
        var value = void 0;
        // If it’s not a printable ASCII character…
        if (codePoint < 0x20 || codePoint > 0x7E) {
            if (codePoint >= 0xD800 && codePoint <= 0xDBFF && counter < length) {
                // It’s a high surrogate, and there is a next character.
                var extra = string.charCodeAt(counter++);
                if ((extra & 0xFC00) == 0xDC00) {
                    // next character is low surrogate
                    codePoint = ((codePoint & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
                }
                else {
                    // It’s an unmatched surrogate; only append this code unit, in case
                    // the next code unit is the high surrogate of a surrogate pair.
                    counter--;
                }
            }
            value = '\\' + codePoint.toString(16).toUpperCase() + ' ';
        }
        else {
            if (options.escapeEverything) {
                if (regexAnySingleEscape.test(character)) {
                    value = '\\' + character;
                }
                else {
                    value = '\\' + codePoint.toString(16).toUpperCase() + ' ';
                }
            }
            else if (/[\t\n\f\r\x0B]/.test(character)) {
                value = '\\' + codePoint.toString(16).toUpperCase() + ' ';
            }
            else if (character == '\\' || !isIdentifier && (character == '"' && quote == character || character == '\'' && quote == character) || isIdentifier && regexSingleEscape.test(character)) {
                value = '\\' + character;
            }
            else {
                value = character;
            }
        }
        output += value;
    }
    if (isIdentifier) {
        if (/^-[-\d]/.test(output)) {
            output = '\\-' + output.slice(1);
        }
        else if (/\d/.test(firstChar)) {
            output = '\\3' + firstChar + ' ' + output.slice(1);
        }
    }
    // Remove spaces after `\HEX` escapes that are not followed by a hex digit,
    // since they’re redundant. Note that this is only possible if the escape
    // sequence isn’t preceded by an odd number of backslashes.
    output = output.replace(regexExcessiveSpaces, function ($0, $1, $2) {
        if ($1 && $1.length % 2) {
            // It’s not safe to remove the space, so don’t.
            return $0;
        }
        // Strip the space.
        return ($1 || '') + $2;
    });
    if (!isIdentifier && options.wrap) {
        return quote + output + quote;
    }
    return output;
};
// Expose default options (so they can be overridden globally).
cssesc.options = {
    'escapeEverything': false,
    'isIdentifier': false,
    'quotes': 'single',
    'wrap': false
};
cssesc.version = '3.0.0';

class ClassName extends Node {
    constructor(opts) {
        super(opts);
        this.type = CLASS;
        this._constructed = true;
    }
    set value(v) {
        if (this._constructed) {
            let escaped = cssesc(v, { isIdentifier: true });
            if (escaped !== v) {
                ensureObject(this, "raws");
                this.raws.value = escaped;
            }
            else if (this.raws) {
                delete this.raws.value;
            }
        }
        this._value = v;
    }
    get value() {
        return this._value;
    }
    valueToString() {
        return '.' + super.valueToString();
    }
}

class Comment extends Node {
    constructor(opts) {
        super(opts);
        this.type = COMMENT;
    }
}

class ID$1 extends Node {
    constructor(opts) {
        super(opts);
        this.type = ID;
    }
    valueToString() {
        return '#' + super.valueToString();
    }
}

class Namespace extends Node {
    get namespace() {
        return this._namespace;
    }
    set namespace(namespace) {
        if (namespace === true || namespace === "*" || namespace === "&") {
            this._namespace = namespace;
            if (this.raws) {
                delete this.raws.namespace;
            }
            return;
        }
        let escaped = cssesc(namespace, { isIdentifier: true });
        this._namespace = namespace;
        if (escaped !== namespace) {
            ensureObject(this, "raws");
            this.raws.namespace = escaped;
        }
        else if (this.raws) {
            delete this.raws.namespace;
        }
    }
    get ns() {
        return this._namespace;
    }
    set ns(namespace) {
        this.namespace = namespace;
    }
    get namespaceString() {
        if (this.namespace) {
            let ns = this.stringifyProperty("namespace");
            if (ns === true) {
                return '';
            }
            else {
                return ns;
            }
        }
        else {
            return '';
        }
    }
    qualifiedName(value) {
        if (this.namespace) {
            return `${this.namespaceString}|${value}`;
        }
        else {
            return value;
        }
    }
    valueToString() {
        return this.qualifiedName(super.valueToString());
    }
}

class Tag extends Namespace {
    constructor(opts) {
        super(opts);
        this.type = TAG;
    }
}

class String$1 extends Node {
    constructor(opts) {
        super(opts);
        this.type = STRING;
    }
}

class Pseudo extends Container {
    constructor(opts) {
        super(opts);
        this.type = PSEUDO;
    }
    toString() {
        let params = this.length ? '(' + this.map(String).join(',') + ')' : '';
        return [
            this.rawSpaceBefore,
            this.stringifyProperty("value"),
            params,
            this.rawSpaceAfter,
        ].join('');
    }
}

const { deprecate } = require("util");
const WRAPPED_IN_QUOTES = /^('|")(.*)\1$/;
const warnOfDeprecatedValueAssignment = deprecate(() => { }, "Assigning an attribute a value containing characters that might need to be escaped is deprecated. " +
    "Call attribute.setValue() instead.");
const warnOfDeprecatedQuotedAssignment = deprecate(() => { }, "Assigning attr.quoted is deprecated and has no effect. Assign to attr.quoteMark instead.");
const warnOfDeprecatedConstructor = deprecate(() => { }, "Constructing an Attribute selector with a value without specifying quoteMark is deprecated. Note: The value should be unescaped now.");
function unescapeValue(value) {
    let deprecatedUsage = false;
    let quoteMark = null;
    let unescaped = value;
    let m = unescaped.match(WRAPPED_IN_QUOTES);
    if (m) {
        quoteMark = m[1];
        unescaped = m[2];
    }
    unescaped = unesc(unescaped);
    if (unescaped !== value) {
        deprecatedUsage = true;
    }
    return {
        deprecatedUsage,
        unescaped,
        quoteMark,
    };
}
function handleDeprecatedContructorOpts(opts) {
    if (opts.quoteMark !== undefined) {
        return opts;
    }
    if (opts.value === undefined) {
        return opts;
    }
    warnOfDeprecatedConstructor();
    let { quoteMark, unescaped } = unescapeValue(opts.value);
    if (!opts.raws) {
        opts.raws = {};
    }
    if (opts.raws.value === undefined) {
        opts.raws.value = opts.value;
    }
    opts.value = unescaped;
    opts.quoteMark = quoteMark;
    return opts;
}
class Attribute extends Namespace {
    constructor(opts = {}) {
        super(handleDeprecatedContructorOpts(opts));
        this.type = ATTRIBUTE;
        this.raws = this.raws || {};
        Object.defineProperty(this.raws, 'unquoted', {
            get: deprecate(() => this.value, "attr.raws.unquoted is deprecated. Call attr.value instead."),
            set: deprecate(() => this.value, "Setting attr.raws.unquoted is deprecated and has no effect. attr.value is unescaped by default now."),
        });
        this._constructed = true;
    }
    /**
     * Returns the Attribute's value quoted such that it would be legal to use
     * in the value of a css file. The original value's quotation setting
     * used for stringification is left unchanged. See `setValue(value, options)`
     * if you want to control the quote settings of a new value for the attribute.
     *
     * You can also change the quotation used for the current value by setting quoteMark.
     *
     * Options:
     *   * quoteMark {'"' | "'" | null} - Use this value to quote the value. If this
     *     option is not set, the original value for quoteMark will be used. If
     *     indeterminate, a double quote is used. The legal values are:
     *     * `null` - the value will be unquoted and characters will be escaped as necessary.
     *     * `'` - the value will be quoted with a single quote and single quotes are escaped.
     *     * `"` - the value will be quoted with a double quote and double quotes are escaped.
     *   * preferCurrentQuoteMark {boolean} - if true, prefer the source quote mark
     *     over the quoteMark option value.
     *   * smart {boolean} - if true, will select a quote mark based on the value
     *     and the other options specified here. See the `smartQuoteMark()`
     *     method.
     **/
    getQuotedValue(options = {}) {
        let quoteMark = this._determineQuoteMark(options);
        let cssescopts = CSSESC_QUOTE_OPTIONS[quoteMark];
        let escaped = cssesc(this._value, cssescopts);
        return escaped;
    }
    _determineQuoteMark(options) {
        return (options.smart) ? this.smartQuoteMark(options) : this.preferredQuoteMark(options);
    }
    /**
     * Set the unescaped value with the specified quotation options. The value
     * provided must not include any wrapping quote marks -- those quotes will
     * be interpreted as part of the value and escaped accordingly.
     */
    setValue(value, options = {}) {
        this._value = value;
        this._quoteMark = this._determineQuoteMark(options);
        this._syncRawValue();
    }
    /**
     * Intelligently select a quoteMark value based on the value's contents. If
     * the value is a legal CSS ident, it will not be quoted. Otherwise a quote
     * mark will be picked that minimizes the number of escapes.
     *
     * If there's no clear winner, the quote mark from these options is used,
     * then the source quote mark (this is inverted if `preferCurrentQuoteMark` is
     * true). If the quoteMark is unspecified, a double quote is used.
     *
     * @param options This takes the quoteMark and preferCurrentQuoteMark options
     * from the quoteValue method.
     */
    smartQuoteMark(options) {
        let v = this.value;
        let numSingleQuotes = v.replace(/[^']/g, '').length;
        let numDoubleQuotes = v.replace(/[^"]/g, '').length;
        if (numSingleQuotes + numDoubleQuotes === 0) {
            let escaped = cssesc(v, { isIdentifier: true });
            if (escaped === v) {
                return Attribute.NO_QUOTE;
            }
            else {
                let pref = this.preferredQuoteMark(options);
                if (pref === Attribute.NO_QUOTE) {
                    // pick a quote mark that isn't none and see if it's smaller
                    let quote = this.quoteMark || options.quoteMark || Attribute.DOUBLE_QUOTE;
                    let opts = CSSESC_QUOTE_OPTIONS[quote];
                    let quoteValue = cssesc(v, opts);
                    if (quoteValue.length < escaped.length) {
                        return quote;
                    }
                }
                return pref;
            }
        }
        else if (numDoubleQuotes === numSingleQuotes) {
            return this.preferredQuoteMark(options);
        }
        else if (numDoubleQuotes < numSingleQuotes) {
            return Attribute.DOUBLE_QUOTE;
        }
        else {
            return Attribute.SINGLE_QUOTE;
        }
    }
    /**
     * Selects the preferred quote mark based on the options and the current quote mark value.
     * If you want the quote mark to depend on the attribute value, call `smartQuoteMark(opts)`
     * instead.
     */
    preferredQuoteMark(options) {
        let quoteMark = (options.preferCurrentQuoteMark) ? this.quoteMark : options.quoteMark;
        if (quoteMark === undefined) {
            quoteMark = (options.preferCurrentQuoteMark) ? options.quoteMark : this.quoteMark;
        }
        if (quoteMark === undefined) {
            quoteMark = Attribute.DOUBLE_QUOTE;
        }
        return quoteMark;
    }
    get quoted() {
        let qm = this.quoteMark;
        return qm === "'" || qm === '"';
    }
    set quoted(value) {
        warnOfDeprecatedQuotedAssignment();
    }
    /**
     * returns a single (`'`) or double (`"`) quote character if the value is quoted.
     * returns `null` if the value is not quoted.
     * returns `undefined` if the quotation state is unknown (this can happen when
     * the attribute is constructed without specifying a quote mark.)
     */
    get quoteMark() {
        return this._quoteMark;
    }
    /**
     * Set the quote mark to be used by this attribute's value.
     * If the quote mark changes, the raw (escaped) value at `attr.raws.value` of the attribute
     * value is updated accordingly.
     *
     * @param {"'" | '"' | null} quoteMark The quote mark or `null` if the value should be unquoted.
     */
    set quoteMark(quoteMark) {
        if (!this._constructed) {
            this._quoteMark = quoteMark;
            return;
        }
        if (this._quoteMark !== quoteMark) {
            this._quoteMark = quoteMark;
            this._syncRawValue();
        }
    }
    _syncRawValue() {
        let rawValue = cssesc(this._value, CSSESC_QUOTE_OPTIONS[this.quoteMark]);
        if (rawValue === this._value) {
            if (this.raws) {
                delete this.raws.value;
            }
        }
        else {
            this.raws.value = rawValue;
        }
    }
    get qualifiedAttribute() {
        return this.qualifiedName(this.raws.attribute || this.attribute);
    }
    get insensitiveFlag() {
        return this.insensitive ? 'i' : '';
    }
    get value() {
        return this._value;
    }
    /**
     * Before 3.0, the value had to be set to an escaped value including any wrapped
     * quote marks. In 3.0, the semantics of `Attribute.value` changed so that the value
     * is unescaped during parsing and any quote marks are removed.
     *
     * Because the ambiguity of this semantic change, if you set `attr.value = newValue`,
     * a deprecation warning is raised when the new value contains any characters that would
     * require escaping (including if it contains wrapped quotes).
     *
     * Instead, you should call `attr.setValue(newValue, opts)` and pass options that describe
     * how the new value is quoted.
     */
    set value(v) {
        if (this._constructed) {
            let { deprecatedUsage, unescaped, quoteMark, } = unescapeValue(v);
            if (deprecatedUsage) {
                warnOfDeprecatedValueAssignment();
            }
            if (unescaped === this._value && quoteMark === this._quoteMark) {
                return;
            }
            this._value = unescaped;
            this._quoteMark = quoteMark;
            this._syncRawValue();
        }
        else {
            this._value = v;
        }
    }
    get attribute() {
        return this._attribute;
    }
    set attribute(name) {
        this._handleEscapes("attribute", name);
        this._attribute = name;
    }
    _handleEscapes(prop, value) {
        if (this._constructed) {
            let escaped = cssesc(value, { isIdentifier: true });
            if (escaped !== value) {
                this.raws[prop] = escaped;
            }
            else {
                delete this.raws[prop];
            }
        }
    }
    _spacesFor(name) {
        let attrSpaces = { before: '', after: '' };
        let spaces = this.spaces[name] || {};
        let rawSpaces = (this.raws.spaces && this.raws.spaces[name]) || {};
        return Object.assign(attrSpaces, spaces, rawSpaces);
    }
    _stringFor(name, spaceName = name, concat = defaultAttrConcat) {
        let attrSpaces = this._spacesFor(spaceName);
        return concat(this.stringifyProperty(name), attrSpaces);
    }
    /**
     * returns the offset of the attribute part specified relative to the
     * start of the node of the output string.
     *
     * * "ns" - alias for "namespace"
     * * "namespace" - the namespace if it exists.
     * * "attribute" - the attribute name
     * * "attributeNS" - the start of the attribute or its namespace
     * * "operator" - the match operator of the attribute
     * * "value" - The value (string or identifier)
     * * "insensitive" - the case insensitivity flag;
     * @param part One of the possible values inside an attribute.
     * @returns -1 if the name is invalid or the value doesn't exist in this attribute.
     */
    offsetOf(name) {
        let count = 1;
        let attributeSpaces = this._spacesFor("attribute");
        count += attributeSpaces.before.length;
        if (name === "namespace" || name === "ns") {
            return (this.namespace) ? count : -1;
        }
        if (name === "attributeNS") {
            return count;
        }
        count += this.namespaceString.length;
        if (this.namespace) {
            count += 1;
        }
        if (name === "attribute") {
            return count;
        }
        count += this.stringifyProperty("attribute").length;
        count += attributeSpaces.after.length;
        let operatorSpaces = this._spacesFor("operator");
        count += operatorSpaces.before.length;
        let operator = this.stringifyProperty("operator");
        if (name === "operator") {
            return operator ? count : -1;
        }
        count += operator.length;
        count += operatorSpaces.after.length;
        let valueSpaces = this._spacesFor("value");
        count += valueSpaces.before.length;
        let value = this.stringifyProperty("value");
        if (name === "value") {
            return value ? count : -1;
        }
        count += value.length;
        count += valueSpaces.after.length;
        let insensitiveSpaces = this._spacesFor("insensitive");
        count += insensitiveSpaces.before.length;
        if (name === "insensitive") {
            return (this.insensitive) ? count : -1;
        }
        return -1;
    }
    toString() {
        let selector = [
            this.rawSpaceBefore,
            '[',
        ];
        selector.push(this._stringFor('qualifiedAttribute', 'attribute'));
        if (this.operator && (this.value || this.value === '')) {
            selector.push(this._stringFor('operator'));
            selector.push(this._stringFor('value'));
            selector.push(this._stringFor('insensitiveFlag', 'insensitive', (attrValue, attrSpaces) => {
                if (attrValue.length > 0
                    && !this.quoted
                    && attrSpaces.before.length === 0
                    && !(this.spaces.value && this.spaces.value.after)) {
                    attrSpaces.before = " ";
                }
                return defaultAttrConcat(attrValue, attrSpaces);
            }));
        }
        selector.push(']');
        selector.push(this.rawSpaceAfter);
        return selector.join('');
    }
}
Attribute.NO_QUOTE = null;
Attribute.SINGLE_QUOTE = "'";
Attribute.DOUBLE_QUOTE = '"';
const CSSESC_QUOTE_OPTIONS = {
    "'": { quotes: 'single', wrap: true },
    '"': { quotes: 'double', wrap: true },
    [null]: { isIdentifier: true },
};
function defaultAttrConcat(attrValue, attrSpaces) {
    return `${attrSpaces.before}${attrValue}${attrSpaces.after}`;
}

class Universal extends Namespace {
    constructor(opts) {
        super(opts);
        this.type = UNIVERSAL;
        this.value = '*';
    }
}

class Combinator extends Node {
    constructor(opts) {
        super(opts);
        this.type = COMBINATOR;
    }
}

class Nesting extends Node {
    constructor(opts) {
        super(opts);
        this.type = NESTING;
        this.value = '&';
    }
}

function sortAscending(list) {
    return list.sort((a, b) => a - b);
}

const ampersand = 38; // `&`.charCodeAt(0);
const asterisk = 42; // `*`.charCodeAt(0);
const comma = 44; // `,`.charCodeAt(0);
const colon = 58; // `:`.charCodeAt(0);
const semicolon = 59; // `;`.charCodeAt(0);
const openParenthesis = 40; // `(`.charCodeAt(0);
const closeParenthesis = 41; // `)`.charCodeAt(0);
const openSquare = 91; // `[`.charCodeAt(0);
const closeSquare = 93; // `]`.charCodeAt(0);
const dollar = 36; // `$`.charCodeAt(0);
const tilde = 126; // `~`.charCodeAt(0);
const caret = 94; // `^`.charCodeAt(0);
const plus = 43; // `+`.charCodeAt(0);
const equals = 61; // `=`.charCodeAt(0);
const pipe = 124; // `|`.charCodeAt(0);
const greaterThan = 62; // `>`.charCodeAt(0);
const space = 32; // ` `.charCodeAt(0);
const singleQuote = 39; // `'`.charCodeAt(0);
const doubleQuote = 34; // `"`.charCodeAt(0);
const slash = 47; // `/`.charCodeAt(0);
const bang = 33; // `!`.charCodeAt(0);
const backslash = 92; // '\\'.charCodeAt(0);
const cr = 13; // '\r'.charCodeAt(0);
const feed = 12; // '\f'.charCodeAt(0);
const newline = 10; // '\n'.charCodeAt(0);
const tab = 9; // '\t'.charCodeAt(0);
// Expose aliases primarily for readability.
const str = singleQuote;
// No good single character representation!
const comment = -1;
const word = -2;
const combinator = -3;

const unescapable = {
    [tab]: true,
    [newline]: true,
    [cr]: true,
    [feed]: true,
};
const wordDelimiters = {
    [space]: true,
    [tab]: true,
    [newline]: true,
    [cr]: true,
    [feed]: true,
    [ampersand]: true,
    [asterisk]: true,
    [bang]: true,
    [comma]: true,
    [colon]: true,
    [semicolon]: true,
    [openParenthesis]: true,
    [closeParenthesis]: true,
    [openSquare]: true,
    [closeSquare]: true,
    [singleQuote]: true,
    [doubleQuote]: true,
    [plus]: true,
    [pipe]: true,
    [tilde]: true,
    [greaterThan]: true,
    [equals]: true,
    [dollar]: true,
    [caret]: true,
    [slash]: true,
};
const hex = {};
const hexChars = "0123456789abcdefABCDEF";
for (let i = 0; i < hexChars.length; i++) {
    hex[hexChars.charCodeAt(i)] = true;
}
/**
 *  Returns the last index of the bar css word
 * @param {string} css The string in which the word begins
 * @param {number} start The index into the string where word's first letter occurs
 */
function consumeWord(css, start) {
    let next = start;
    let code;
    do {
        code = css.charCodeAt(next);
        if (wordDelimiters[code]) {
            return next - 1;
        }
        else if (code === backslash) {
            next = consumeEscape(css, next) + 1;
        }
        else {
            // All other characters are part of the word
            next++;
        }
    } while (next < css.length);
    return next - 1;
}
/**
 *  Returns the last index of the escape sequence
 * @param {string} css The string in which the sequence begins
 * @param {number} start The index into the string where escape character (`\`) occurs.
 */
function consumeEscape(css, start) {
    let next = start;
    let code = css.charCodeAt(next + 1);
    if (unescapable[code]) ;
    else if (hex[code]) {
        let hexDigits = 0;
        // consume up to 6 hex chars
        do {
            next++;
            hexDigits++;
            code = css.charCodeAt(next + 1);
        } while (hex[code] && hexDigits < 6);
        // if fewer than 6 hex chars, a trailing space ends the escape
        if (hexDigits < 6 && code === space) {
            next++;
        }
    }
    else {
        // the next char is part of the current word
        next++;
    }
    return next;
}
const FIELDS = {
    TYPE: 0,
    START_LINE: 1,
    START_COL: 2,
    END_LINE: 3,
    END_COL: 4,
    START_POS: 5,
    END_POS: 6,
};
function tokenize(input) {
    const tokens = [];
    let css = input.css.valueOf();
    let { length } = css;
    let offset = -1;
    let line = 1;
    let start = 0;
    let end = 0;
    let code, content, endColumn, endLine, escaped, escapePos, last, lines, next, nextLine, nextOffset, quote, tokenType;
    function unclosed(what, fix) {
        if (input.safe) { // fyi: this is never set to true.
            css += fix;
            next = css.length - 1;
        }
        else {
            throw input.error('Unclosed ' + what, line, start - offset, start);
        }
    }
    while (start < length) {
        code = css.charCodeAt(start);
        if (code === newline) {
            offset = start;
            line += 1;
        }
        switch (code) {
            case space:
            case tab:
            case newline:
            case cr:
            case feed:
                next = start;
                do {
                    next += 1;
                    code = css.charCodeAt(next);
                    if (code === newline) {
                        offset = next;
                        line += 1;
                    }
                } while (code === space ||
                    code === newline ||
                    code === tab ||
                    code === cr ||
                    code === feed);
                tokenType = space;
                endLine = line;
                endColumn = next - offset - 1;
                end = next;
                break;
            case plus:
            case greaterThan:
            case tilde:
            case pipe:
                next = start;
                do {
                    next += 1;
                    code = css.charCodeAt(next);
                } while (code === plus ||
                    code === greaterThan ||
                    code === tilde ||
                    code === pipe);
                tokenType = combinator;
                endLine = line;
                endColumn = start - offset;
                end = next;
                break;
            // Consume these characters as single tokens.
            case asterisk:
            case ampersand:
            case bang:
            case comma:
            case equals:
            case dollar:
            case caret:
            case openSquare:
            case closeSquare:
            case colon:
            case semicolon:
            case openParenthesis:
            case closeParenthesis:
                next = start;
                tokenType = code;
                endLine = line;
                endColumn = start - offset;
                end = next + 1;
                break;
            case singleQuote:
            case doubleQuote:
                quote = code === singleQuote ? "'" : '"';
                next = start;
                do {
                    escaped = false;
                    next = css.indexOf(quote, next + 1);
                    if (next === -1) {
                        unclosed('quote', quote);
                    }
                    escapePos = next;
                    while (css.charCodeAt(escapePos - 1) === backslash) {
                        escapePos -= 1;
                        escaped = !escaped;
                    }
                } while (escaped);
                tokenType = str;
                endLine = line;
                endColumn = start - offset;
                end = next + 1;
                break;
            default:
                if (code === slash && css.charCodeAt(start + 1) === asterisk) {
                    next = css.indexOf('*/', start + 2) + 1;
                    if (next === 0) {
                        unclosed('comment', '*/');
                    }
                    content = css.slice(start, next + 1);
                    lines = content.split('\n');
                    last = lines.length - 1;
                    if (last > 0) {
                        nextLine = line + last;
                        nextOffset = next - lines[last].length;
                    }
                    else {
                        nextLine = line;
                        nextOffset = offset;
                    }
                    tokenType = comment;
                    line = nextLine;
                    endLine = nextLine;
                    endColumn = next - nextOffset;
                }
                else if (code === slash) {
                    next = start;
                    tokenType = code;
                    endLine = line;
                    endColumn = start - offset;
                    end = next + 1;
                }
                else {
                    next = consumeWord(css, start);
                    tokenType = word;
                    endLine = line;
                    endColumn = next - offset;
                }
                end = next + 1;
                break;
        }
        // Ensure that the token structure remains consistent
        tokens.push([
            tokenType,
            line,
            start - offset,
            endLine,
            endColumn,
            start,
            end,
        ]);
        // Reset offset for the next token
        if (nextOffset) {
            offset = nextOffset;
            nextOffset = null;
        }
        start = end;
    }
    return tokens;
}

function indexesOf(ary, item) {
    var i = -1, indexes = [];
    while ((i = ary.indexOf(item, i + 1)) !== -1)
        indexes.push(i);
    return indexes;
}
function uniq(list, compare, sorted) {
    function unique_eq(list) {
        var ptr = 1, len = list.length, a = list[0], b = list[0];
        for (var i = 1; i < len; ++i) {
            b = a;
            a = list[i];
            if (a !== b) {
                if (i === ptr) {
                    ptr++;
                    continue;
                }
                list[ptr++] = a;
            }
        }
        list.length = ptr;
        return list;
    }
    function unique_pred(list, compare) {
        var ptr = 1;
        var len = list.length;
        var a = list[0];
        var b = list[0];
        for (var i = 1; i < len; ++i) {
            b = a;
            a = list[i];
            if (compare(a, b)) {
                if (i === ptr) {
                    ptr++;
                    continue;
                }
                list[ptr++] = a;
            }
        }
        list.length = ptr;
        return list;
    }
    if (list.length === 0) {
        return list;
    }
    if (compare) {
        if (!sorted) {
            list.sort(compare);
        }
        return unique_pred(list, compare);
    }
    if (!sorted) {
        list.sort();
    }
    return unique_eq(list);
}
const WHITESPACE_TOKENS = {
    [space]: true,
    [cr]: true,
    [feed]: true,
    [newline]: true,
    [tab]: true,
};
const WHITESPACE_EQUIV_TOKENS = {
    ...WHITESPACE_TOKENS,
    [comment]: true,
};
function tokenStart(token) {
    return {
        line: token[FIELDS.START_LINE],
        column: token[FIELDS.START_COL],
    };
}
function tokenEnd(token) {
    return {
        line: token[FIELDS.END_LINE],
        column: token[FIELDS.END_COL],
    };
}
function getSource(startLine, startColumn, endLine, endColumn) {
    return {
        start: {
            line: startLine,
            column: startColumn,
        },
        end: {
            line: endLine,
            column: endColumn,
        },
    };
}
function getTokenSource(token) {
    return getSource(token[FIELDS.START_LINE], token[FIELDS.START_COL], token[FIELDS.END_LINE], token[FIELDS.END_COL]);
}
function getTokenSourceSpan(startToken, endToken) {
    if (!startToken) {
        return undefined;
    }
    return getSource(startToken[FIELDS.START_LINE], startToken[FIELDS.START_COL], endToken[FIELDS.END_LINE], endToken[FIELDS.END_COL]);
}
function unescapeProp(node, prop) {
    let value = node[prop];
    if (typeof value !== "string") {
        return;
    }
    if (value.indexOf("\\") !== -1) {
        ensureObject(node, 'raws');
        node[prop] = unesc(value);
        if (node.raws[prop] === undefined) {
            node.raws[prop] = value;
        }
    }
    return node;
}
class Parser {
    constructor(rule, options = {}) {
        this.rule = rule;
        this.options = Object.assign({ lossy: false, safe: false }, options);
        this.position = 0;
        this.css = typeof this.rule === 'string' ? this.rule : this.rule.selector;
        this.tokens = tokenize({
            css: this.css,
            error: this._errorGenerator(),
            safe: this.options.safe,
        });
        let rootSource = getTokenSourceSpan(this.tokens[0], this.tokens[this.tokens.length - 1]);
        this.root = new Root({ source: rootSource });
        this.root.errorGenerator = this._errorGenerator();
        const selector = new Selector({ source: { start: { line: 1, column: 1 } } });
        this.root.append(selector);
        this.current = selector;
        this.loop();
    }
    _errorGenerator() {
        return (message, errorOptions) => {
            if (typeof this.rule === 'string') {
                return new Error(message);
            }
            return this.rule.error(message, errorOptions);
        };
    }
    attribute() {
        const attr = [];
        const startingToken = this.currToken;
        this.position++;
        while (this.position < this.tokens.length &&
            this.currToken[FIELDS.TYPE] !== closeSquare) {
            attr.push(this.currToken);
            this.position++;
        }
        if (this.currToken[FIELDS.TYPE] !== closeSquare) {
            return this.expected('closing square bracket', this.currToken[FIELDS.START_POS]);
        }
        const len = attr.length;
        const node = {
            source: getSource(startingToken[1], startingToken[2], this.currToken[3], this.currToken[4]),
            sourceIndex: startingToken[FIELDS.START_POS],
        };
        if (len === 1 && !~[word].indexOf(attr[0][FIELDS.TYPE])) {
            return this.expected('attribute', attr[0][FIELDS.START_POS]);
        }
        let pos = 0;
        let spaceBefore = '';
        let commentBefore = '';
        let lastAdded = null;
        let spaceAfterMeaningfulToken = false;
        while (pos < len) {
            const token = attr[pos];
            const content = this.content(token);
            const next = attr[pos + 1];
            switch (token[FIELDS.TYPE]) {
                case space:
                    // if (
                    //     len === 1 ||
                    //     pos === 0 && this.content(next) === '|'
                    // ) {
                    //     return this.expected('attribute', token[TOKEN.START_POS], content);
                    // }
                    spaceAfterMeaningfulToken = true;
                    if (this.options.lossy) {
                        break;
                    }
                    if (lastAdded) {
                        ensureObject(node, 'spaces', lastAdded);
                        const prevContent = node.spaces[lastAdded].after || '';
                        node.spaces[lastAdded].after = prevContent + content;
                        const existingComment = getProp(node, 'raws', 'spaces', lastAdded, 'after') || null;
                        if (existingComment) {
                            node.raws.spaces[lastAdded].after = existingComment + content;
                        }
                    }
                    else {
                        spaceBefore = spaceBefore + content;
                        commentBefore = commentBefore + content;
                    }
                    break;
                case asterisk:
                    if (next[FIELDS.TYPE] === equals) {
                        node.operator = content;
                        lastAdded = 'operator';
                    }
                    else if ((!node.namespace || (lastAdded === "namespace" && !spaceAfterMeaningfulToken)) && next) {
                        if (spaceBefore) {
                            ensureObject(node, 'spaces', 'attribute');
                            node.spaces.attribute.before = spaceBefore;
                            spaceBefore = '';
                        }
                        if (commentBefore) {
                            ensureObject(node, 'raws', 'spaces', 'attribute');
                            node.raws.spaces.attribute.before = spaceBefore;
                            commentBefore = '';
                        }
                        node.namespace = (node.namespace || "") + content;
                        const rawValue = getProp(node, 'raws', 'namespace') || null;
                        if (rawValue) {
                            node.raws.namespace += content;
                        }
                        lastAdded = 'namespace';
                    }
                    spaceAfterMeaningfulToken = false;
                    break;
                case dollar:
                    if (lastAdded === "value") {
                        let oldRawValue = getProp(node, 'raws', 'value');
                        node.value += "$";
                        if (oldRawValue) {
                            node.raws.value = oldRawValue + "$";
                        }
                        break;
                    }
                // Falls through
                case caret:
                    if (next[FIELDS.TYPE] === equals) {
                        node.operator = content;
                        lastAdded = 'operator';
                    }
                    spaceAfterMeaningfulToken = false;
                    break;
                case combinator:
                    if (content === '~' && next[FIELDS.TYPE] === equals) {
                        node.operator = content;
                        lastAdded = 'operator';
                    }
                    if (content !== '|') {
                        spaceAfterMeaningfulToken = false;
                        break;
                    }
                    if (next[FIELDS.TYPE] === equals) {
                        node.operator = content;
                        lastAdded = 'operator';
                    }
                    else if (!node.namespace && !node.attribute) {
                        node.namespace = true;
                    }
                    spaceAfterMeaningfulToken = false;
                    break;
                case word:
                    if (next &&
                        this.content(next) === '|' &&
                        (attr[pos + 2] && attr[pos + 2][FIELDS.TYPE] !== equals) && // this look-ahead probably fails with comment nodes involved.
                        !node.operator &&
                        !node.namespace) {
                        node.namespace = content;
                        lastAdded = 'namespace';
                    }
                    else if (!node.attribute || (lastAdded === "attribute" && !spaceAfterMeaningfulToken)) {
                        if (spaceBefore) {
                            ensureObject(node, 'spaces', 'attribute');
                            node.spaces.attribute.before = spaceBefore;
                            spaceBefore = '';
                        }
                        if (commentBefore) {
                            ensureObject(node, 'raws', 'spaces', 'attribute');
                            node.raws.spaces.attribute.before = commentBefore;
                            commentBefore = '';
                        }
                        node.attribute = (node.attribute || "") + content;
                        const rawValue = getProp(node, 'raws', 'attribute') || null;
                        if (rawValue) {
                            node.raws.attribute += content;
                        }
                        lastAdded = 'attribute';
                    }
                    else if ((!node.value && node.value !== "") || (lastAdded === "value" && !spaceAfterMeaningfulToken)) {
                        let unescaped = unesc(content);
                        let oldRawValue = getProp(node, 'raws', 'value') || '';
                        let oldValue = node.value || '';
                        node.value = oldValue + unescaped;
                        node.quoteMark = null;
                        if (unescaped !== content || oldRawValue) {
                            ensureObject(node, 'raws');
                            node.raws.value = (oldRawValue || oldValue) + content;
                        }
                        lastAdded = 'value';
                    }
                    else {
                        let insensitive = (content === 'i' || content === "I");
                        if ((node.value || node.value === '') && (node.quoteMark || spaceAfterMeaningfulToken)) {
                            node.insensitive = insensitive;
                            if (!insensitive || content === "I") {
                                ensureObject(node, 'raws');
                                node.raws.insensitiveFlag = content;
                            }
                            lastAdded = 'insensitive';
                            if (spaceBefore) {
                                ensureObject(node, 'spaces', 'insensitive');
                                node.spaces.insensitive.before = spaceBefore;
                                spaceBefore = '';
                            }
                            if (commentBefore) {
                                ensureObject(node, 'raws', 'spaces', 'insensitive');
                                node.raws.spaces.insensitive.before = commentBefore;
                                commentBefore = '';
                            }
                        }
                        else if (node.value || node.value === '') {
                            lastAdded = 'value';
                            node.value += content;
                            if (node.raws.value) {
                                node.raws.value += content;
                            }
                        }
                    }
                    spaceAfterMeaningfulToken = false;
                    break;
                case str:
                    if (!node.attribute || !node.operator) {
                        return this.error(`Expected an attribute followed by an operator preceding the string.`, {
                            index: token[FIELDS.START_POS],
                        });
                    }
                    let { unescaped, quoteMark } = unescapeValue(content);
                    node.value = unescaped;
                    node.quoteMark = quoteMark;
                    lastAdded = 'value';
                    ensureObject(node, 'raws');
                    node.raws.value = content;
                    spaceAfterMeaningfulToken = false;
                    break;
                case equals:
                    if (!node.attribute) {
                        return this.expected('attribute', token[FIELDS.START_POS], content);
                    }
                    if (node.value) {
                        return this.error('Unexpected "=" found; an operator was already defined.', { index: token[FIELDS.START_POS] });
                    }
                    node.operator = node.operator ? node.operator + content : content;
                    lastAdded = 'operator';
                    spaceAfterMeaningfulToken = false;
                    break;
                case comment:
                    if (lastAdded) {
                        if (spaceAfterMeaningfulToken || (next && next[FIELDS.TYPE] === space) ||
                            lastAdded === 'insensitive') {
                            const lastComment = getProp(node, 'spaces', lastAdded, 'after') || '';
                            const rawLastComment = getProp(node, 'raws', 'spaces', lastAdded, 'after') || lastComment;
                            ensureObject(node, 'raws', 'spaces', lastAdded);
                            node.raws.spaces[lastAdded].after = rawLastComment + content;
                        }
                        else {
                            const lastValue = node[lastAdded] || '';
                            const rawLastValue = getProp(node, 'raws', lastAdded) || lastValue;
                            ensureObject(node, 'raws');
                            node.raws[lastAdded] = rawLastValue + content;
                        }
                    }
                    else {
                        commentBefore = commentBefore + content;
                    }
                    break;
                default:
                    return this.error(`Unexpected "${content}" found.`, { index: token[FIELDS.START_POS] });
            }
            pos++;
        }
        unescapeProp(node, "attribute");
        unescapeProp(node, "namespace");
        this.newNode(new Attribute(node));
        this.position++;
    }
    /**
     * return a node containing meaningless garbage up to (but not including) the specified token position.
     * if the token position is negative, all remaining tokens are consumed.
     *
     * This returns an array containing a single string node if all whitespace,
     * otherwise an array of comment nodes with space before and after.
     *
     * These tokens are not added to the current selector, the caller can add them or use them to amend
     * a previous node's space metadata.
     *
     * In lossy mode, this returns only comments.
     */
    parseWhitespaceEquivalentTokens(stopPosition) {
        if (stopPosition < 0) {
            stopPosition = this.tokens.length;
        }
        let startPosition = this.position;
        let nodes = [];
        let space = "";
        let lastComment = undefined;
        do {
            if (WHITESPACE_TOKENS[this.currToken[FIELDS.TYPE]]) {
                if (!this.options.lossy) {
                    space += this.content();
                }
            }
            else if (this.currToken[FIELDS.TYPE] === comment) {
                let spaces = {};
                if (space) {
                    spaces.before = space;
                    space = "";
                }
                lastComment = new Comment({
                    value: this.content(),
                    source: getTokenSource(this.currToken),
                    sourceIndex: this.currToken[FIELDS.START_POS],
                    spaces,
                });
                nodes.push(lastComment);
            }
        } while (++this.position < stopPosition);
        if (space) {
            if (lastComment) {
                lastComment.spaces.after = space;
            }
            else if (!this.options.lossy) {
                let firstToken = this.tokens[startPosition];
                let lastToken = this.tokens[this.position - 1];
                nodes.push(new String$1({
                    value: '',
                    source: getSource(firstToken[FIELDS.START_LINE], firstToken[FIELDS.START_COL], lastToken[FIELDS.END_LINE], lastToken[FIELDS.END_COL]),
                    sourceIndex: firstToken[FIELDS.START_POS],
                    spaces: { before: space, after: '' },
                }));
            }
        }
        return nodes;
    }
    /**
     *
     * @param {*} nodes
     */
    convertWhitespaceNodesToSpace(nodes, requiredSpace = false) {
        let space = "";
        let rawSpace = "";
        nodes.forEach(n => {
            let spaceBefore = this.lossySpace(n.spaces.before, requiredSpace);
            let rawSpaceBefore = this.lossySpace(n.rawSpaceBefore, requiredSpace);
            space += spaceBefore + this.lossySpace(n.spaces.after, requiredSpace && spaceBefore.length === 0);
            rawSpace += spaceBefore + n.value + this.lossySpace(n.rawSpaceAfter, requiredSpace && rawSpaceBefore.length === 0);
        });
        if (rawSpace === space) {
            rawSpace = undefined;
        }
        let result = { space, rawSpace };
        return result;
    }
    isNamedCombinator(position = this.position) {
        return this.tokens[position + 0] && this.tokens[position + 0][FIELDS.TYPE] === slash &&
            this.tokens[position + 1] && this.tokens[position + 1][FIELDS.TYPE] === word &&
            this.tokens[position + 2] && this.tokens[position + 2][FIELDS.TYPE] === slash;
    }
    namedCombinator() {
        if (this.isNamedCombinator()) {
            let nameRaw = this.content(this.tokens[this.position + 1]);
            let name = unesc(nameRaw).toLowerCase();
            let raws = {};
            if (name !== nameRaw) {
                raws.value = `/${nameRaw}/`;
            }
            let node = new Combinator({
                value: `/${name}/`,
                source: getSource(this.currToken[FIELDS.START_LINE], this.currToken[FIELDS.START_COL], this.tokens[this.position + 2][FIELDS.END_LINE], this.tokens[this.position + 2][FIELDS.END_COL]),
                sourceIndex: this.currToken[FIELDS.START_POS],
                raws,
            });
            this.position = this.position + 3;
            return node;
        }
        else {
            this.unexpected();
        }
    }
    combinator() {
        if (this.content() === '|') {
            return this.namespace();
        }
        // We need to decide between a space that's a descendant combinator and meaningless whitespace at the end of a selector.
        let nextSigTokenPos = this.locateNextMeaningfulToken(this.position);
        if (nextSigTokenPos < 0 || this.tokens[nextSigTokenPos][FIELDS.TYPE] === comma) {
            let nodes = this.parseWhitespaceEquivalentTokens(nextSigTokenPos);
            if (nodes.length > 0) {
                let last = this.current.last;
                if (last) {
                    let { space, rawSpace } = this.convertWhitespaceNodesToSpace(nodes);
                    if (rawSpace !== undefined) {
                        last.rawSpaceAfter += rawSpace;
                    }
                    last.spaces.after += space;
                }
                else {
                    nodes.forEach(n => this.newNode(n));
                }
            }
            return;
        }
        let firstToken = this.currToken;
        let spaceOrDescendantSelectorNodes = undefined;
        if (nextSigTokenPos > this.position) {
            spaceOrDescendantSelectorNodes = this.parseWhitespaceEquivalentTokens(nextSigTokenPos);
        }
        let node;
        if (this.isNamedCombinator()) {
            node = this.namedCombinator();
        }
        else if (this.currToken[FIELDS.TYPE] === combinator) {
            node = new Combinator({
                value: this.content(),
                source: getTokenSource(this.currToken),
                sourceIndex: this.currToken[FIELDS.START_POS],
            });
            this.position++;
        }
        else if (WHITESPACE_TOKENS[this.currToken[FIELDS.TYPE]]) ;
        else if (!spaceOrDescendantSelectorNodes) {
            this.unexpected();
        }
        if (node) {
            if (spaceOrDescendantSelectorNodes) {
                let { space, rawSpace } = this.convertWhitespaceNodesToSpace(spaceOrDescendantSelectorNodes);
                node.spaces.before = space;
                node.rawSpaceBefore = rawSpace;
            }
        }
        else {
            // descendant combinator
            let { space, rawSpace } = this.convertWhitespaceNodesToSpace(spaceOrDescendantSelectorNodes, true);
            if (!rawSpace) {
                rawSpace = space;
            }
            let spaces = {};
            let raws = { spaces: {} };
            if (space.endsWith(' ') && rawSpace.endsWith(' ')) {
                spaces.before = space.slice(0, space.length - 1);
                raws.spaces.before = rawSpace.slice(0, rawSpace.length - 1);
            }
            else if (space.startsWith(' ') && rawSpace.startsWith(' ')) {
                spaces.after = space.slice(1);
                raws.spaces.after = rawSpace.slice(1);
            }
            else {
                raws.value = rawSpace;
            }
            node = new Combinator({
                value: ' ',
                source: getTokenSourceSpan(firstToken, this.tokens[this.position - 1]),
                sourceIndex: firstToken[FIELDS.START_POS],
                spaces,
                raws,
            });
        }
        if (this.currToken && this.currToken[FIELDS.TYPE] === space) {
            node.spaces.after = this.optionalSpace(this.content());
            this.position++;
        }
        return this.newNode(node);
    }
    comma() {
        if (this.position === this.tokens.length - 1) {
            this.root.trailingComma = true;
            this.position++;
            return;
        }
        this.current._inferEndPosition();
        const selector = new Selector({ source: { start: tokenStart(this.tokens[this.position + 1]) } });
        this.current.parent.append(selector);
        this.current = selector;
        this.position++;
    }
    comment() {
        const current = this.currToken;
        this.newNode(new Comment({
            value: this.content(),
            source: getTokenSource(current),
            sourceIndex: current[FIELDS.START_POS],
        }));
        this.position++;
    }
    error(message, opts) {
        throw this.root.error(message, opts);
    }
    missingBackslash() {
        return this.error('Expected a backslash preceding the semicolon.', {
            index: this.currToken[FIELDS.START_POS],
        });
    }
    missingParenthesis() {
        return this.expected('opening parenthesis', this.currToken[FIELDS.START_POS]);
    }
    missingSquareBracket() {
        return this.expected('opening square bracket', this.currToken[FIELDS.START_POS]);
    }
    unexpected() {
        return this.error(`Unexpected '${this.content()}'. Escaping special characters with \\ may help.`, this.currToken[FIELDS.START_POS]);
    }
    namespace() {
        const before = this.prevToken && this.content(this.prevToken) || true;
        if (this.nextToken[FIELDS.TYPE] === word) {
            this.position++;
            return this.word(before);
        }
        else if (this.nextToken[FIELDS.TYPE] === asterisk) {
            this.position++;
            return this.universal(before);
        }
    }
    nesting() {
        if (this.nextToken) {
            let nextContent = this.content(this.nextToken);
            if (nextContent === "|") {
                this.position++;
                return;
            }
        }
        const current = this.currToken;
        this.newNode(new Nesting({
            value: this.content(),
            source: getTokenSource(current),
            sourceIndex: current[FIELDS.START_POS],
        }));
        this.position++;
    }
    parentheses() {
        let last = this.current.last;
        let unbalanced = 1;
        this.position++;
        if (last && last.type === PSEUDO) {
            const selector = new Selector({ source: { start: tokenStart(this.tokens[this.position - 1]) } });
            const cache = this.current;
            last.append(selector);
            this.current = selector;
            while (this.position < this.tokens.length && unbalanced) {
                if (this.currToken[FIELDS.TYPE] === openParenthesis) {
                    unbalanced++;
                }
                if (this.currToken[FIELDS.TYPE] === closeParenthesis) {
                    unbalanced--;
                }
                if (unbalanced) {
                    this.parse();
                }
                else {
                    this.current.source.end = tokenEnd(this.currToken);
                    this.current.parent.source.end = tokenEnd(this.currToken);
                    this.position++;
                }
            }
            this.current = cache;
        }
        else {
            // I think this case should be an error. It's used to implement a basic parse of media queries
            // but I don't think it's a good idea.
            let parenStart = this.currToken;
            let parenValue = "(";
            let parenEnd;
            while (this.position < this.tokens.length && unbalanced) {
                if (this.currToken[FIELDS.TYPE] === openParenthesis) {
                    unbalanced++;
                }
                if (this.currToken[FIELDS.TYPE] === closeParenthesis) {
                    unbalanced--;
                }
                parenEnd = this.currToken;
                parenValue += this.parseParenthesisToken(this.currToken);
                this.position++;
            }
            if (last) {
                last.appendToPropertyAndEscape("value", parenValue, parenValue);
            }
            else {
                this.newNode(new String$1({
                    value: parenValue,
                    source: getSource(parenStart[FIELDS.START_LINE], parenStart[FIELDS.START_COL], parenEnd[FIELDS.END_LINE], parenEnd[FIELDS.END_COL]),
                    sourceIndex: parenStart[FIELDS.START_POS],
                }));
            }
        }
        if (unbalanced) {
            return this.expected('closing parenthesis', this.currToken[FIELDS.START_POS]);
        }
    }
    pseudo() {
        let pseudoStr = '';
        let startingToken = this.currToken;
        while (this.currToken && this.currToken[FIELDS.TYPE] === colon) {
            pseudoStr += this.content();
            this.position++;
        }
        if (!this.currToken) {
            return this.expected(['pseudo-class', 'pseudo-element'], this.position - 1);
        }
        if (this.currToken[FIELDS.TYPE] === word) {
            this.splitWord(false, (first, length) => {
                pseudoStr += first;
                this.newNode(new Pseudo({
                    value: pseudoStr,
                    source: getTokenSourceSpan(startingToken, this.currToken),
                    sourceIndex: startingToken[FIELDS.START_POS],
                }));
                if (length > 1 &&
                    this.nextToken &&
                    this.nextToken[FIELDS.TYPE] === openParenthesis) {
                    this.error('Misplaced parenthesis.', {
                        index: this.nextToken[FIELDS.START_POS],
                    });
                }
            });
        }
        else {
            return this.expected(['pseudo-class', 'pseudo-element'], this.currToken[FIELDS.START_POS]);
        }
    }
    space() {
        const content = this.content();
        // Handle space before and after the selector
        if (this.position === 0 ||
            this.prevToken[FIELDS.TYPE] === comma ||
            this.prevToken[FIELDS.TYPE] === openParenthesis ||
            (this.current.nodes.every((node) => node.type === 'comment'))) {
            this.spaces = this.optionalSpace(content);
            this.position++;
        }
        else if (this.position === (this.tokens.length - 1) ||
            this.nextToken[FIELDS.TYPE] === comma ||
            this.nextToken[FIELDS.TYPE] === closeParenthesis) {
            this.current.last.spaces.after = this.optionalSpace(content);
            this.position++;
        }
        else {
            this.combinator();
        }
    }
    string() {
        const current = this.currToken;
        this.newNode(new String$1({
            value: this.content(),
            source: getTokenSource(current),
            sourceIndex: current[FIELDS.START_POS],
        }));
        this.position++;
    }
    universal(namespace) {
        const nextToken = this.nextToken;
        if (nextToken && this.content(nextToken) === '|') {
            this.position++;
            return this.namespace();
        }
        const current = this.currToken;
        this.newNode(new Universal({
            value: this.content(),
            source: getTokenSource(current),
            sourceIndex: current[FIELDS.START_POS],
        }), namespace);
        this.position++;
    }
    splitWord(namespace, firstCallback) {
        let nextToken = this.nextToken;
        let word$1 = this.content();
        while (nextToken &&
            ~[dollar, caret, equals, word].indexOf(nextToken[FIELDS.TYPE])) {
            this.position++;
            let current = this.content();
            word$1 += current;
            if (current.lastIndexOf('\\') === current.length - 1) {
                let next = this.nextToken;
                if (next && next[FIELDS.TYPE] === space) {
                    word$1 += this.requiredSpace(this.content(next));
                    this.position++;
                }
            }
            nextToken = this.nextToken;
        }
        const hasClass = indexesOf(word$1, '.').filter(i => word$1[i - 1] !== '\\');
        let hasId = indexesOf(word$1, '#').filter(i => word$1[i - 1] !== '\\');
        // Eliminate Sass interpolations from the list of id indexes
        const interpolations = indexesOf(word$1, '#{');
        if (interpolations.length) {
            hasId = hasId.filter(hashIndex => !~interpolations.indexOf(hashIndex));
        }
        let indices = sortAscending(uniq([0, ...hasClass, ...hasId]));
        indices.forEach((ind, i) => {
            const index = indices[i + 1] || word$1.length;
            const value = word$1.slice(ind, index);
            if (i === 0 && firstCallback) {
                return firstCallback.call(this, value, indices.length);
            }
            let node;
            const current = this.currToken;
            const sourceIndex = current[FIELDS.START_POS] + indices[i];
            const source = getSource(current[1], current[2] + ind, current[3], current[2] + (index - 1));
            if (~hasClass.indexOf(ind)) {
                let classNameOpts = {
                    value: value.slice(1),
                    source,
                    sourceIndex,
                };
                node = new ClassName(unescapeProp(classNameOpts, "value"));
            }
            else if (~hasId.indexOf(ind)) {
                let idOpts = {
                    value: value.slice(1),
                    source,
                    sourceIndex,
                };
                node = new ID$1(unescapeProp(idOpts, "value"));
            }
            else {
                let tagOpts = {
                    value,
                    source,
                    sourceIndex,
                };
                unescapeProp(tagOpts, "value");
                node = new Tag(tagOpts);
            }
            this.newNode(node, namespace);
            // Ensure that the namespace is used only once
            namespace = null;
        });
        this.position++;
    }
    word(namespace) {
        const nextToken = this.nextToken;
        if (nextToken && this.content(nextToken) === '|') {
            this.position++;
            return this.namespace();
        }
        return this.splitWord(namespace);
    }
    loop() {
        while (this.position < this.tokens.length) {
            this.parse(true);
        }
        this.current._inferEndPosition();
        return this.root;
    }
    parse(throwOnParenthesis) {
        switch (this.currToken[FIELDS.TYPE]) {
            case space:
                this.space();
                break;
            case comment:
                this.comment();
                break;
            case openParenthesis:
                this.parentheses();
                break;
            case closeParenthesis:
                if (throwOnParenthesis) {
                    this.missingParenthesis();
                }
                break;
            case openSquare:
                this.attribute();
                break;
            case dollar:
            case caret:
            case equals:
            case word:
                this.word();
                break;
            case colon:
                this.pseudo();
                break;
            case comma:
                this.comma();
                break;
            case asterisk:
                this.universal();
                break;
            case ampersand:
                this.nesting();
                break;
            case slash:
            case combinator:
                this.combinator();
                break;
            case str:
                this.string();
                break;
            // These cases throw; no break needed.
            case closeSquare:
                this.missingSquareBracket();
            case semicolon:
                this.missingBackslash();
            default:
                this.unexpected();
        }
    }
    /**
     * Helpers
     */
    expected(description, index, found) {
        if (Array.isArray(description)) {
            const last = description.pop();
            description = `${description.join(', ')} or ${last}`;
        }
        const an = /^[aeiou]/.test(description[0]) ? 'an' : 'a';
        if (!found) {
            return this.error(`Expected ${an} ${description}.`, { index });
        }
        return this.error(`Expected ${an} ${description}, found "${found}" instead.`, { index });
    }
    requiredSpace(space) {
        return this.options.lossy ? ' ' : space;
    }
    optionalSpace(space) {
        return this.options.lossy ? '' : space;
    }
    lossySpace(space, required) {
        if (this.options.lossy) {
            return required ? ' ' : '';
        }
        else {
            return space;
        }
    }
    parseParenthesisToken(token) {
        const content = this.content(token);
        if (token[FIELDS.TYPE] === space) {
            return this.requiredSpace(content);
        }
        else {
            return content;
        }
    }
    newNode(node, namespace) {
        if (namespace) {
            if (/^ +$/.test(namespace)) {
                if (!this.options.lossy) {
                    this.spaces = (this.spaces || '') + namespace;
                }
                namespace = true;
            }
            node.namespace = namespace;
            unescapeProp(node, "namespace");
        }
        if (this.spaces) {
            node.spaces.before = this.spaces;
            this.spaces = '';
        }
        return this.current.append(node);
    }
    content(token = this.currToken) {
        return this.css.slice(token[FIELDS.START_POS], token[FIELDS.END_POS]);
    }
    get currToken() {
        return this.tokens[this.position];
    }
    get nextToken() {
        return this.tokens[this.position + 1];
    }
    get prevToken() {
        return this.tokens[this.position - 1];
    }
    /**
     * returns the index of the next non-whitespace, non-comment token.
     * returns -1 if no meaningful token is found.
     */
    locateNextMeaningfulToken(startPosition = this.position + 1) {
        let searchPosition = startPosition;
        while (searchPosition < this.tokens.length) {
            if (WHITESPACE_EQUIV_TOKENS[this.tokens[searchPosition][FIELDS.TYPE]]) {
                searchPosition++;
                continue;
            }
            else {
                return searchPosition;
            }
        }
        return -1;
    }
}

class Processor {
    constructor(func, options) {
        this.func = func || function noop() { };
        this.funcRes = null;
        this.options = options;
    }
    _shouldUpdateSelector(rule, options = {}) {
        let merged = Object.assign({}, this.options, options);
        if (merged.updateSelector === false) {
            return false;
        }
        else {
            return typeof rule !== "string";
        }
    }
    _isLossy(options = {}) {
        let merged = Object.assign({}, this.options, options);
        if (merged.lossless === false) {
            return true;
        }
        else {
            return false;
        }
    }
    _root(rule, options = {}) {
        let parser = new Parser(rule, this._parseOptions(options));
        return parser.root;
    }
    _parseOptions(options) {
        return {
            lossy: this._isLossy(options),
        };
    }
    _run(rule, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                let root = this._root(rule, options);
                Promise.resolve(this.func(root)).then(transform => {
                    let string = undefined;
                    if (this._shouldUpdateSelector(rule, options)) {
                        string = root.toString();
                        rule.selector = string;
                    }
                    return { transform, root, string };
                }).then(resolve, reject);
            }
            catch (e) {
                reject(e);
                return;
            }
        });
    }
    _runSync(rule, options = {}) {
        let root = this._root(rule, options);
        let transform = this.func(root);
        if (transform && typeof transform.then === "function") {
            throw new Error("Selector processor returned a promise to a synchronous call.");
        }
        let string = undefined;
        if (options.updateSelector && typeof rule !== "string") {
            string = root.toString();
            rule.selector = string;
        }
        return { transform, root, string };
    }
    /**
     * Process rule into a selector AST.
     *
     * @param rule {postcss.Rule | string} The css selector to be processed
     * @param options The options for processing
     * @returns {Promise<parser.Root>} The AST of the selector after processing it.
     */
    ast(rule, options) {
        return this._run(rule, options).then(result => result.root);
    }
    /**
     * Process rule into a selector AST synchronously.
     *
     * @param rule {postcss.Rule | string} The css selector to be processed
     * @param options The options for processing
     * @returns {parser.Root} The AST of the selector after processing it.
     */
    astSync(rule, options) {
        return this._runSync(rule, options).root;
    }
    /**
     * Process a selector into a transformed value asynchronously
     *
     * @param rule {postcss.Rule | string} The css selector to be processed
     * @param options The options for processing
     * @returns {Promise<any>} The value returned by the processor.
     */
    transform(rule, options) {
        return this._run(rule, options).then(result => result.transform);
    }
    /**
     * Process a selector into a transformed value synchronously.
     *
     * @param rule {postcss.Rule | string} The css selector to be processed
     * @param options The options for processing
     * @returns {any} The value returned by the processor.
     */
    transformSync(rule, options) {
        return this._runSync(rule, options).transform;
    }
    /**
     * Process a selector into a new selector string asynchronously.
     *
     * @param rule {postcss.Rule | string} The css selector to be processed
     * @param options The options for processing
     * @returns {string} the selector after processing.
     */
    process(rule, options) {
        return this._run(rule, options)
            .then((result) => result.string || result.root.toString());
    }
    /**
     * Process a selector into a new selector string synchronously.
     *
     * @param rule {postcss.Rule | string} The css selector to be processed
     * @param options The options for processing
     * @returns {string} the selector after processing.
     */
    processSync(rule, options) {
        let result = this._runSync(rule, options);
        return result.string || result.root.toString();
    }
}

const attribute = opts => new Attribute(opts);
const className = opts => new ClassName(opts);
const combinator$1 = opts => new Combinator(opts);
const comment$1 = opts => new Comment(opts);
const id = opts => new ID$1(opts);
const nesting = opts => new Nesting(opts);
const pseudo = opts => new Pseudo(opts);
const root = opts => new Root(opts);
const selector = opts => new Selector(opts);
const string = opts => new String$1(opts);
const tag = opts => new Tag(opts);
const universal = opts => new Universal(opts);

const IS_TYPE = {
    [ATTRIBUTE]: true,
    [CLASS]: true,
    [COMBINATOR]: true,
    [COMMENT]: true,
    [ID]: true,
    [NESTING]: true,
    [PSEUDO]: true,
    [ROOT]: true,
    [SELECTOR]: true,
    [STRING]: true,
    [TAG]: true,
    [UNIVERSAL]: true,
};
function isNode(node) {
    return (typeof node === "object" && IS_TYPE[node.type]);
}
function isNodeType(type, node) {
    return isNode(node) && node.type === type;
}
const isAttribute = isNodeType.bind(null, ATTRIBUTE);
const isClassName = isNodeType.bind(null, CLASS);
const isCombinator = isNodeType.bind(null, COMBINATOR);
const isComment = isNodeType.bind(null, COMMENT);
const isIdentifier = isNodeType.bind(null, ID);
const isNesting = isNodeType.bind(null, NESTING);
const isPseudo = isNodeType.bind(null, PSEUDO);
const isRoot = isNodeType.bind(null, ROOT);
const isSelector = isNodeType.bind(null, SELECTOR);
const isString = isNodeType.bind(null, STRING);
const isTag = isNodeType.bind(null, TAG);
const isUniversal = isNodeType.bind(null, UNIVERSAL);
function isPseudoElement(node) {
    return isPseudo(node)
        && node.value
        && (node.value.startsWith("::")
            || node.value.toLowerCase() === ":before"
            || node.value.toLowerCase() === ":after");
}
function isPseudoClass(node) {
    return isPseudo(node) && !isPseudoElement(node);
}
function isContainer(node) {
    return !!(isNode(node) && node.walk);
}
function isNamespace(node) {
    return isAttribute(node) || isTag(node);
}



var selectors = /*#__PURE__*/Object.freeze({
    TAG: TAG,
    STRING: STRING,
    SELECTOR: SELECTOR,
    ROOT: ROOT,
    PSEUDO: PSEUDO,
    NESTING: NESTING,
    ID: ID,
    COMMENT: COMMENT,
    COMBINATOR: COMBINATOR,
    CLASS: CLASS,
    ATTRIBUTE: ATTRIBUTE,
    UNIVERSAL: UNIVERSAL,
    attribute: attribute,
    className: className,
    combinator: combinator$1,
    comment: comment$1,
    id: id,
    nesting: nesting,
    pseudo: pseudo,
    root: root,
    selector: selector,
    string: string,
    tag: tag,
    universal: universal,
    isNode: isNode,
    isAttribute: isAttribute,
    isClassName: isClassName,
    isCombinator: isCombinator,
    isComment: isComment,
    isIdentifier: isIdentifier,
    isNesting: isNesting,
    isPseudo: isPseudo,
    isRoot: isRoot,
    isSelector: isSelector,
    isString: isString,
    isTag: isTag,
    isUniversal: isUniversal,
    isPseudoElement: isPseudoElement,
    isPseudoClass: isPseudoClass,
    isContainer: isContainer,
    isNamespace: isNamespace
});

const parser = processor => new Processor(processor);
Object.assign(parser, selectors);

export default parser;

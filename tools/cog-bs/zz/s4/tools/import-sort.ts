import * as typescript from "typescript";
//import {dirname} from "path";
//import * as resolve from "resolve";
import path from 'path'
import globby from 'globby'
//import isNodeModulePredicate = require("is-builtin-module");
import MOD from 'module'
import { readFileSync, writeFileSync } from "fs";
const isNodeModulePredicate = v => MOD.builtinModules.includes(v)

function detectNewline (str:string) {
	if (typeof str !== 'string') {throw new TypeError('Expected a string')}

	var newlines = (str.match(/(?:\r?\n)/g) || []);

	if (newlines.length === 0) {return null}

	var crlf = newlines.filter((el) => el === '\r\n').length;
	var lf = (newlines.length - crlf);

	return crlf > lf ? '\r\n' : '\n';
};

function detectNewlineGraceful(str) {
	return detectNewline(str) || '\n';
};





export interface IStyleAPI {
  member: ISelectorFunction;

  // firstNamedMember: ISelectorFunction;
  // defaultMember: ISelectorFunction;
  // namespaceMember: ISelectorFunction;

  moduleName: ISelectorFunction;

  name: INamedMemberSelectorFunction;
  alias: INamedMemberSelectorFunction;

  always: IMatcherFunction;
  not: (matcher: IMatcherFunction) => IMatcherFunction;

  and: (...matcher: IMatcherFunction[]) => IMatcherFunction;
  or: (...matcher: IMatcherFunction[]) => IMatcherFunction;

  hasNoMember: IMatcherFunction;
  hasMember: IMatcherFunction;

  hasDefaultMember: IMatcherFunction;
  hasNamespaceMember: IMatcherFunction;
  hasNamedMembers: IMatcherFunction;

  hasOnlyDefaultMember: IMatcherFunction;
  hasOnlyNamespaceMember: IMatcherFunction;
  hasOnlyNamedMembers: IMatcherFunction;

  hasMultipleMembers: IMatcherFunction;
  hasSingleMember: IMatcherFunction;

  isNodeModule: IMatcherFunction;
  isRelativeModule: IMatcherFunction;
  isAbsoluteModule: IMatcherFunction;
  isScopedModule: IMatcherFunction;
  isInstalledModule(baseFile: string): IMatcherFunction;

  startsWithUpperCase: IPredicateFunction;
  startsWithLowerCase: IPredicateFunction;
  startsWithAlphanumeric: IPredicateFunction;

  startsWith(...prefixes: string[]): IPredicateFunction;

  // reverse: (sorter: ISorterFunction) => ISorterFunction;
  naturally: IComparatorFunction;
  unicode: IComparatorFunction;
  dotSegmentCount: ISorterFunction;
}

export interface IMatcherFunction {
  (i: IImport): boolean;
}

export interface ISorterFunction {
  (i1: IImport, i2: IImport): number;
}

export interface INamedMemberSorterFunction {
  (n1: NamedMember, n2: NamedMember): number;
}

export interface ISelectorFunction {
  (f: IPredicateFunction): IMatcherFunction;
  (c: IComparatorFunction): ISorterFunction;
}

export interface INamedMemberSelectorFunction {
  (c: IComparatorFunction): INamedMemberSorterFunction;
}

export interface IPredicateFunction {
  (s: string): boolean;
}

export interface IComparatorFunction {
  (s1: string, s2: string): number;
}

export interface IStyleItem {
  match?: IMatcherFunction;

  sort?: ISorterFunction | ISorterFunction[];
  sortNamedMembers?: INamedMemberSorterFunction | INamedMemberSorterFunction[];

  separator?: boolean;
}

export interface IStyle {
  (styleApi: IStyleAPI, file?: string, options?: object): IStyleItem[];
}

function member(predicate: IPredicateFunction): IMatcherFunction;
function member(comparator: IComparatorFunction): ISorterFunction;
function member(
  predicateOrComparator: IPredicateFunction | IComparatorFunction,
): IMatcherFunction | ISorterFunction {
  // tslint:disable-next-line
  if ((predicateOrComparator as Function).length === 1) {
    const predicate = predicateOrComparator as IPredicateFunction;

    return (imported: IImport): boolean => {
      const importMember =
        imported.defaultMember ||
        imported.namespaceMember ||
        imported.namedMembers[0].alias;
      return predicate(importMember);
    };
  }
  const comparator = predicateOrComparator as IComparatorFunction;

  return (firstImport: IImport, secondImport: IImport): number => {
    const first =
      firstImport.defaultMember ||
      firstImport.namespaceMember ||
      firstImport.namedMembers[0].alias;
    const second =
      secondImport.defaultMember ||
      secondImport.namespaceMember ||
      secondImport.namedMembers[0].alias;

    return comparator(first, second);
  };
}

function moduleName(predicate: IPredicateFunction): IMatcherFunction;
function moduleName(comparator: IComparatorFunction): ISorterFunction;
function moduleName(
  predicateOrComparator: IPredicateFunction | IComparatorFunction,
): IMatcherFunction | ISorterFunction {
  // tslint:disable-next-line
  if ((predicateOrComparator as Function).length === 1) {
    const predicate = predicateOrComparator as IPredicateFunction;

    return (imported: IImport): boolean => {
      const importMember = imported.moduleName;
      return predicate(importMember);
    };
  }
  const comparator = predicateOrComparator as IComparatorFunction;

  return (firstImport: IImport, secondImport: IImport): number => {
    const first = firstImport.moduleName;
    const second = secondImport.moduleName;

    return comparator(first, second);
  };
}

function name(comparator: IComparatorFunction): INamedMemberSorterFunction {
  return (firstNamedMember, secondNamedMember) => {
    return comparator(firstNamedMember.name, secondNamedMember.name);
  };
}

function alias(comparator: IComparatorFunction): INamedMemberSorterFunction {
  return (firstNamedMember, secondNamedMember) => {
    return comparator(firstNamedMember.alias, secondNamedMember.alias);
  };
}

function always() {
  return true;
}

function not(matcher: IMatcherFunction): IMatcherFunction {
  return imported => {
    return !matcher(imported);
  };
}

function and(...matchers: IMatcherFunction[]): IMatcherFunction {
  return imported => {
    return matchers.every(matcher => matcher(imported));
  };
}

function or(...matchers: IMatcherFunction[]): IMatcherFunction {
  return imported => {
    return matchers.some(matcher => matcher(imported));
  };
}

function hasDefaultMember(imported: IImport): boolean {
  return !!imported.defaultMember;
}

function hasNamespaceMember(imported: IImport): boolean {
  return !!imported.namespaceMember;
}

function hasNamedMembers(imported: IImport): boolean {
  return imported.namedMembers.length > 0;
}

function hasMember(imported: IImport): boolean {
  return (
    hasDefaultMember(imported) ||
    hasNamespaceMember(imported) ||
    hasNamedMembers(imported)
  );
}

function hasNoMember(imported: IImport): boolean {
  return !hasMember(imported);
}

function hasOnlyDefaultMember(imported: IImport): boolean {
  return (
    hasDefaultMember(imported) &&
    !hasNamespaceMember(imported) &&
    !hasNamedMembers(imported)
  );
}

function hasOnlyNamespaceMember(imported: IImport): boolean {
  return (
    !hasDefaultMember(imported) &&
    hasNamespaceMember(imported) &&
    !hasNamedMembers(imported)
  );
}

function hasOnlyNamedMembers(imported: IImport): boolean {
  return (
    !hasDefaultMember(imported) &&
    !hasNamespaceMember(imported) &&
    hasNamedMembers(imported)
  );
}

function hasMultipleMembers(imported): boolean {
  return (
    imported.namedMembers.length +
      (imported.defaultMember ? 1 : 0) +
      (imported.namespaceMember ? 1 : 0) >
    1
  );
}

function hasSingleMember(imported): boolean {
  return (
    imported.namedMembers.length + (imported.defaultMember ? 1 : 0) === 1 &&
    !hasNamespaceMember(imported)
  );
}

function isNodeModule(imported: IImport): boolean {
  return isNodeModulePredicate(imported.moduleName);
}

function isRelativeModule(imported: IImport): boolean {
  return imported.moduleName.indexOf(".") === 0;
}

function isAbsoluteModule(imported: IImport): boolean {
  return !isRelativeModule(imported);
}

function isInstalledModule(baseFile: string): IMatcherFunction {
  return (imported: IImport) => {
    try {
      const resolvePath = path.resolve(imported.moduleName)

      //const resolvePath = resolve.sync(imported.moduleName, {basedir: dirname(baseFile)});

      return resolvePath.includes("node_modules");
    } catch (e) {
      return false;
    }
  };
}

function isScopedModule(imported: IImport): boolean {
  return imported.moduleName.startsWith("@");
}

function startsWithUpperCase(text: string): boolean {
  const start = text.charAt(0);
  return text.charAt(0) === start.toUpperCase();
}

function startsWithLowerCase(text: string): boolean {
  const start = text.charAt(0);
  return text.charAt(0) === start.toLowerCase();
}

function startsWithAlphanumeric(text: string): boolean {
  return !!text.match(/^[A-Za-z0-9]/);
}

function startsWith(...prefixes: string[]) {
  return text => {
    return prefixes.some(prefix => text.startsWith(prefix));
  };
}

function naturally(first: string, second: string): number {
  return first.localeCompare(second, "en");
}

function unicode(first: string, second: string): number {
  if (first < second) {
    return -1;
  }

  if (first > second) {
    return 1;
  }

  return 0;
}

function dotSegmentCount(firstImport: IImport, secondImport: IImport): number {
  const regex = /\.+(?=\/)/g;

  const firstCount = (firstImport.moduleName.match(regex) || []).join("")
    .length;
  const secondCount = (secondImport.moduleName.match(regex) || []).join("")
    .length;

  if (firstCount > secondCount) {
    return -1;
  }

  if (firstCount < secondCount) {
    return 1;
  }

  return 0;
}

const StyleAPI: IStyleAPI = {
  member,

  moduleName,

  name,
  alias,

  always,
  not,
  and,
  or,

  hasMember,
  hasNoMember,

  hasNamespaceMember,
  hasDefaultMember,
  hasNamedMembers,

  hasOnlyDefaultMember,
  hasOnlyNamespaceMember,
  hasOnlyNamedMembers,

  hasMultipleMembers,
  hasSingleMember,

  isNodeModule,
  isRelativeModule,
  isAbsoluteModule,
  isScopedModule,
  isInstalledModule,

  startsWithUpperCase,
  startsWithLowerCase,
  startsWithAlphanumeric,

  startsWith,

  naturally,
  unicode,
  dotSegmentCount,
};

export interface ISortResult {
  code: string;
  changes: ICodeChange[];
}

export interface ICodeChange {
  start: number;
  end: number;
  code: string;
  note?: string;
}

export function importSort(
  code: string,
  rawParser: string | IParser,
  rawStyle: string | IStyle,
  file?: string,
  options?: object,
): ISortResult {
  let style: IStyle;

  const parser: IParser =
    typeof rawParser === "string" ? require(rawParser) : (rawParser as IParser);

  if (typeof rawStyle === "string") {
    style = require(rawStyle);

    // eslint-disable-next-line
    if ((style as any).default) {
      // eslint-disable-next-line
      style = (style as any).default;
    }
  } else {
    style = rawStyle as IStyle;
  }

  return sortImports(code, parser, style, file, options);
}

export function sortImports(
  code: string,
  parser: IParser,
  style: IStyle,
  file?: string,
  options?: object,
): ISortResult {
  // eslint-disable-next-line
  const items = addFallback(style, file, options || {})(StyleAPI);

  const buckets: IImport[][] = items.map(() => []);

  const imports = parser.parseImports(code, {
    file,
  });

  if (imports.length === 0) {
    return {code, changes: []};
  }

  const eol = detectNewlineGraceful(code);

  const changes: ICodeChange[] = [];

  // Fill buckets
  for (const imported of imports) {
    let sortedImport = imported;

    const index = items.findIndex(item => {
      // eslint-disable-next-line
      sortedImport = sortNamedMembers(imported, item.sortNamedMembers);
      return !!item.match && item.match(sortedImport);
    });

    if (index !== -1) {
      buckets[index].push(sortedImport);
    }
  }

  // Sort buckets
  buckets.forEach((bucket, index) => {
    const {sort} = items[index];

    if (!sort) {
      return;
    }

    if (!Array.isArray(sort)) {
      bucket.sort(sort as ISorterFunction);
      return;
    }

    const sorters = sort as ISorterFunction[];

    if (sorters.length === 0) {
      return;
    }

    const multiSort = (first: IImport, second: IImport): number => {
      let sorterIndex = 0;
      let comparison = 0;

      while (comparison === 0 && sorters[sorterIndex]) {
        comparison = sorters[sorterIndex](first, second);
        sorterIndex += 1;
      }

      return comparison;
    };

    bucket.sort(multiSort);
  });

  let importsCode = "";

  // Track if we need to insert a separator
  let separator = false;

  buckets.forEach((bucket, index) => {
    if (bucket.length > 0 && separator) {
      importsCode += eol;
      separator = false;
    }

    bucket.forEach(imported => {
      // const sortedImport = sortNamedMembers(imported, items[index].sortNamedMembers);
      const importString = parser.formatImport(code, imported, eol);
      importsCode += importString + eol;
    });

    // Add separator but only when at least one import was already added
    if (items[index].separator && importsCode !== "") {
      separator = true;
    }
  });

  let sortedCode = code;

  // Remove imports
  imports
    .slice()
    .reverse()
    .forEach(imported => {
      let importEnd = imported.end;

      if (sortedCode.charAt(imported.end).match(/\s/)) {
        importEnd += 1;
      }

      changes.push({
        start: imported.start,
        end: importEnd,
        code: "",
        note: "import-remove",
      });

      sortedCode =
        sortedCode.slice(0, imported.start) +
        sortedCode.slice(importEnd, code.length);
    });

  const {start} = imports[0];

  // Split code at first original import
  let before = code.substring(0, start);
  let after = sortedCode.substring(start, sortedCode.length);

  const oldBeforeLength = before.length;
  const oldAfterLength = after.length;

  let beforeChange: ICodeChange | undefined;
  let afterChange: ICodeChange | undefined;

  // Collapse all whitespace into a single blank line
  before = before.replace(/\s+$/, match => {
    beforeChange = {
      start: start - match.length,
      end: start,
      code: eol + eol,
      note: "before-collapse",
    };

    return eol + eol;
  });

  // Collapse all whitespace into a single new line
  after = after.replace(/^\s+/, match => {
    afterChange = {
      start,
      end: start + match.length,
      code: eol,
      note: "after-collapse",
    };

    return eol;
  });

  // Remove all whitespace at the beginning of the code
  if (before.match(/^\s+$/)) {
    beforeChange = {
      start: start - oldBeforeLength,
      end: start,
      code: "",
      note: "before-trim",
    };

    before = "";
  }

  // Remove all whitespace at the end of the code
  if (after.match(/^\s+$/)) {
    afterChange = {
      start,
      end: start + oldAfterLength,
      code: "",
      note: "after-trim",
    };

    after = "";
  }

  if (afterChange) {
    changes.push(afterChange);
  }

  if (beforeChange) {
    changes.push(beforeChange);
  }

  const change = {
    start: before.length,
    end: before.length,
    code: importsCode,
    note: "imports",
  };

  changes.push(change);

  if (code === before + importsCode + after) {
    return {code, changes: []};
  }

  return {
    code: before + importsCode + after,
    changes,
  };
}

function sortNamedMembers(
  imported: IImport,
  rawSort?: INamedMemberSorterFunction | INamedMemberSorterFunction[],
): IImport {
  const sort = rawSort;

  if (!sort) {
    return imported;
  }

  if (!Array.isArray(sort)) {
    const singleSortedImport = {...imported};

    singleSortedImport.namedMembers = [...imported.namedMembers].sort(
      sort as INamedMemberSorterFunction,
    );

    return singleSortedImport;
  }

  const sorters = sort as INamedMemberSorterFunction[];

  if (sorters.length === 0) {
    return imported;
  }

  const multiSort = (first: NamedMember, second: NamedMember): number => {
    let sorterIndex = 0;
    let comparison = 0;

    while (comparison === 0 && sorters[sorterIndex]) {
      comparison = sorters[sorterIndex](first, second);
      sorterIndex += 1;
    }

    return comparison;
  };

  const sortedImport = {...imported};
  sortedImport.namedMembers = [...imported.namedMembers].sort(multiSort);

  return sortedImport;
}

export function applyChanges(code: string, changes: ICodeChange[]): string {
  let changedCode = code;

  for (const change of changes) {
    changedCode =
      changedCode.slice(0, change.start) +
      change.code +
      changedCode.slice(change.end, changedCode.length);
  }

  return changedCode;
}

function addFallback(style: IStyle, file?: string, options?: object): IStyle {
  return styleApi => {
    const items = [{separator: true}, {match: styleApi.always}];

    return style(styleApi, file, options).concat(items);
  };
}

//parser interface

interface IParserOptions {
  file?: string;
}

interface IParser {
  parseImports(code: string, options?: IParserOptions): IImport[];
  formatImport(code: string, imported: IImport, eol?: string): string;
}

interface IImport {
  start: number;
  end: number;

  importStart?: number;
  importEnd?: number;

  type: ImportType;

  moduleName: string;

  defaultMember?: string;
  namespaceMember?: string;
  namedMembers: NamedMember[];
}

type ImportType = "import" | "require" | "import-equals" | "import-type";

interface NamedMember {
  name: string;
  alias: string;
  type?: boolean;
}


//ts parser
export function parseImports(code: string): IImport[] {
  const host: typescript.CompilerHost = {
    fileExists: () => true,
    readFile: () => "",

    getSourceFile: () => {
      return typescript.createSourceFile(
        "",
        code,
        typescript.ScriptTarget.Latest,
        true,
      );
    },

    getDefaultLibFileName: () => "lib.d.ts",
    writeFile: () => null,
    getCurrentDirectory: () => "",
    getDirectories: () => [],
    getCanonicalFileName: fileName => fileName,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => typescript.sys.newLine,
  };

  const program = typescript.createProgram(
    ["foo.ts"],
    {
      noResolve: true,
      target: typescript.ScriptTarget.Latest,
      experimentalDecorators: true,
      experimentalAsyncFunctions: true,
    },
    host,
  );

  const sourceFile = program.getSourceFile("foo.ts");

  if (!sourceFile) {
    throw new Error("Source file not found. This should not happen.");
  }

  const imports: IImport[] = [];

  typescript.forEachChild(sourceFile, node => {
    switch (node.kind) {
      case typescript.SyntaxKind.ImportDeclaration: {
        imports.push(
          parseImportDeclaration(
            code,
            sourceFile,
            node as typescript.ImportDeclaration,
          ),
        );
        break;
      }
      case typescript.SyntaxKind.ImportEqualsDeclaration: {
        break;
      }
      default: {
        break;
      }
    }
  });

  return imports;
}

function parseImportDeclaration(
  code: string,
  sourceFile: typescript.SourceFile,
  importDeclaration: typescript.ImportDeclaration,
): IImport {
  const importStart =
    importDeclaration.pos + importDeclaration.getLeadingTriviaWidth();
  const importEnd = importDeclaration.end;

  let start = importStart;
  let end = importEnd;

  const leadingComments = getComments(sourceFile, importDeclaration, false);
  const trailingComments = getComments(sourceFile, importDeclaration, true);

  if (leadingComments) {
    const comments = leadingComments;

    let current = leadingComments.length - 1;
    let previous: number | undefined;

    while (comments[current] && comments[current].end + 1 === start) {
      if (
        code
          .substring(comments[current].pos, comments[current].end)
          .startsWith("#!")
      ) {
        break;
      }

      previous = current;
      start = comments[previous].pos;
      current -= 1;
    }
  }

  if (trailingComments) {
    const comments = trailingComments;

    let current = 0;
    let previous: number | undefined;

    while (comments[current] && comments[current].pos - 1 === end) {
      // TODO: Why is this not needed?
      // if (comments[current].loc.start.line !== node.loc.start.line) {
      //   break;
      // }

      previous = current;
      ({end} = comments[previous]);
      current += 1;
    }
  }

  const type: ImportType = "import";

  const moduleName = importDeclaration.moduleSpecifier
    .getText()
    .replace(/["']/g, "");

  const imported: IImport = {
    start,
    end,
    importStart,
    importEnd,
    type,
    moduleName,
    namedMembers: [],
  };

  const {importClause} = importDeclaration;

  if (importClause) {
    if (importClause.name) {
      imported.defaultMember = importClause.name.text;
    }

    const {namedBindings} = importClause;

    if (namedBindings) {
      if (namedBindings.kind === typescript.SyntaxKind.NamespaceImport) {
        const namespaceImport = namedBindings as typescript.NamespaceImport;
        imported.namespaceMember = namespaceImport.name.text;
      }

      if (namedBindings.kind === typescript.SyntaxKind.NamedImports) {
        const namedImports = namedBindings as typescript.NamedImports;

        for (const element of namedImports.elements) {
          const alias = element.name.text;
          let name = alias;

          if (element.propertyName) {
            name = element.propertyName.text;
          }

          imported.namedMembers.push({
            name: fixMultipleUnderscore(name),
            alias: fixMultipleUnderscore(alias),
          });
        }
      }
    }
  }

  return imported;
}

// This hack circumvents a bug (?) in the TypeScript parser where a named
// binding's name or alias that consists only of underscores contains an
// additional underscore. We just remove the superfluous underscore here.
//
// See https://github.com/renke/import-sort/issues/18 for more details.
function fixMultipleUnderscore(name) {
  if (name.match(/^_{2,}$/)) {
    return name.substring(1);
  }

  return name;
}

// Taken from https://github.com/fkling/astexplorer/blob/master/src/parsers/js/typescript.js#L68
function getComments(
  sourceFile: typescript.SourceFile,
  node: typescript.Node,
  isTrailing: boolean,
): typescript.CommentRange[] | undefined {
  if (node.parent) {
    const nodePos = isTrailing ? node.end : node.pos;
    const parentPos = isTrailing ? node.parent.end : node.parent.pos;

    if (
      node.parent.kind === typescript.SyntaxKind.SourceFile ||
      nodePos !== parentPos
    ) {
      let comments: typescript.CommentRange[] | undefined;

      if (isTrailing) {
        comments = typescript.getTrailingCommentRanges(
          sourceFile.text,
          nodePos,
        );
      } else {
        comments = typescript.getLeadingCommentRanges(sourceFile.text, nodePos);
      }

      if (Array.isArray(comments)) {
        return comments;
      }
    }
  }

  return undefined;
}

export function formatImport(
  code: string,
  imported: IImport,
  eol = "\n",
): string {
  const importStart = imported.importStart || imported.start;
  const importEnd = imported.importEnd || imported.end;

  const importCode = code.substring(importStart, importEnd);

  const {namedMembers} = imported;

  if (namedMembers.length === 0) {
    return code.substring(imported.start, imported.end);
  }

  const newImportCode = importCode.replace(
    /\{[\s\S]*\}/g,
    namedMembersString => {
      const useMultipleLines = namedMembersString.indexOf(eol) !== -1;

      let prefix: string | undefined;

      if (useMultipleLines) {
        [prefix] = namedMembersString
          .split(eol)[1]
          .match(/^\s*/) as RegExpMatchArray;
      }

      const useSpaces = namedMembersString.charAt(1) === " ";

      const userTrailingComma = namedMembersString
        .replace("}", "")
        .trim()
        .endsWith(",");

      return formatNamedMembers(
        namedMembers,
        useMultipleLines,
        useSpaces,
        userTrailingComma,
        prefix,
        eol,
      );
    },
  );

  return (
    code.substring(imported.start, importStart) +
    newImportCode +
    code.substring(importEnd, importEnd + (imported.end - importEnd))
  );
}

function formatNamedMembers(
  namedMembers: NamedMember[],
  useMultipleLines: boolean,
  useSpaces: boolean,
  useTrailingComma: boolean,
  prefix: string | undefined,
  eol = "\n",
): string {
  if (useMultipleLines) {
    return (
      "{" +
      eol +
      namedMembers
        .map(({name, alias}, index) => {
          const lastImport = index === namedMembers.length - 1;
          const comma = !useTrailingComma && lastImport ? "" : ",";

          if (name === alias) {
            return `${prefix}${name}${comma}` + eol;
          }

          return `${prefix}${name} as ${alias}${comma}` + eol;
        })
        .join("") +
      "}"
    );
  }

  const space = useSpaces ? " " : "";
  const comma = useTrailingComma ? "," : "";

  return (
    "{" +
    space +
    namedMembers
      .map(({name, alias}) => {
        if (name === alias) {
          return `${name}`;
        }

        return `${name} as ${alias}`;
      })
      .join(", ") +
    comma +
    space +
    "}"
  );
}


const TsImportParser = {
  parseImports,
  formatImport
}


export function sortStyle_module(styleApi: IStyleAPI): IStyleItem[] {
  const {
    alias,
    and,
    dotSegmentCount,
    hasNoMember,
    isAbsoluteModule,
    isNodeModule,
    isRelativeModule,
    moduleName,
    naturally,
    unicode,
  } = styleApi;

  return [
    // import "foo"
    {match: and(hasNoMember, isAbsoluteModule)},
    {separator: true},

    // import "./foo"
    {match: and(hasNoMember, isRelativeModule)},
    {separator: true},

    // import … from "fs";
    {
      match: isNodeModule,
      sort: moduleName(naturally),
      sortNamedMembers: alias(unicode),
    },
    {separator: true},

    // import … from "foo";
    {
      match: isAbsoluteModule,
      sort: moduleName(naturally),
      sortNamedMembers: alias(unicode),
    },
    {separator: true},

    // import … from "./foo";
    // import … from "../foo";
    {
      match: isRelativeModule,
      sort: [dotSegmentCount, moduleName(naturally)],
      sortNamedMembers: alias(unicode),
    },
    {separator: true},
  ];
}



const sort = (pathGlobs) => {
  var filePaths = globby.sync(pathGlobs, {dot: true, expandDirectories: false})
      .map(filePath => path.relative(process.cwd(), filePath)) || []


  for (const filePath of filePaths) {
    console.log(filePath)

    const unsortedCode = readFileSync(filePath).toString("utf8");
    var sortResult = sortImports(
      unsortedCode,
      TsImportParser,
      sortStyle_module,
      filePath,
      //sortOpts,
    );
// handleFilePathError(filePath, e);
   
    const {code: sortedCode, changes} = sortResult;
  
    const isDifferent = changes.length > 0;
  
    // if (writeFiles && isDifferent) {
    //   writeFileSync(filePath, sortedCode, {encoding: "utf-8"});
    // }

    if (isDifferent) {
      writeFileSync(filePath, sortedCode, {encoding: "utf-8"});
    }
    
    console.log(filePath);
    process.stdout.write(sortedCode);

    // if (listDifferent && isDifferent) {
    //   process.exitCode = 1;
    //   console.log(filePath);
    // }
  
    // if (!writeFiles && !listDifferent) {
    //   process.stdout.write(sortedCode);
    // }
  }
}

sort("./**/*/tester.js")
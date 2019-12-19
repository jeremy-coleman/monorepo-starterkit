React Monorepo with App and library targets (webpack and rollup respectively)
==================================================

Getting Started
---------------
```bash
$ npm run bootstrap
$ npm run start -> prompt -> @coglite/webapp -> start
```

Parallel Prettify
----------------------------
```bash
$ npm run pprettify
```

types are pointed to the source dir, so when you hit f12 in vscode it takes you to source files without having to use declaration maps etc.just publish source files to npm? idk

some pointers -
1) dont add anything to devDependencies in the child repos, just put anything dev related in the root.
This will prevent node_module spam and aggregate everything into the root node_modules.

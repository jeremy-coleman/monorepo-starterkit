React Monorepo with App and library targets (webpack and rollup respectively)
==================================================

Getting Started
---------------
```bash
$ yarn
$ yarn start
$ yarn build
```

Prettify
----------------------------
```bash
$ npm run prettify
```

types are pointed to the source dir, so when you hit f12 it takes you to source files without having to use declaration maps etc.

just publish source files to npm? idk

some pointers -
1) dont add anything to devDependencies in the child repos, just put anything dev related in the root.
This will prevent node_module spam and aggregate everything into the root node_modules.

some thoughts
the webpack entry is pointed to the unbundled files. you could change it to the rollup bundled entry and keep hmr, you can concurrently run watch with rollup and webpack, it works, just not sure which is better or implications on hmr


//https://github.com/rollup/awesome

   output: [{
    file: path.join(__dirname, ...basePath.split('\\').concat('lib', 'index.cjs')),
    format: 'cjs',
    interop: false,
    globals: globals,
    }]

 var globalze = require("rollup-plugin-external-globals")

      plugins: [
        globalze({
          jquery: "$",
          //'react': "React"
        })
      ],

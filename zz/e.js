
var fs = require('fs')

// let x = () => Promise.all([
//     fs.readdirSync("node_modules"),
//     fs.readdirSync("./projects")
// ]).then(lists => {
//     return ([...new Set(...lists)])
// })

// x().then(r => console.log(r))

let r = fs.readdirSync("node_modules").concat(fs.readdirSync("./projects"))
console.log(r)

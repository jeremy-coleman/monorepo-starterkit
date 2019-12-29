const cp = require('child_process')
const path = require('path')

import replaceHomedir from '../cli-tools/replace-homedir'
import logSymbols from '../cli-tools/log-symbols'
import {chalk} from '../cli-tools/chalky'
const { red, white, yellow, green, underline, blue, bold } = chalk

//-------------script helper ------------//


const PROJECT_DIRS_OR_TSCONFIGS = [
  path.resolve(process.cwd(), "tsconfig.json")
];

let getAllErrorPaths = (buf = '') => {
  if (!buf.includes(`src/`)) return new Set();
  let bufferClone = buf.slice(4)
  .replace(/\r?\n|\r/g, '')
  .replace('...', ' ')
  let sArray = []
  let clickablePaths = []
  let s = ''
  s += bufferClone
  s.split(' ')
  .map(p => p.replace("):", ")"))
  .map(p => sArray.push(p))
  sArray
    .filter(s => s.includes('src/'))
    .forEach(p => {
      let start = p.indexOf('src/')
      let end = p.indexOf(')') +1 
      let shortPath = p.slice(start, end)
      let res = path.resolve(shortPath)
      let clickablePath = replaceHomedir(res, '~');
      clickablePaths.push(clickablePath)
      //console.log(clickablePath)
  })
  return new Set(clickablePaths)
}

let running = undefined;
let nextRun = false;
let firstRun = true;

const initialCompilationPromises = [];


const init = () => {

    async function runResponseCommand() {
      await Promise.all(initialCompilationPromises);
      if (running) {
        await running;
        if (nextRun) {return;}
        nextRun = true;
      }

      running = new Promise((resolve) => {
        if (firstRun) {firstRun = false;}
      });

      await running;
      running = undefined;
      nextRun = false;
    }
    //kick it off
    runResponseCommand()

    for (const projectDir of PROJECT_DIRS_OR_TSCONFIGS) {
      const tscArgs = ['-w'];
      if (projectDir !== '') {
        tscArgs.push('-p', PROJECT_DIRS_OR_TSCONFIGS);
      }
      
      const child = cp.spawn('tsc', tscArgs, { shell: true, cwd: process.cwd(), hideWindows: true });
      child.on('exit', (code, signal) => {
        console.error(`tsc exited with exit code: ${code}`);
        if (signal) {
          console.error(`signal: ${signal}`);
        }
      });

      let resolve;

      initialCompilationPromises.push(new Promise((r) => {resolve = r;}));

      let buffer = '';
      const marker = `. Watching for file changes.`
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (chunk) => {
        // process.stdout.write(chunk);
        buffer += chunk;
        while (true) {
          let index = buffer.indexOf(marker);
          if (index === -1) {
            break;
          }
          resolve();
          // if (buffer.includes(`File change detected. Starting incremental compilation...`)) {
          //   console.log('\nFile change detected. Compiling...\n');
          // }


          let typeErrorPaths = getAllErrorPaths(buffer)

          if(typeErrorPaths.size > 0) {
              console.warn(logSymbols.error, red().underline((`typescript errors`)), logSymbols.error)
              typeErrorPaths.forEach(v => {
                console.info(logSymbols.warning, yellow().underline((`${v}`)))
              })
            }

          console.info(logSymbols.success, green(`TsCheck done with ${typeErrorPaths.size} errors`))
          

          buffer = buffer.slice(index + marker.length);

          //rerun
          runResponseCommand();
        }
      });
    }
}

init()

# WebExplorer

Front end developer playground

## npm scripts usage

For development:

```bash
# Build frontend and backend in watch mode
npm run watch # aka: npm run watch:front & npm run watch:back

# Start backend web server in watch mode
npm run start:watch
```

For production:

```bash
# Build frontend and backend
npm run build # aka: npm run build:front & npm run build:back

# Start backend web server
npm start
```

To mock the backend web server:

```bash
# Only watch (or build) the front
npm run watch:front # or: npm run build:front

# Start webpack-dev-server instead of the real backend web server
npm run start:mock
```

## Service worker

Open `src/front/service-worker.js` and update the cache version each time you upload a new version of the App.

```js
const cacheVersion = 1;
```

## HTML base setting

For production:

Open `src/front/index.html` and set the base `href` according to your public path. Then, run the npm scripts as described above.

```html
<base href="/">
```

import fs from 'fs';
import { ServerResponse } from 'http';
import path from 'path';

import { isBinaryPath } from './_binary';
import { getContentType } from './_types';

// FIXME: this path is only for production!
// Thus, the npm script "watch:start" does NOT work,
// because in this case the expected path is: `path.join(__dirname, '../../front')`.
const FRONT_ROOT = path.join(__dirname, '../front');

export const getPathfile = (requestUrl: string) => path.join(FRONT_ROOT, requestUrl.replace(/^\//, ''));

export const getContent = (pathfile: string): Promise<IContent> => new Promise((resolve, reject) => {
  const isBinary = isBinaryPath(pathfile);
  fs.readFile(pathfile, { encoding: isBinary ? 'binary' : 'utf8' }, (err, content) => {
    if (!err) {
      const ext = path.extname(pathfile).substr(1);
      const contentType = getContentType(ext) + (isBinary ? '' : '; charset=utf-8');
      resolve({ content, contentType });
    } else {
      reject(err);
    }
  });
});

export const getContent404 = () => getContent(path.join(__dirname, './pages/error404.html'));

export const fillResponse = (response: ServerResponse, data: IContent, isBinary = false) => {
  response.setHeader('Content-Type', data.contentType);
  response.end(data.content, isBinary ? 'binary' : 'utf8');
};

export interface IContent {
  content: string;
  contentType: string;
}

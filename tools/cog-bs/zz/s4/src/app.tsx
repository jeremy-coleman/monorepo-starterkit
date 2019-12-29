import * as React from 'react';
import { render } from 'react-dom';
import { App } from './main';

render(<App />, document.getElementById('root'));

if(module["hot"]){module["hot"].accept()}
//couldnt get the ts transform to work properly, babel is fine as long as you're careful with presets
// import { hot } from 'react-hot-ts';
// hot()(render(<App/>, document.getElementById('root')));
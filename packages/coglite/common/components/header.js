import * as React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
export let Header = (props) => React.createElement(AppBar, { position: "static" },
    React.createElement(Toolbar, { variant: 'dense' },
        React.createElement(Typography, { variant: "h6", color: "inherit" }, props.children)));

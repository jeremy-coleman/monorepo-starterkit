import blue from '@material-ui/core/colors/blue';
import pink from '@material-ui/core/colors/pink';
import red from '@material-ui/core/colors/red';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
const paletteType = 'light';
const overrides = {
    MuiButton: {
        root: {
            // Button text should not be all upper case
            textTransform: 'none'
        }
    }
};
export function defaultTheme() {
    const palette = {
        primary: {
            main: blue[900]
        },
        secondary: {
            main: pink.A400
        },
        error: {
            main: red.A400
        },
        type: paletteType
    };
    return createMuiTheme({ palette, overrides });
}

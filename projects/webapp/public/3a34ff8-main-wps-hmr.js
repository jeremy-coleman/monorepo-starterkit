webpackHotUpdate("main",{

/***/ "./src/app.tsx":
/*!*********************!*\
  !*** ./src/app.tsx ***!
  \*********************/
/*! exports provided: App, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "App", function() { return App; });
/* harmony import */ var _coglite_common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @coglite/common */ "../../packages/common/lib/index.js");
/* harmony import */ var _material_ui_core_styles__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @material-ui/core/styles */ "../../node_modules/@material-ui/core/esm/styles/index.js");
/* harmony import */ var _material_ui_core_styles_MuiThemeProvider__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @material-ui/core/styles/MuiThemeProvider */ "../../node_modules/@material-ui/core/styles/MuiThemeProvider.js");
/* harmony import */ var _material_ui_core_styles_MuiThemeProvider__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_material_ui_core_styles_MuiThemeProvider__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _material_ui_styles__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @material-ui/styles */ "../../node_modules/@material-ui/styles/esm/index.js");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./state */ "./src/state.ts");
/* harmony import */ var mobx__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! mobx */ "../../node_modules/mobx/lib/mobx.module.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react */ "../../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _ButtonTest__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./ButtonTest */ "./src/ButtonTest.tsx");








// Enable strict mode for MobX. This disallows state changes outside of an action
Object(mobx__WEBPACK_IMPORTED_MODULE_5__["configure"])({ enforceActions: true });
const theme = Object(_coglite_common__WEBPACK_IMPORTED_MODULE_0__["defaultTheme"])();
const Root = Object(_material_ui_styles__WEBPACK_IMPORTED_MODULE_3__["styled"])('div')({
    display: 'grid',
    gridTemplateColumns: 200,
    gridTemplateRows: '100px 100px',
    justifyContent: 'center',
    alignContent: 'center',
    width: '100%',
    height: '100%',
});
const Count = Object(_material_ui_styles__WEBPACK_IMPORTED_MODULE_3__["styled"])('div')({
    background: 'azure',
    display: 'grid',
    justifyContent: 'center',
    alignContent: 'center',
    gridColumn: '1 / 2',
    gridRow: '1 / 2',
});
const PastEvents = Object(_material_ui_styles__WEBPACK_IMPORTED_MODULE_3__["styled"])('div')({
    display: 'grid',
    gridColumn: '1 / 2',
    gridRow: '2 / 3',
});
const styles = (theme) => Object(_material_ui_core_styles__WEBPACK_IMPORTED_MODULE_1__["createStyles"])({
    '@global': {
        html: {
            height: '100%',
            boxSizing: 'border-box',
        },
        '*, *:before, *:after': {
            boxSizing: 'inherit',
        },
        body: {
            height: '100%',
            margin: 0,
            background: theme.palette.background.default,
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.fontSize,
            color: theme.palette.text.primary,
            // Helps fonts on OSX look more consistent with other systems
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            // Use momentum-based scrolling on iOS devices
            WebkitOverflowScrolling: 'touch',
        },
        '#coglite-app-root': {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        },
    },
    root: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
});
// push is just one operation that you can do on an array, full list for every data type at https://devdocs.io/javascript/
const increment = e => {
    _state__WEBPACK_IMPORTED_MODULE_4__["state"].pastCounters.push(_state__WEBPACK_IMPORTED_MODULE_4__["state"].count);
    _state__WEBPACK_IMPORTED_MODULE_4__["state"].count = e.clientY;
};
const App = Object(_material_ui_core_styles__WEBPACK_IMPORTED_MODULE_1__["withStyles"])(styles)((props) => {
    return (react__WEBPACK_IMPORTED_MODULE_6___default.a.createElement(_material_ui_core_styles_MuiThemeProvider__WEBPACK_IMPORTED_MODULE_2___default.a, { theme: theme },
        react__WEBPACK_IMPORTED_MODULE_6___default.a.createElement("div", { className: props.classes.root },
            react__WEBPACK_IMPORTED_MODULE_6___default.a.createElement(_coglite_common__WEBPACK_IMPORTED_MODULE_0__["Header"], null, "Home"),
            react__WEBPACK_IMPORTED_MODULE_6___default.a.createElement(Root, null,
                react__WEBPACK_IMPORTED_MODULE_6___default.a.createElement(Count, { onClick: increment },
                    _state__WEBPACK_IMPORTED_MODULE_4__["state"].count,
                    " (click on me)"),
                react__WEBPACK_IMPORTED_MODULE_6___default.a.createElement(PastEvents, null, _state__WEBPACK_IMPORTED_MODULE_4__["state"].pastCounters.map(count => (react__WEBPACK_IMPORTED_MODULE_6___default.a.createElement("span", null, count)))),
                react__WEBPACK_IMPORTED_MODULE_6___default.a.createElement(_ButtonTest__WEBPACK_IMPORTED_MODULE_7__["MyButton"], { onClick: e => console.log('hi'), color: 'black' }, "my button")))));
});
/* harmony default export */ __webpack_exports__["default"] = (App);


/***/ })

})
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvYXBwLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQXVEO0FBQ2E7QUFDSztBQUM1QjtBQUNiO0FBQ0M7QUFDUDtBQUNjO0FBQ3hDO0FBQ0Esc0RBQVMsRUFBRSx1QkFBdUI7QUFDbEMsY0FBYyxvRUFBWTtBQUMxQixhQUFhLGtFQUFNO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELGNBQWMsa0VBQU07QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELG1CQUFtQixrRUFBTTtBQUN6QjtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsMEJBQTBCLDZFQUFZO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDO0FBQ0Q7QUFDQTtBQUNBLElBQUksNENBQUssbUJBQW1CLDRDQUFLO0FBQ2pDLElBQUksNENBQUs7QUFDVDtBQUNPLFlBQVksMkVBQVU7QUFDN0IsWUFBWSw0Q0FBSyxlQUFlLGdGQUFnQixHQUFHLGVBQWU7QUFDbEUsUUFBUSw0Q0FBSyx1QkFBdUIsZ0NBQWdDO0FBQ3BFLFlBQVksNENBQUssZUFBZSxzREFBTTtBQUN0QyxZQUFZLDRDQUFLO0FBQ2pCLGdCQUFnQiw0Q0FBSyx1QkFBdUIscUJBQXFCO0FBQ2pFLG9CQUFvQiw0Q0FBSztBQUN6QjtBQUNBLGdCQUFnQiw0Q0FBSyxpQ0FBaUMsNENBQUssNEJBQTRCLDRDQUFLO0FBQzVGLGdCQUFnQiw0Q0FBSyxlQUFlLG9EQUFRLEdBQUcsa0RBQWtEO0FBQ2pHLENBQUM7QUFDYyxrRUFBRyxFQUFDIiwiZmlsZSI6IjNhMzRmZjgtbWFpbi13cHMtaG1yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGVmYXVsdFRoZW1lLCBIZWFkZXIgfSBmcm9tICdAY29nbGl0ZS9jb21tb24nO1xyXG5pbXBvcnQgeyBjcmVhdGVTdHlsZXMsIHdpdGhTdHlsZXMgfSBmcm9tICdAbWF0ZXJpYWwtdWkvY29yZS9zdHlsZXMnO1xyXG5pbXBvcnQgTXVpVGhlbWVQcm92aWRlciBmcm9tICdAbWF0ZXJpYWwtdWkvY29yZS9zdHlsZXMvTXVpVGhlbWVQcm92aWRlcic7XHJcbmltcG9ydCB7IHN0eWxlZCB9IGZyb20gJ0BtYXRlcmlhbC11aS9zdHlsZXMnO1xyXG5pbXBvcnQgeyBzdGF0ZSB9IGZyb20gJy4vc3RhdGUnO1xyXG5pbXBvcnQgeyBjb25maWd1cmUgfSBmcm9tICdtb2J4JztcclxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgTXlCdXR0b24gfSBmcm9tICcuL0J1dHRvblRlc3QnO1xyXG4vLyBFbmFibGUgc3RyaWN0IG1vZGUgZm9yIE1vYlguIFRoaXMgZGlzYWxsb3dzIHN0YXRlIGNoYW5nZXMgb3V0c2lkZSBvZiBhbiBhY3Rpb25cclxuY29uZmlndXJlKHsgZW5mb3JjZUFjdGlvbnM6IHRydWUgfSk7XHJcbmNvbnN0IHRoZW1lID0gZGVmYXVsdFRoZW1lKCk7XHJcbmNvbnN0IFJvb3QgPSBzdHlsZWQoJ2RpdicpKHtcclxuICAgIGRpc3BsYXk6ICdncmlkJyxcclxuICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnM6IDIwMCxcclxuICAgIGdyaWRUZW1wbGF0ZVJvd3M6ICcxMDBweCAxMDBweCcsXHJcbiAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXHJcbiAgICBhbGlnbkNvbnRlbnQ6ICdjZW50ZXInLFxyXG4gICAgd2lkdGg6ICcxMDAlJyxcclxuICAgIGhlaWdodDogJzEwMCUnLFxyXG59KTtcclxuY29uc3QgQ291bnQgPSBzdHlsZWQoJ2RpdicpKHtcclxuICAgIGJhY2tncm91bmQ6ICdhenVyZScsXHJcbiAgICBkaXNwbGF5OiAnZ3JpZCcsXHJcbiAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXHJcbiAgICBhbGlnbkNvbnRlbnQ6ICdjZW50ZXInLFxyXG4gICAgZ3JpZENvbHVtbjogJzEgLyAyJyxcclxuICAgIGdyaWRSb3c6ICcxIC8gMicsXHJcbn0pO1xyXG5jb25zdCBQYXN0RXZlbnRzID0gc3R5bGVkKCdkaXYnKSh7XHJcbiAgICBkaXNwbGF5OiAnZ3JpZCcsXHJcbiAgICBncmlkQ29sdW1uOiAnMSAvIDInLFxyXG4gICAgZ3JpZFJvdzogJzIgLyAzJyxcclxufSk7XHJcbmNvbnN0IHN0eWxlcyA9ICh0aGVtZSkgPT4gY3JlYXRlU3R5bGVzKHtcclxuICAgICdAZ2xvYmFsJzoge1xyXG4gICAgICAgIGh0bWw6IHtcclxuICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXHJcbiAgICAgICAgICAgIGJveFNpemluZzogJ2JvcmRlci1ib3gnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJyosICo6YmVmb3JlLCAqOmFmdGVyJzoge1xyXG4gICAgICAgICAgICBib3hTaXppbmc6ICdpbmhlcml0JyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IHtcclxuICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXHJcbiAgICAgICAgICAgIG1hcmdpbjogMCxcclxuICAgICAgICAgICAgYmFja2dyb3VuZDogdGhlbWUucGFsZXR0ZS5iYWNrZ3JvdW5kLmRlZmF1bHQsXHJcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IHRoZW1lLnR5cG9ncmFwaHkuZm9udEZhbWlseSxcclxuICAgICAgICAgICAgZm9udFNpemU6IHRoZW1lLnR5cG9ncmFwaHkuZm9udFNpemUsXHJcbiAgICAgICAgICAgIGNvbG9yOiB0aGVtZS5wYWxldHRlLnRleHQucHJpbWFyeSxcclxuICAgICAgICAgICAgLy8gSGVscHMgZm9udHMgb24gT1NYIGxvb2sgbW9yZSBjb25zaXN0ZW50IHdpdGggb3RoZXIgc3lzdGVtc1xyXG4gICAgICAgICAgICBXZWJraXRGb250U21vb3RoaW5nOiAnYW50aWFsaWFzZWQnLFxyXG4gICAgICAgICAgICBNb3pPc3hGb250U21vb3RoaW5nOiAnZ3JheXNjYWxlJyxcclxuICAgICAgICAgICAgLy8gVXNlIG1vbWVudHVtLWJhc2VkIHNjcm9sbGluZyBvbiBpT1MgZGV2aWNlc1xyXG4gICAgICAgICAgICBXZWJraXRPdmVyZmxvd1Njcm9sbGluZzogJ3RvdWNoJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgICcjY29nbGl0ZS1hcHAtcm9vdCc6IHtcclxuICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXHJcbiAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICByb290OiB7XHJcbiAgICAgICAgZmxleDogMSxcclxuICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXHJcbiAgICB9LFxyXG59KTtcclxuLy8gcHVzaCBpcyBqdXN0IG9uZSBvcGVyYXRpb24gdGhhdCB5b3UgY2FuIGRvIG9uIGFuIGFycmF5LCBmdWxsIGxpc3QgZm9yIGV2ZXJ5IGRhdGEgdHlwZSBhdCBodHRwczovL2RldmRvY3MuaW8vamF2YXNjcmlwdC9cclxuY29uc3QgaW5jcmVtZW50ID0gZSA9PiB7XHJcbiAgICBzdGF0ZS5wYXN0Q291bnRlcnMucHVzaChzdGF0ZS5jb3VudCk7XHJcbiAgICBzdGF0ZS5jb3VudCA9IGUuY2xpZW50WTtcclxufTtcclxuZXhwb3J0IGNvbnN0IEFwcCA9IHdpdGhTdHlsZXMoc3R5bGVzKSgocHJvcHMpID0+IHtcclxuICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChNdWlUaGVtZVByb3ZpZGVyLCB7IHRoZW1lOiB0aGVtZSB9LFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBjbGFzc05hbWU6IHByb3BzLmNsYXNzZXMucm9vdCB9LFxyXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEhlYWRlciwgbnVsbCwgXCJIb21lXCIpLFxyXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFJvb3QsIG51bGwsXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENvdW50LCB7IG9uQ2xpY2s6IGluY3JlbWVudCB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmNvdW50LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiIChjbGljayBvbiBtZSlcIiksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFBhc3RFdmVudHMsIG51bGwsIHN0YXRlLnBhc3RDb3VudGVycy5tYXAoY291bnQgPT4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIG51bGwsIGNvdW50KSkpKSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTXlCdXR0b24sIHsgb25DbGljazogZSA9PiBjb25zb2xlLmxvZygnaGknKSwgY29sb3I6ICdibGFjaycgfSwgXCJteSBidXR0b25cIikpKSkpO1xyXG59KTtcclxuZXhwb3J0IGRlZmF1bHQgQXBwO1xyXG4iXSwic291cmNlUm9vdCI6IiJ9
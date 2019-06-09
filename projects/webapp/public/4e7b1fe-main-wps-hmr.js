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
/* harmony import */ var coglite_common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! coglite/common */ "../../packages/coglite/common/index.js");
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
const theme = Object(coglite_common__WEBPACK_IMPORTED_MODULE_0__["defaultTheme"])();
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
            react__WEBPACK_IMPORTED_MODULE_6___default.a.createElement(coglite_common__WEBPACK_IMPORTED_MODULE_0__["Header"], null, "Home"),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvYXBwLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQXNEO0FBQ2M7QUFDSztBQUM1QjtBQUNiO0FBQ0M7QUFDUDtBQUNjO0FBQ3hDO0FBQ0Esc0RBQVMsRUFBRSx1QkFBdUI7QUFDbEMsY0FBYyxtRUFBWTtBQUMxQixhQUFhLGtFQUFNO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELGNBQWMsa0VBQU07QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELG1CQUFtQixrRUFBTTtBQUN6QjtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsMEJBQTBCLDZFQUFZO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDO0FBQ0Q7QUFDQTtBQUNBLElBQUksNENBQUssbUJBQW1CLDRDQUFLO0FBQ2pDLElBQUksNENBQUs7QUFDVDtBQUNPLFlBQVksMkVBQVU7QUFDN0IsWUFBWSw0Q0FBSyxlQUFlLGdGQUFnQixHQUFHLGVBQWU7QUFDbEUsUUFBUSw0Q0FBSyx1QkFBdUIsZ0NBQWdDO0FBQ3BFLFlBQVksNENBQUssZUFBZSxxREFBTTtBQUN0QyxZQUFZLDRDQUFLO0FBQ2pCLGdCQUFnQiw0Q0FBSyx1QkFBdUIscUJBQXFCO0FBQ2pFLG9CQUFvQiw0Q0FBSztBQUN6QjtBQUNBLGdCQUFnQiw0Q0FBSyxpQ0FBaUMsNENBQUssNEJBQTRCLDRDQUFLO0FBQzVGLGdCQUFnQiw0Q0FBSyxlQUFlLG9EQUFRLEdBQUcsa0RBQWtEO0FBQ2pHLENBQUM7QUFDYyxrRUFBRyxFQUFDIiwiZmlsZSI6IjRlN2IxZmUtbWFpbi13cHMtaG1yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGVmYXVsdFRoZW1lLCBIZWFkZXIgfSBmcm9tICdjb2dsaXRlL2NvbW1vbic7XHJcbmltcG9ydCB7IGNyZWF0ZVN0eWxlcywgd2l0aFN0eWxlcyB9IGZyb20gJ0BtYXRlcmlhbC11aS9jb3JlL3N0eWxlcyc7XHJcbmltcG9ydCBNdWlUaGVtZVByb3ZpZGVyIGZyb20gJ0BtYXRlcmlhbC11aS9jb3JlL3N0eWxlcy9NdWlUaGVtZVByb3ZpZGVyJztcclxuaW1wb3J0IHsgc3R5bGVkIH0gZnJvbSAnQG1hdGVyaWFsLXVpL3N0eWxlcyc7XHJcbmltcG9ydCB7IHN0YXRlIH0gZnJvbSAnLi9zdGF0ZSc7XHJcbmltcG9ydCB7IGNvbmZpZ3VyZSB9IGZyb20gJ21vYngnO1xyXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyBNeUJ1dHRvbiB9IGZyb20gJy4vQnV0dG9uVGVzdCc7XHJcbi8vIEVuYWJsZSBzdHJpY3QgbW9kZSBmb3IgTW9iWC4gVGhpcyBkaXNhbGxvd3Mgc3RhdGUgY2hhbmdlcyBvdXRzaWRlIG9mIGFuIGFjdGlvblxyXG5jb25maWd1cmUoeyBlbmZvcmNlQWN0aW9uczogdHJ1ZSB9KTtcclxuY29uc3QgdGhlbWUgPSBkZWZhdWx0VGhlbWUoKTtcclxuY29uc3QgUm9vdCA9IHN0eWxlZCgnZGl2Jykoe1xyXG4gICAgZGlzcGxheTogJ2dyaWQnLFxyXG4gICAgZ3JpZFRlbXBsYXRlQ29sdW1uczogMjAwLFxyXG4gICAgZ3JpZFRlbXBsYXRlUm93czogJzEwMHB4IDEwMHB4JyxcclxuICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcclxuICAgIGFsaWduQ29udGVudDogJ2NlbnRlcicsXHJcbiAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgaGVpZ2h0OiAnMTAwJScsXHJcbn0pO1xyXG5jb25zdCBDb3VudCA9IHN0eWxlZCgnZGl2Jykoe1xyXG4gICAgYmFja2dyb3VuZDogJ2F6dXJlJyxcclxuICAgIGRpc3BsYXk6ICdncmlkJyxcclxuICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcclxuICAgIGFsaWduQ29udGVudDogJ2NlbnRlcicsXHJcbiAgICBncmlkQ29sdW1uOiAnMSAvIDInLFxyXG4gICAgZ3JpZFJvdzogJzEgLyAyJyxcclxufSk7XHJcbmNvbnN0IFBhc3RFdmVudHMgPSBzdHlsZWQoJ2RpdicpKHtcclxuICAgIGRpc3BsYXk6ICdncmlkJyxcclxuICAgIGdyaWRDb2x1bW46ICcxIC8gMicsXHJcbiAgICBncmlkUm93OiAnMiAvIDMnLFxyXG59KTtcclxuY29uc3Qgc3R5bGVzID0gKHRoZW1lKSA9PiBjcmVhdGVTdHlsZXMoe1xyXG4gICAgJ0BnbG9iYWwnOiB7XHJcbiAgICAgICAgaHRtbDoge1xyXG4gICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgYm94U2l6aW5nOiAnYm9yZGVyLWJveCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnKiwgKjpiZWZvcmUsICo6YWZ0ZXInOiB7XHJcbiAgICAgICAgICAgIGJveFNpemluZzogJ2luaGVyaXQnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9keToge1xyXG4gICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgbWFyZ2luOiAwLFxyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiB0aGVtZS5wYWxldHRlLmJhY2tncm91bmQuZGVmYXVsdCxcclxuICAgICAgICAgICAgZm9udEZhbWlseTogdGhlbWUudHlwb2dyYXBoeS5mb250RmFtaWx5LFxyXG4gICAgICAgICAgICBmb250U2l6ZTogdGhlbWUudHlwb2dyYXBoeS5mb250U2l6ZSxcclxuICAgICAgICAgICAgY29sb3I6IHRoZW1lLnBhbGV0dGUudGV4dC5wcmltYXJ5LFxyXG4gICAgICAgICAgICAvLyBIZWxwcyBmb250cyBvbiBPU1ggbG9vayBtb3JlIGNvbnNpc3RlbnQgd2l0aCBvdGhlciBzeXN0ZW1zXHJcbiAgICAgICAgICAgIFdlYmtpdEZvbnRTbW9vdGhpbmc6ICdhbnRpYWxpYXNlZCcsXHJcbiAgICAgICAgICAgIE1vek9zeEZvbnRTbW9vdGhpbmc6ICdncmF5c2NhbGUnLFxyXG4gICAgICAgICAgICAvLyBVc2UgbW9tZW50dW0tYmFzZWQgc2Nyb2xsaW5nIG9uIGlPUyBkZXZpY2VzXHJcbiAgICAgICAgICAgIFdlYmtpdE92ZXJmbG93U2Nyb2xsaW5nOiAndG91Y2gnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJyNjb2dsaXRlLWFwcC1yb290Jzoge1xyXG4gICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIHJvb3Q6IHtcclxuICAgICAgICBmbGV4OiAxLFxyXG4gICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcclxuICAgIH0sXHJcbn0pO1xyXG4vLyBwdXNoIGlzIGp1c3Qgb25lIG9wZXJhdGlvbiB0aGF0IHlvdSBjYW4gZG8gb24gYW4gYXJyYXksIGZ1bGwgbGlzdCBmb3IgZXZlcnkgZGF0YSB0eXBlIGF0IGh0dHBzOi8vZGV2ZG9jcy5pby9qYXZhc2NyaXB0L1xyXG5jb25zdCBpbmNyZW1lbnQgPSBlID0+IHtcclxuICAgIHN0YXRlLnBhc3RDb3VudGVycy5wdXNoKHN0YXRlLmNvdW50KTtcclxuICAgIHN0YXRlLmNvdW50ID0gZS5jbGllbnRZO1xyXG59O1xyXG5leHBvcnQgY29uc3QgQXBwID0gd2l0aFN0eWxlcyhzdHlsZXMpKChwcm9wcykgPT4ge1xyXG4gICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KE11aVRoZW1lUHJvdmlkZXIsIHsgdGhlbWU6IHRoZW1lIH0sXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IGNsYXNzTmFtZTogcHJvcHMuY2xhc3Nlcy5yb290IH0sXHJcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSGVhZGVyLCBudWxsLCBcIkhvbWVcIiksXHJcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUm9vdCwgbnVsbCxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ291bnQsIHsgb25DbGljazogaW5jcmVtZW50IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuY291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgXCIgKGNsaWNrIG9uIG1lKVwiKSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUGFzdEV2ZW50cywgbnVsbCwgc3RhdGUucGFzdENvdW50ZXJzLm1hcChjb3VudCA9PiAoUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgbnVsbCwgY291bnQpKSkpLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChNeUJ1dHRvbiwgeyBvbkNsaWNrOiBlID0+IGNvbnNvbGUubG9nKCdoaScpLCBjb2xvcjogJ2JsYWNrJyB9LCBcIm15IGJ1dHRvblwiKSkpKSk7XHJcbn0pO1xyXG5leHBvcnQgZGVmYXVsdCBBcHA7XHJcbiJdLCJzb3VyY2VSb290IjoiIn0=
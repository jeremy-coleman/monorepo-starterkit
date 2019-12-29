const { FORCE_COLOR, NODE_DISABLE_COLORS, TERM } = process.env;

interface Color {
	(x: string | number): string;
	(): Kleur;
}
interface Kleur {
	// Colors
	black: Color;
	red: Color;
	green: Color;
	yellow: Color;
	blue: Color;
	magenta: Color;
	cyan: Color;
	white: Color;
	gray: Color;
	grey: Color;

	// Backgrounds
	bgBlack: Color;
	bgRed: Color;
	bgGreen: Color;
	bgYellow: Color;
	bgBlue: Color;
	bgMagenta: Color;
	bgCyan: Color;
	bgWhite: Color;

	// Modifiers
	reset: Color;
	bold: Color;
	dim: Color;
	italic: Color;
	underline: Color;
	inverse: Color;
	hidden: Color;
	strikethrough: Color;
}


const kluer = {
	enabled: !NODE_DISABLE_COLORS && TERM !== 'dumb' && FORCE_COLOR !== '0',

	// modifiers
	reset: init(0, 0),
	bold: init(1, 22),
	dim: init(2, 22),
	italic: init(3, 23),
	underline: init(4, 24),
	inverse: init(7, 27),
	hidden: init(8, 28),
	strikethrough: init(9, 29),

	// colors
	black: init(30, 39),
	red: init(31, 39),
	green: init(32, 39),
	yellow: init(33, 39),
	blue: init(34, 39),
	magenta: init(35, 39),
	cyan: init(36, 39),
	white: init(37, 39),
	gray: init(90, 39),
	grey: init(90, 39),

	// background colors
	bgBlack: init(40, 49),
	bgRed: init(41, 49),
	bgGreen: init(42, 49),
	bgYellow: init(43, 49),
	bgBlue: init(44, 49),
	bgMagenta: init(45, 49),
	bgCyan: init(46, 49),
	bgWhite: init(47, 49)
};

function run(arr, str) {
	let i=0, tmp, beg='', end='';
	for (; i < arr.length; i++) {
		tmp = arr[i];
		beg += tmp.open;
		end += tmp.close;
		if (str.includes(tmp.close)) {
			str = str.replace(tmp.rgx, tmp.close + tmp.open);
		}
	}
	return beg + str + end;
}

function chain(has, keys) {
	//@ts-ignore
	let ctx: Kleur = { has, keys };

	ctx.reset = kluer.reset.bind(ctx);
	ctx.bold = kluer.bold.bind(ctx);
	ctx.dim = kluer.dim.bind(ctx);
	ctx.italic = kluer.italic.bind(ctx);
	ctx.underline = kluer.underline.bind(ctx);
	ctx.inverse = kluer.inverse.bind(ctx);
	ctx.hidden = kluer.hidden.bind(ctx);
	ctx.strikethrough = kluer.strikethrough.bind(ctx);

	ctx.black = kluer.black.bind(ctx);
	ctx.red = kluer.red.bind(ctx);
	ctx.green = kluer.green.bind(ctx);
	ctx.yellow = kluer.yellow.bind(ctx);
	ctx.blue = kluer.blue.bind(ctx);
	ctx.magenta = kluer.magenta.bind(ctx);
	ctx.cyan = kluer.cyan.bind(ctx);
	ctx.white = kluer.white.bind(ctx);
	ctx.gray = kluer.gray.bind(ctx);
	ctx.grey = kluer.grey.bind(ctx);

	ctx.bgBlack = kluer.bgBlack.bind(ctx);
	ctx.bgRed = kluer.bgRed.bind(ctx);
	ctx.bgGreen = kluer.bgGreen.bind(ctx);
	ctx.bgYellow = kluer.bgYellow.bind(ctx);
	ctx.bgBlue = kluer.bgBlue.bind(ctx);
	ctx.bgMagenta = kluer.bgMagenta.bind(ctx);
	ctx.bgCyan = kluer.bgCyan.bind(ctx);
	ctx.bgWhite = kluer.bgWhite.bind(ctx);

	return ctx;
}

function init(open, close) {
	let blk = {
		open: `\x1b[${open}m`,
		close: `\x1b[${close}m`,
		rgx: new RegExp(`\\x1b\\[${close}m`, 'g')
	};
	return function (txt?) {
		if (this !== void 0 && this.has !== void 0) {
			this.has.includes(open) || (this.has.push(open),this.keys.push(blk));
			return txt === void 0 ? this : kluer.enabled ? run(this.keys, txt+'') : txt+'';
		}
		return txt === void 0 ? chain([open], [blk]) : kluer.enabled ? run([blk], txt+'') : txt+'';
	};
}

export {kluer , kluer as kleur, kluer as chalk , kluer as colors , kluer as clc}
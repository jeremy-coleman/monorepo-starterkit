'use strict';

const generate = require('./regjsgen').generate;
const parse = require('./regjsparser').parse;
const regenerate = require('./regenerate');


/* -------------------------------------------------------------------------- */
/*                                  datasets                                  */
/* -------------------------------------------------------------------------- */

const ESCAPE_SETS = {
	REGULAR: new Map([
	['d', regenerate()
		.addRange(0x30, 0x39)],
	['D', regenerate()
		.addRange(0x0, 0x2F)
		.addRange(0x3A, 0xFFFF)],
	['s', regenerate(0x20, 0xA0, 0x1680, 0x202F, 0x205F, 0x3000, 0xFEFF)
		.addRange(0x9, 0xD)
		.addRange(0x2000, 0x200A)
		.addRange(0x2028, 0x2029)],
	['S', regenerate()
		.addRange(0x0, 0x8)
		.addRange(0xE, 0x1F)
		.addRange(0x21, 0x9F)
		.addRange(0xA1, 0x167F)
		.addRange(0x1681, 0x1FFF)
		.addRange(0x200B, 0x2027)
		.addRange(0x202A, 0x202E)
		.addRange(0x2030, 0x205E)
		.addRange(0x2060, 0x2FFF)
		.addRange(0x3001, 0xFEFE)
		.addRange(0xFF00, 0xFFFF)],
	['w', regenerate(0x5F)
		.addRange(0x30, 0x39)
		.addRange(0x41, 0x5A)
		.addRange(0x61, 0x7A)],
	['W', regenerate(0x60)
		.addRange(0x0, 0x2F)
		.addRange(0x3A, 0x40)
		.addRange(0x5B, 0x5E)
		.addRange(0x7B, 0xFFFF)]
]),
UNICODE: new Map([
	['d', regenerate()
		.addRange(0x30, 0x39)],
	['D', regenerate()
		.addRange(0x0, 0x2F)
		.addRange(0x3A, 0x10FFFF)],
	['s', regenerate(0x20, 0xA0, 0x1680, 0x202F, 0x205F, 0x3000, 0xFEFF)
		.addRange(0x9, 0xD)
		.addRange(0x2000, 0x200A)
		.addRange(0x2028, 0x2029)],
	['S', regenerate()
		.addRange(0x0, 0x8)
		.addRange(0xE, 0x1F)
		.addRange(0x21, 0x9F)
		.addRange(0xA1, 0x167F)
		.addRange(0x1681, 0x1FFF)
		.addRange(0x200B, 0x2027)
		.addRange(0x202A, 0x202E)
		.addRange(0x2030, 0x205E)
		.addRange(0x2060, 0x2FFF)
		.addRange(0x3001, 0xFEFE)
		.addRange(0xFF00, 0x10FFFF)],
	['w', regenerate(0x5F)
		.addRange(0x30, 0x39)
		.addRange(0x41, 0x5A)
		.addRange(0x61, 0x7A)],
	['W', regenerate(0x60)
		.addRange(0x0, 0x2F)
		.addRange(0x3A, 0x40)
		.addRange(0x5B, 0x5E)
		.addRange(0x7B, 0x10FFFF)]
]),
UNICODE_IGNORE_CASE: new Map([
	['d', regenerate()
		.addRange(0x30, 0x39)],
	['D', regenerate()
		.addRange(0x0, 0x2F)
		.addRange(0x3A, 0x10FFFF)],
	['s', regenerate(0x20, 0xA0, 0x1680, 0x202F, 0x205F, 0x3000, 0xFEFF)
		.addRange(0x9, 0xD)
		.addRange(0x2000, 0x200A)
		.addRange(0x2028, 0x2029)],
	['S', regenerate()
		.addRange(0x0, 0x8)
		.addRange(0xE, 0x1F)
		.addRange(0x21, 0x9F)
		.addRange(0xA1, 0x167F)
		.addRange(0x1681, 0x1FFF)
		.addRange(0x200B, 0x2027)
		.addRange(0x202A, 0x202E)
		.addRange(0x2030, 0x205E)
		.addRange(0x2060, 0x2FFF)
		.addRange(0x3001, 0xFEFE)
		.addRange(0xFF00, 0x10FFFF)],
	['w', regenerate(0x5F, 0x17F, 0x212A)
		.addRange(0x30, 0x39)
		.addRange(0x41, 0x5A)
		.addRange(0x61, 0x7A)],
	['W', regenerate(0x60)
		.addRange(0x0, 0x2F)
		.addRange(0x3A, 0x40)
		.addRange(0x5B, 0x5E)
		.addRange(0x7B, 0x17E)
		.addRange(0x180, 0x2129)
		.addRange(0x212B, 0x10FFFF)]
])
}

const iuMappings = new Map([
	[0x4B, 0x212A],
	[0x53, 0x17F],
	[0x6B, 0x212A],
	[0x73, 0x17F],
	[0xB5, 0x39C],
	[0xC5, 0x212B],
	[0xDF, 0x1E9E],
	[0xE5, 0x212B],
	[0x17F, 0x53],
	[0x1C4, 0x1C5],
	[0x1C5, 0x1C4],
	[0x1C7, 0x1C8],
	[0x1C8, 0x1C7],
	[0x1CA, 0x1CB],
	[0x1CB, 0x1CA],
	[0x1F1, 0x1F2],
	[0x1F2, 0x1F1],
	[0x26A, 0xA7AE],
	[0x282, 0xA7C5],
	[0x29D, 0xA7B2],
	[0x345, 0x1FBE],
	[0x392, 0x3D0],
	[0x395, 0x3F5],
	[0x398, 0x3F4],
	[0x399, 0x1FBE],
	[0x39A, 0x3F0],
	[0x39C, 0xB5],
	[0x3A0, 0x3D6],
	[0x3A1, 0x3F1],
	[0x3A3, 0x3C2],
	[0x3A6, 0x3D5],
	[0x3A9, 0x2126],
	[0x3B8, 0x3F4],
	[0x3C2, 0x3A3],
	[0x3C9, 0x2126],
	[0x3D0, 0x392],
	[0x3D1, 0x3F4],
	[0x3D5, 0x3A6],
	[0x3D6, 0x3A0],
	[0x3F0, 0x39A],
	[0x3F1, 0x3A1],
	[0x3F4, [
		0x398,
		0x3D1,
		0x3B8
	]],
	[0x3F5, 0x395],
	[0x412, 0x1C80],
	[0x414, 0x1C81],
	[0x41E, 0x1C82],
	[0x421, 0x1C83],
	[0x422, 0x1C85],
	[0x42A, 0x1C86],
	[0x432, 0x1C80],
	[0x434, 0x1C81],
	[0x43E, 0x1C82],
	[0x441, 0x1C83],
	[0x442, [
		0x1C84,
		0x1C85
	]],
	[0x44A, 0x1C86],
	[0x462, 0x1C87],
	[0x463, 0x1C87],
	[0x10D0, 0x1C90],
	[0x10D1, 0x1C91],
	[0x10D2, 0x1C92],
	[0x10D3, 0x1C93],
	[0x10D4, 0x1C94],
	[0x10D5, 0x1C95],
	[0x10D6, 0x1C96],
	[0x10D7, 0x1C97],
	[0x10D8, 0x1C98],
	[0x10D9, 0x1C99],
	[0x10DA, 0x1C9A],
	[0x10DB, 0x1C9B],
	[0x10DC, 0x1C9C],
	[0x10DD, 0x1C9D],
	[0x10DE, 0x1C9E],
	[0x10DF, 0x1C9F],
	[0x10E0, 0x1CA0],
	[0x10E1, 0x1CA1],
	[0x10E2, 0x1CA2],
	[0x10E3, 0x1CA3],
	[0x10E4, 0x1CA4],
	[0x10E5, 0x1CA5],
	[0x10E6, 0x1CA6],
	[0x10E7, 0x1CA7],
	[0x10E8, 0x1CA8],
	[0x10E9, 0x1CA9],
	[0x10EA, 0x1CAA],
	[0x10EB, 0x1CAB],
	[0x10EC, 0x1CAC],
	[0x10ED, 0x1CAD],
	[0x10EE, 0x1CAE],
	[0x10EF, 0x1CAF],
	[0x10F0, 0x1CB0],
	[0x10F1, 0x1CB1],
	[0x10F2, 0x1CB2],
	[0x10F3, 0x1CB3],
	[0x10F4, 0x1CB4],
	[0x10F5, 0x1CB5],
	[0x10F6, 0x1CB6],
	[0x10F7, 0x1CB7],
	[0x10F8, 0x1CB8],
	[0x10F9, 0x1CB9],
	[0x10FA, 0x1CBA],
	[0x10FD, 0x1CBD],
	[0x10FE, 0x1CBE],
	[0x10FF, 0x1CBF],
	[0x13A0, 0xAB70],
	[0x13A1, 0xAB71],
	[0x13A2, 0xAB72],
	[0x13A3, 0xAB73],
	[0x13A4, 0xAB74],
	[0x13A5, 0xAB75],
	[0x13A6, 0xAB76],
	[0x13A7, 0xAB77],
	[0x13A8, 0xAB78],
	[0x13A9, 0xAB79],
	[0x13AA, 0xAB7A],
	[0x13AB, 0xAB7B],
	[0x13AC, 0xAB7C],
	[0x13AD, 0xAB7D],
	[0x13AE, 0xAB7E],
	[0x13AF, 0xAB7F],
	[0x13B0, 0xAB80],
	[0x13B1, 0xAB81],
	[0x13B2, 0xAB82],
	[0x13B3, 0xAB83],
	[0x13B4, 0xAB84],
	[0x13B5, 0xAB85],
	[0x13B6, 0xAB86],
	[0x13B7, 0xAB87],
	[0x13B8, 0xAB88],
	[0x13B9, 0xAB89],
	[0x13BA, 0xAB8A],
	[0x13BB, 0xAB8B],
	[0x13BC, 0xAB8C],
	[0x13BD, 0xAB8D],
	[0x13BE, 0xAB8E],
	[0x13BF, 0xAB8F],
	[0x13C0, 0xAB90],
	[0x13C1, 0xAB91],
	[0x13C2, 0xAB92],
	[0x13C3, 0xAB93],
	[0x13C4, 0xAB94],
	[0x13C5, 0xAB95],
	[0x13C6, 0xAB96],
	[0x13C7, 0xAB97],
	[0x13C8, 0xAB98],
	[0x13C9, 0xAB99],
	[0x13CA, 0xAB9A],
	[0x13CB, 0xAB9B],
	[0x13CC, 0xAB9C],
	[0x13CD, 0xAB9D],
	[0x13CE, 0xAB9E],
	[0x13CF, 0xAB9F],
	[0x13D0, 0xABA0],
	[0x13D1, 0xABA1],
	[0x13D2, 0xABA2],
	[0x13D3, 0xABA3],
	[0x13D4, 0xABA4],
	[0x13D5, 0xABA5],
	[0x13D6, 0xABA6],
	[0x13D7, 0xABA7],
	[0x13D8, 0xABA8],
	[0x13D9, 0xABA9],
	[0x13DA, 0xABAA],
	[0x13DB, 0xABAB],
	[0x13DC, 0xABAC],
	[0x13DD, 0xABAD],
	[0x13DE, 0xABAE],
	[0x13DF, 0xABAF],
	[0x13E0, 0xABB0],
	[0x13E1, 0xABB1],
	[0x13E2, 0xABB2],
	[0x13E3, 0xABB3],
	[0x13E4, 0xABB4],
	[0x13E5, 0xABB5],
	[0x13E6, 0xABB6],
	[0x13E7, 0xABB7],
	[0x13E8, 0xABB8],
	[0x13E9, 0xABB9],
	[0x13EA, 0xABBA],
	[0x13EB, 0xABBB],
	[0x13EC, 0xABBC],
	[0x13ED, 0xABBD],
	[0x13EE, 0xABBE],
	[0x13EF, 0xABBF],
	[0x13F0, 0x13F8],
	[0x13F1, 0x13F9],
	[0x13F2, 0x13FA],
	[0x13F3, 0x13FB],
	[0x13F4, 0x13FC],
	[0x13F5, 0x13FD],
	[0x13F8, 0x13F0],
	[0x13F9, 0x13F1],
	[0x13FA, 0x13F2],
	[0x13FB, 0x13F3],
	[0x13FC, 0x13F4],
	[0x13FD, 0x13F5],
	[0x1C80, [
		0x412,
		0x432
	]],
	[0x1C81, [
		0x414,
		0x434
	]],
	[0x1C82, [
		0x41E,
		0x43E
	]],
	[0x1C83, [
		0x421,
		0x441
	]],
	[0x1C84, [
		0x1C85,
		0x442
	]],
	[0x1C85, [
		0x422,
		0x1C84,
		0x442
	]],
	[0x1C86, [
		0x42A,
		0x44A
	]],
	[0x1C87, [
		0x462,
		0x463
	]],
	[0x1C88, [
		0xA64A,
		0xA64B
	]],
	[0x1C90, 0x10D0],
	[0x1C91, 0x10D1],
	[0x1C92, 0x10D2],
	[0x1C93, 0x10D3],
	[0x1C94, 0x10D4],
	[0x1C95, 0x10D5],
	[0x1C96, 0x10D6],
	[0x1C97, 0x10D7],
	[0x1C98, 0x10D8],
	[0x1C99, 0x10D9],
	[0x1C9A, 0x10DA],
	[0x1C9B, 0x10DB],
	[0x1C9C, 0x10DC],
	[0x1C9D, 0x10DD],
	[0x1C9E, 0x10DE],
	[0x1C9F, 0x10DF],
	[0x1CA0, 0x10E0],
	[0x1CA1, 0x10E1],
	[0x1CA2, 0x10E2],
	[0x1CA3, 0x10E3],
	[0x1CA4, 0x10E4],
	[0x1CA5, 0x10E5],
	[0x1CA6, 0x10E6],
	[0x1CA7, 0x10E7],
	[0x1CA8, 0x10E8],
	[0x1CA9, 0x10E9],
	[0x1CAA, 0x10EA],
	[0x1CAB, 0x10EB],
	[0x1CAC, 0x10EC],
	[0x1CAD, 0x10ED],
	[0x1CAE, 0x10EE],
	[0x1CAF, 0x10EF],
	[0x1CB0, 0x10F0],
	[0x1CB1, 0x10F1],
	[0x1CB2, 0x10F2],
	[0x1CB3, 0x10F3],
	[0x1CB4, 0x10F4],
	[0x1CB5, 0x10F5],
	[0x1CB6, 0x10F6],
	[0x1CB7, 0x10F7],
	[0x1CB8, 0x10F8],
	[0x1CB9, 0x10F9],
	[0x1CBA, 0x10FA],
	[0x1CBD, 0x10FD],
	[0x1CBE, 0x10FE],
	[0x1CBF, 0x10FF],
	[0x1D8E, 0xA7C6],
	[0x1E60, 0x1E9B],
	[0x1E9B, 0x1E60],
	[0x1E9E, 0xDF],
	[0x1F80, 0x1F88],
	[0x1F81, 0x1F89],
	[0x1F82, 0x1F8A],
	[0x1F83, 0x1F8B],
	[0x1F84, 0x1F8C],
	[0x1F85, 0x1F8D],
	[0x1F86, 0x1F8E],
	[0x1F87, 0x1F8F],
	[0x1F88, 0x1F80],
	[0x1F89, 0x1F81],
	[0x1F8A, 0x1F82],
	[0x1F8B, 0x1F83],
	[0x1F8C, 0x1F84],
	[0x1F8D, 0x1F85],
	[0x1F8E, 0x1F86],
	[0x1F8F, 0x1F87],
	[0x1F90, 0x1F98],
	[0x1F91, 0x1F99],
	[0x1F92, 0x1F9A],
	[0x1F93, 0x1F9B],
	[0x1F94, 0x1F9C],
	[0x1F95, 0x1F9D],
	[0x1F96, 0x1F9E],
	[0x1F97, 0x1F9F],
	[0x1F98, 0x1F90],
	[0x1F99, 0x1F91],
	[0x1F9A, 0x1F92],
	[0x1F9B, 0x1F93],
	[0x1F9C, 0x1F94],
	[0x1F9D, 0x1F95],
	[0x1F9E, 0x1F96],
	[0x1F9F, 0x1F97],
	[0x1FA0, 0x1FA8],
	[0x1FA1, 0x1FA9],
	[0x1FA2, 0x1FAA],
	[0x1FA3, 0x1FAB],
	[0x1FA4, 0x1FAC],
	[0x1FA5, 0x1FAD],
	[0x1FA6, 0x1FAE],
	[0x1FA7, 0x1FAF],
	[0x1FA8, 0x1FA0],
	[0x1FA9, 0x1FA1],
	[0x1FAA, 0x1FA2],
	[0x1FAB, 0x1FA3],
	[0x1FAC, 0x1FA4],
	[0x1FAD, 0x1FA5],
	[0x1FAE, 0x1FA6],
	[0x1FAF, 0x1FA7],
	[0x1FB3, 0x1FBC],
	[0x1FBC, 0x1FB3],
	[0x1FBE, [
		0x345,
		0x399
	]],
	[0x1FC3, 0x1FCC],
	[0x1FCC, 0x1FC3],
	[0x1FF3, 0x1FFC],
	[0x1FFC, 0x1FF3],
	[0x2126, [
		0x3A9,
		0x3C9
	]],
	[0x212A, 0x4B],
	[0x212B, [
		0xC5,
		0xE5
	]],
	[0xA64A, 0x1C88],
	[0xA64B, 0x1C88],
	[0xA794, 0xA7C4],
	[0xA7AE, 0x26A],
	[0xA7B2, 0x29D],
	[0xA7B3, 0xAB53],
	[0xA7B4, 0xA7B5],
	[0xA7B5, 0xA7B4],
	[0xA7B6, 0xA7B7],
	[0xA7B7, 0xA7B6],
	[0xA7B8, 0xA7B9],
	[0xA7B9, 0xA7B8],
	[0xA7BA, 0xA7BB],
	[0xA7BB, 0xA7BA],
	[0xA7BC, 0xA7BD],
	[0xA7BD, 0xA7BC],
	[0xA7BE, 0xA7BF],
	[0xA7BF, 0xA7BE],
	[0xA7C2, 0xA7C3],
	[0xA7C3, 0xA7C2],
	[0xA7C4, 0xA794],
	[0xA7C5, 0x282],
	[0xA7C6, 0x1D8E],
	[0xAB53, 0xA7B3],
	[0xAB70, 0x13A0],
	[0xAB71, 0x13A1],
	[0xAB72, 0x13A2],
	[0xAB73, 0x13A3],
	[0xAB74, 0x13A4],
	[0xAB75, 0x13A5],
	[0xAB76, 0x13A6],
	[0xAB77, 0x13A7],
	[0xAB78, 0x13A8],
	[0xAB79, 0x13A9],
	[0xAB7A, 0x13AA],
	[0xAB7B, 0x13AB],
	[0xAB7C, 0x13AC],
	[0xAB7D, 0x13AD],
	[0xAB7E, 0x13AE],
	[0xAB7F, 0x13AF],
	[0xAB80, 0x13B0],
	[0xAB81, 0x13B1],
	[0xAB82, 0x13B2],
	[0xAB83, 0x13B3],
	[0xAB84, 0x13B4],
	[0xAB85, 0x13B5],
	[0xAB86, 0x13B6],
	[0xAB87, 0x13B7],
	[0xAB88, 0x13B8],
	[0xAB89, 0x13B9],
	[0xAB8A, 0x13BA],
	[0xAB8B, 0x13BB],
	[0xAB8C, 0x13BC],
	[0xAB8D, 0x13BD],
	[0xAB8E, 0x13BE],
	[0xAB8F, 0x13BF],
	[0xAB90, 0x13C0],
	[0xAB91, 0x13C1],
	[0xAB92, 0x13C2],
	[0xAB93, 0x13C3],
	[0xAB94, 0x13C4],
	[0xAB95, 0x13C5],
	[0xAB96, 0x13C6],
	[0xAB97, 0x13C7],
	[0xAB98, 0x13C8],
	[0xAB99, 0x13C9],
	[0xAB9A, 0x13CA],
	[0xAB9B, 0x13CB],
	[0xAB9C, 0x13CC],
	[0xAB9D, 0x13CD],
	[0xAB9E, 0x13CE],
	[0xAB9F, 0x13CF],
	[0xABA0, 0x13D0],
	[0xABA1, 0x13D1],
	[0xABA2, 0x13D2],
	[0xABA3, 0x13D3],
	[0xABA4, 0x13D4],
	[0xABA5, 0x13D5],
	[0xABA6, 0x13D6],
	[0xABA7, 0x13D7],
	[0xABA8, 0x13D8],
	[0xABA9, 0x13D9],
	[0xABAA, 0x13DA],
	[0xABAB, 0x13DB],
	[0xABAC, 0x13DC],
	[0xABAD, 0x13DD],
	[0xABAE, 0x13DE],
	[0xABAF, 0x13DF],
	[0xABB0, 0x13E0],
	[0xABB1, 0x13E1],
	[0xABB2, 0x13E2],
	[0xABB3, 0x13E3],
	[0xABB4, 0x13E4],
	[0xABB5, 0x13E5],
	[0xABB6, 0x13E6],
	[0xABB7, 0x13E7],
	[0xABB8, 0x13E8],
	[0xABB9, 0x13E9],
	[0xABBA, 0x13EA],
	[0xABBB, 0x13EB],
	[0xABBC, 0x13EC],
	[0xABBD, 0x13ED],
	[0xABBE, 0x13EE],
	[0xABBF, 0x13EF],
	[0x10400, 0x10428],
	[0x10401, 0x10429],
	[0x10402, 0x1042A],
	[0x10403, 0x1042B],
	[0x10404, 0x1042C],
	[0x10405, 0x1042D],
	[0x10406, 0x1042E],
	[0x10407, 0x1042F],
	[0x10408, 0x10430],
	[0x10409, 0x10431],
	[0x1040A, 0x10432],
	[0x1040B, 0x10433],
	[0x1040C, 0x10434],
	[0x1040D, 0x10435],
	[0x1040E, 0x10436],
	[0x1040F, 0x10437],
	[0x10410, 0x10438],
	[0x10411, 0x10439],
	[0x10412, 0x1043A],
	[0x10413, 0x1043B],
	[0x10414, 0x1043C],
	[0x10415, 0x1043D],
	[0x10416, 0x1043E],
	[0x10417, 0x1043F],
	[0x10418, 0x10440],
	[0x10419, 0x10441],
	[0x1041A, 0x10442],
	[0x1041B, 0x10443],
	[0x1041C, 0x10444],
	[0x1041D, 0x10445],
	[0x1041E, 0x10446],
	[0x1041F, 0x10447],
	[0x10420, 0x10448],
	[0x10421, 0x10449],
	[0x10422, 0x1044A],
	[0x10423, 0x1044B],
	[0x10424, 0x1044C],
	[0x10425, 0x1044D],
	[0x10426, 0x1044E],
	[0x10427, 0x1044F],
	[0x10428, 0x10400],
	[0x10429, 0x10401],
	[0x1042A, 0x10402],
	[0x1042B, 0x10403],
	[0x1042C, 0x10404],
	[0x1042D, 0x10405],
	[0x1042E, 0x10406],
	[0x1042F, 0x10407],
	[0x10430, 0x10408],
	[0x10431, 0x10409],
	[0x10432, 0x1040A],
	[0x10433, 0x1040B],
	[0x10434, 0x1040C],
	[0x10435, 0x1040D],
	[0x10436, 0x1040E],
	[0x10437, 0x1040F],
	[0x10438, 0x10410],
	[0x10439, 0x10411],
	[0x1043A, 0x10412],
	[0x1043B, 0x10413],
	[0x1043C, 0x10414],
	[0x1043D, 0x10415],
	[0x1043E, 0x10416],
	[0x1043F, 0x10417],
	[0x10440, 0x10418],
	[0x10441, 0x10419],
	[0x10442, 0x1041A],
	[0x10443, 0x1041B],
	[0x10444, 0x1041C],
	[0x10445, 0x1041D],
	[0x10446, 0x1041E],
	[0x10447, 0x1041F],
	[0x10448, 0x10420],
	[0x10449, 0x10421],
	[0x1044A, 0x10422],
	[0x1044B, 0x10423],
	[0x1044C, 0x10424],
	[0x1044D, 0x10425],
	[0x1044E, 0x10426],
	[0x1044F, 0x10427],
	[0x104B0, 0x104D8],
	[0x104B1, 0x104D9],
	[0x104B2, 0x104DA],
	[0x104B3, 0x104DB],
	[0x104B4, 0x104DC],
	[0x104B5, 0x104DD],
	[0x104B6, 0x104DE],
	[0x104B7, 0x104DF],
	[0x104B8, 0x104E0],
	[0x104B9, 0x104E1],
	[0x104BA, 0x104E2],
	[0x104BB, 0x104E3],
	[0x104BC, 0x104E4],
	[0x104BD, 0x104E5],
	[0x104BE, 0x104E6],
	[0x104BF, 0x104E7],
	[0x104C0, 0x104E8],
	[0x104C1, 0x104E9],
	[0x104C2, 0x104EA],
	[0x104C3, 0x104EB],
	[0x104C4, 0x104EC],
	[0x104C5, 0x104ED],
	[0x104C6, 0x104EE],
	[0x104C7, 0x104EF],
	[0x104C8, 0x104F0],
	[0x104C9, 0x104F1],
	[0x104CA, 0x104F2],
	[0x104CB, 0x104F3],
	[0x104CC, 0x104F4],
	[0x104CD, 0x104F5],
	[0x104CE, 0x104F6],
	[0x104CF, 0x104F7],
	[0x104D0, 0x104F8],
	[0x104D1, 0x104F9],
	[0x104D2, 0x104FA],
	[0x104D3, 0x104FB],
	[0x104D8, 0x104B0],
	[0x104D9, 0x104B1],
	[0x104DA, 0x104B2],
	[0x104DB, 0x104B3],
	[0x104DC, 0x104B4],
	[0x104DD, 0x104B5],
	[0x104DE, 0x104B6],
	[0x104DF, 0x104B7],
	[0x104E0, 0x104B8],
	[0x104E1, 0x104B9],
	[0x104E2, 0x104BA],
	[0x104E3, 0x104BB],
	[0x104E4, 0x104BC],
	[0x104E5, 0x104BD],
	[0x104E6, 0x104BE],
	[0x104E7, 0x104BF],
	[0x104E8, 0x104C0],
	[0x104E9, 0x104C1],
	[0x104EA, 0x104C2],
	[0x104EB, 0x104C3],
	[0x104EC, 0x104C4],
	[0x104ED, 0x104C5],
	[0x104EE, 0x104C6],
	[0x104EF, 0x104C7],
	[0x104F0, 0x104C8],
	[0x104F1, 0x104C9],
	[0x104F2, 0x104CA],
	[0x104F3, 0x104CB],
	[0x104F4, 0x104CC],
	[0x104F5, 0x104CD],
	[0x104F6, 0x104CE],
	[0x104F7, 0x104CF],
	[0x104F8, 0x104D0],
	[0x104F9, 0x104D1],
	[0x104FA, 0x104D2],
	[0x104FB, 0x104D3],
	[0x10C80, 0x10CC0],
	[0x10C81, 0x10CC1],
	[0x10C82, 0x10CC2],
	[0x10C83, 0x10CC3],
	[0x10C84, 0x10CC4],
	[0x10C85, 0x10CC5],
	[0x10C86, 0x10CC6],
	[0x10C87, 0x10CC7],
	[0x10C88, 0x10CC8],
	[0x10C89, 0x10CC9],
	[0x10C8A, 0x10CCA],
	[0x10C8B, 0x10CCB],
	[0x10C8C, 0x10CCC],
	[0x10C8D, 0x10CCD],
	[0x10C8E, 0x10CCE],
	[0x10C8F, 0x10CCF],
	[0x10C90, 0x10CD0],
	[0x10C91, 0x10CD1],
	[0x10C92, 0x10CD2],
	[0x10C93, 0x10CD3],
	[0x10C94, 0x10CD4],
	[0x10C95, 0x10CD5],
	[0x10C96, 0x10CD6],
	[0x10C97, 0x10CD7],
	[0x10C98, 0x10CD8],
	[0x10C99, 0x10CD9],
	[0x10C9A, 0x10CDA],
	[0x10C9B, 0x10CDB],
	[0x10C9C, 0x10CDC],
	[0x10C9D, 0x10CDD],
	[0x10C9E, 0x10CDE],
	[0x10C9F, 0x10CDF],
	[0x10CA0, 0x10CE0],
	[0x10CA1, 0x10CE1],
	[0x10CA2, 0x10CE2],
	[0x10CA3, 0x10CE3],
	[0x10CA4, 0x10CE4],
	[0x10CA5, 0x10CE5],
	[0x10CA6, 0x10CE6],
	[0x10CA7, 0x10CE7],
	[0x10CA8, 0x10CE8],
	[0x10CA9, 0x10CE9],
	[0x10CAA, 0x10CEA],
	[0x10CAB, 0x10CEB],
	[0x10CAC, 0x10CEC],
	[0x10CAD, 0x10CED],
	[0x10CAE, 0x10CEE],
	[0x10CAF, 0x10CEF],
	[0x10CB0, 0x10CF0],
	[0x10CB1, 0x10CF1],
	[0x10CB2, 0x10CF2],
	[0x10CC0, 0x10C80],
	[0x10CC1, 0x10C81],
	[0x10CC2, 0x10C82],
	[0x10CC3, 0x10C83],
	[0x10CC4, 0x10C84],
	[0x10CC5, 0x10C85],
	[0x10CC6, 0x10C86],
	[0x10CC7, 0x10C87],
	[0x10CC8, 0x10C88],
	[0x10CC9, 0x10C89],
	[0x10CCA, 0x10C8A],
	[0x10CCB, 0x10C8B],
	[0x10CCC, 0x10C8C],
	[0x10CCD, 0x10C8D],
	[0x10CCE, 0x10C8E],
	[0x10CCF, 0x10C8F],
	[0x10CD0, 0x10C90],
	[0x10CD1, 0x10C91],
	[0x10CD2, 0x10C92],
	[0x10CD3, 0x10C93],
	[0x10CD4, 0x10C94],
	[0x10CD5, 0x10C95],
	[0x10CD6, 0x10C96],
	[0x10CD7, 0x10C97],
	[0x10CD8, 0x10C98],
	[0x10CD9, 0x10C99],
	[0x10CDA, 0x10C9A],
	[0x10CDB, 0x10C9B],
	[0x10CDC, 0x10C9C],
	[0x10CDD, 0x10C9D],
	[0x10CDE, 0x10C9E],
	[0x10CDF, 0x10C9F],
	[0x10CE0, 0x10CA0],
	[0x10CE1, 0x10CA1],
	[0x10CE2, 0x10CA2],
	[0x10CE3, 0x10CA3],
	[0x10CE4, 0x10CA4],
	[0x10CE5, 0x10CA5],
	[0x10CE6, 0x10CA6],
	[0x10CE7, 0x10CA7],
	[0x10CE8, 0x10CA8],
	[0x10CE9, 0x10CA9],
	[0x10CEA, 0x10CAA],
	[0x10CEB, 0x10CAB],
	[0x10CEC, 0x10CAC],
	[0x10CED, 0x10CAD],
	[0x10CEE, 0x10CAE],
	[0x10CEF, 0x10CAF],
	[0x10CF0, 0x10CB0],
	[0x10CF1, 0x10CB1],
	[0x10CF2, 0x10CB2],
	[0x118A0, 0x118C0],
	[0x118A1, 0x118C1],
	[0x118A2, 0x118C2],
	[0x118A3, 0x118C3],
	[0x118A4, 0x118C4],
	[0x118A5, 0x118C5],
	[0x118A6, 0x118C6],
	[0x118A7, 0x118C7],
	[0x118A8, 0x118C8],
	[0x118A9, 0x118C9],
	[0x118AA, 0x118CA],
	[0x118AB, 0x118CB],
	[0x118AC, 0x118CC],
	[0x118AD, 0x118CD],
	[0x118AE, 0x118CE],
	[0x118AF, 0x118CF],
	[0x118B0, 0x118D0],
	[0x118B1, 0x118D1],
	[0x118B2, 0x118D2],
	[0x118B3, 0x118D3],
	[0x118B4, 0x118D4],
	[0x118B5, 0x118D5],
	[0x118B6, 0x118D6],
	[0x118B7, 0x118D7],
	[0x118B8, 0x118D8],
	[0x118B9, 0x118D9],
	[0x118BA, 0x118DA],
	[0x118BB, 0x118DB],
	[0x118BC, 0x118DC],
	[0x118BD, 0x118DD],
	[0x118BE, 0x118DE],
	[0x118BF, 0x118DF],
	[0x118C0, 0x118A0],
	[0x118C1, 0x118A1],
	[0x118C2, 0x118A2],
	[0x118C3, 0x118A3],
	[0x118C4, 0x118A4],
	[0x118C5, 0x118A5],
	[0x118C6, 0x118A6],
	[0x118C7, 0x118A7],
	[0x118C8, 0x118A8],
	[0x118C9, 0x118A9],
	[0x118CA, 0x118AA],
	[0x118CB, 0x118AB],
	[0x118CC, 0x118AC],
	[0x118CD, 0x118AD],
	[0x118CE, 0x118AE],
	[0x118CF, 0x118AF],
	[0x118D0, 0x118B0],
	[0x118D1, 0x118B1],
	[0x118D2, 0x118B2],
	[0x118D3, 0x118B3],
	[0x118D4, 0x118B4],
	[0x118D5, 0x118B5],
	[0x118D6, 0x118B6],
	[0x118D7, 0x118B7],
	[0x118D8, 0x118B8],
	[0x118D9, 0x118B9],
	[0x118DA, 0x118BA],
	[0x118DB, 0x118BB],
	[0x118DC, 0x118BC],
	[0x118DD, 0x118BD],
	[0x118DE, 0x118BE],
	[0x118DF, 0x118BF],
	[0x16E40, 0x16E60],
	[0x16E41, 0x16E61],
	[0x16E42, 0x16E62],
	[0x16E43, 0x16E63],
	[0x16E44, 0x16E64],
	[0x16E45, 0x16E65],
	[0x16E46, 0x16E66],
	[0x16E47, 0x16E67],
	[0x16E48, 0x16E68],
	[0x16E49, 0x16E69],
	[0x16E4A, 0x16E6A],
	[0x16E4B, 0x16E6B],
	[0x16E4C, 0x16E6C],
	[0x16E4D, 0x16E6D],
	[0x16E4E, 0x16E6E],
	[0x16E4F, 0x16E6F],
	[0x16E50, 0x16E70],
	[0x16E51, 0x16E71],
	[0x16E52, 0x16E72],
	[0x16E53, 0x16E73],
	[0x16E54, 0x16E74],
	[0x16E55, 0x16E75],
	[0x16E56, 0x16E76],
	[0x16E57, 0x16E77],
	[0x16E58, 0x16E78],
	[0x16E59, 0x16E79],
	[0x16E5A, 0x16E7A],
	[0x16E5B, 0x16E7B],
	[0x16E5C, 0x16E7C],
	[0x16E5D, 0x16E7D],
	[0x16E5E, 0x16E7E],
	[0x16E5F, 0x16E7F],
	[0x16E60, 0x16E40],
	[0x16E61, 0x16E41],
	[0x16E62, 0x16E42],
	[0x16E63, 0x16E43],
	[0x16E64, 0x16E44],
	[0x16E65, 0x16E45],
	[0x16E66, 0x16E46],
	[0x16E67, 0x16E47],
	[0x16E68, 0x16E48],
	[0x16E69, 0x16E49],
	[0x16E6A, 0x16E4A],
	[0x16E6B, 0x16E4B],
	[0x16E6C, 0x16E4C],
	[0x16E6D, 0x16E4D],
	[0x16E6E, 0x16E4E],
	[0x16E6F, 0x16E4F],
	[0x16E70, 0x16E50],
	[0x16E71, 0x16E51],
	[0x16E72, 0x16E52],
	[0x16E73, 0x16E53],
	[0x16E74, 0x16E54],
	[0x16E75, 0x16E55],
	[0x16E76, 0x16E56],
	[0x16E77, 0x16E57],
	[0x16E78, 0x16E58],
	[0x16E79, 0x16E59],
	[0x16E7A, 0x16E5A],
	[0x16E7B, 0x16E5B],
	[0x16E7C, 0x16E5C],
	[0x16E7D, 0x16E5D],
	[0x16E7E, 0x16E5E],
	[0x16E7F, 0x16E5F],
	[0x1E900, 0x1E922],
	[0x1E901, 0x1E923],
	[0x1E902, 0x1E924],
	[0x1E903, 0x1E925],
	[0x1E904, 0x1E926],
	[0x1E905, 0x1E927],
	[0x1E906, 0x1E928],
	[0x1E907, 0x1E929],
	[0x1E908, 0x1E92A],
	[0x1E909, 0x1E92B],
	[0x1E90A, 0x1E92C],
	[0x1E90B, 0x1E92D],
	[0x1E90C, 0x1E92E],
	[0x1E90D, 0x1E92F],
	[0x1E90E, 0x1E930],
	[0x1E90F, 0x1E931],
	[0x1E910, 0x1E932],
	[0x1E911, 0x1E933],
	[0x1E912, 0x1E934],
	[0x1E913, 0x1E935],
	[0x1E914, 0x1E936],
	[0x1E915, 0x1E937],
	[0x1E916, 0x1E938],
	[0x1E917, 0x1E939],
	[0x1E918, 0x1E93A],
	[0x1E919, 0x1E93B],
	[0x1E91A, 0x1E93C],
	[0x1E91B, 0x1E93D],
	[0x1E91C, 0x1E93E],
	[0x1E91D, 0x1E93F],
	[0x1E91E, 0x1E940],
	[0x1E91F, 0x1E941],
	[0x1E920, 0x1E942],
	[0x1E921, 0x1E943],
	[0x1E922, 0x1E900],
	[0x1E923, 0x1E901],
	[0x1E924, 0x1E902],
	[0x1E925, 0x1E903],
	[0x1E926, 0x1E904],
	[0x1E927, 0x1E905],
	[0x1E928, 0x1E906],
	[0x1E929, 0x1E907],
	[0x1E92A, 0x1E908],
	[0x1E92B, 0x1E909],
	[0x1E92C, 0x1E90A],
	[0x1E92D, 0x1E90B],
	[0x1E92E, 0x1E90C],
	[0x1E92F, 0x1E90D],
	[0x1E930, 0x1E90E],
	[0x1E931, 0x1E90F],
	[0x1E932, 0x1E910],
	[0x1E933, 0x1E911],
	[0x1E934, 0x1E912],
	[0x1E935, 0x1E913],
	[0x1E936, 0x1E914],
	[0x1E937, 0x1E915],
	[0x1E938, 0x1E916],
	[0x1E939, 0x1E917],
	[0x1E93A, 0x1E918],
	[0x1E93B, 0x1E919],
	[0x1E93C, 0x1E91A],
	[0x1E93D, 0x1E91B],
	[0x1E93E, 0x1E91C],
	[0x1E93F, 0x1E91D],
	[0x1E940, 0x1E91E],
	[0x1E941, 0x1E91F],
	[0x1E942, 0x1E920],
	[0x1E943, 0x1E921]
]);


const canonicalProperties = new Set([
	// Non-binary properties:
	'General_Category',
	'Script',
	'Script_Extensions',
	// Binary properties:
	'Alphabetic',
	'Any',
	'ASCII',
	'ASCII_Hex_Digit',
	'Assigned',
	'Bidi_Control',
	'Bidi_Mirrored',
	'Case_Ignorable',
	'Cased',
	'Changes_When_Casefolded',
	'Changes_When_Casemapped',
	'Changes_When_Lowercased',
	'Changes_When_NFKC_Casefolded',
	'Changes_When_Titlecased',
	'Changes_When_Uppercased',
	'Dash',
	'Default_Ignorable_Code_Point',
	'Deprecated',
	'Diacritic',
	'Emoji',
	'Emoji_Component',
	'Emoji_Modifier',
	'Emoji_Modifier_Base',
	'Emoji_Presentation',
	'Extended_Pictographic',
	'Extender',
	'Grapheme_Base',
	'Grapheme_Extend',
	'Hex_Digit',
	'ID_Continue',
	'ID_Start',
	'Ideographic',
	'IDS_Binary_Operator',
	'IDS_Trinary_Operator',
	'Join_Control',
	'Logical_Order_Exception',
	'Lowercase',
	'Math',
	'Noncharacter_Code_Point',
	'Pattern_Syntax',
	'Pattern_White_Space',
	'Quotation_Mark',
	'Radical',
	'Regional_Indicator',
	'Sentence_Terminal',
	'Soft_Dotted',
	'Terminal_Punctuation',
	'Unified_Ideograph',
	'Uppercase',
	'Variation_Selector',
	'White_Space',
	'XID_Continue',
	'XID_Start'
]);

const propertyAliases = new Map([
	['scx', 'Script_Extensions'],
	['sc', 'Script'],
	['gc', 'General_Category'],
	['AHex', 'ASCII_Hex_Digit'],
	['Alpha', 'Alphabetic'],
	['Bidi_C', 'Bidi_Control'],
	['Bidi_M', 'Bidi_Mirrored'],
	['Cased', 'Cased'],
	['CI', 'Case_Ignorable'],
	['CWCF', 'Changes_When_Casefolded'],
	['CWCM', 'Changes_When_Casemapped'],
	['CWKCF', 'Changes_When_NFKC_Casefolded'],
	['CWL', 'Changes_When_Lowercased'],
	['CWT', 'Changes_When_Titlecased'],
	['CWU', 'Changes_When_Uppercased'],
	['Dash', 'Dash'],
	['Dep', 'Deprecated'],
	['DI', 'Default_Ignorable_Code_Point'],
	['Dia', 'Diacritic'],
	['Ext', 'Extender'],
	['Gr_Base', 'Grapheme_Base'],
	['Gr_Ext', 'Grapheme_Extend'],
	['Hex', 'Hex_Digit'],
	['IDC', 'ID_Continue'],
	['Ideo', 'Ideographic'],
	['IDS', 'ID_Start'],
	['IDSB', 'IDS_Binary_Operator'],
	['IDST', 'IDS_Trinary_Operator'],
	['Join_C', 'Join_Control'],
	['LOE', 'Logical_Order_Exception'],
	['Lower', 'Lowercase'],
	['Math', 'Math'],
	['NChar', 'Noncharacter_Code_Point'],
	['Pat_Syn', 'Pattern_Syntax'],
	['Pat_WS', 'Pattern_White_Space'],
	['QMark', 'Quotation_Mark'],
	['Radical', 'Radical'],
	['RI', 'Regional_Indicator'],
	['SD', 'Soft_Dotted'],
	['STerm', 'Sentence_Terminal'],
	['Term', 'Terminal_Punctuation'],
	['UIdeo', 'Unified_Ideograph'],
	['Upper', 'Uppercase'],
	['VS', 'Variation_Selector'],
	['WSpace', 'White_Space'],
	['space', 'White_Space'],
	['XIDC', 'XID_Continue'],
	['XIDS', 'XID_Start']
]);

const propertyToValueAliases = new Map([
	['General_Category', new Map([
		['C', 'Other'],
		['Cc', 'Control'],
		['cntrl', 'Control'],
		['Cf', 'Format'],
		['Cn', 'Unassigned'],
		['Co', 'Private_Use'],
		['Cs', 'Surrogate'],
		['L', 'Letter'],
		['LC', 'Cased_Letter'],
		['Ll', 'Lowercase_Letter'],
		['Lm', 'Modifier_Letter'],
		['Lo', 'Other_Letter'],
		['Lt', 'Titlecase_Letter'],
		['Lu', 'Uppercase_Letter'],
		['M', 'Mark'],
		['Combining_Mark', 'Mark'],
		['Mc', 'Spacing_Mark'],
		['Me', 'Enclosing_Mark'],
		['Mn', 'Nonspacing_Mark'],
		['N', 'Number'],
		['Nd', 'Decimal_Number'],
		['digit', 'Decimal_Number'],
		['Nl', 'Letter_Number'],
		['No', 'Other_Number'],
		['P', 'Punctuation'],
		['punct', 'Punctuation'],
		['Pc', 'Connector_Punctuation'],
		['Pd', 'Dash_Punctuation'],
		['Pe', 'Close_Punctuation'],
		['Pf', 'Final_Punctuation'],
		['Pi', 'Initial_Punctuation'],
		['Po', 'Other_Punctuation'],
		['Ps', 'Open_Punctuation'],
		['S', 'Symbol'],
		['Sc', 'Currency_Symbol'],
		['Sk', 'Modifier_Symbol'],
		['Sm', 'Math_Symbol'],
		['So', 'Other_Symbol'],
		['Z', 'Separator'],
		['Zl', 'Line_Separator'],
		['Zp', 'Paragraph_Separator'],
		['Zs', 'Space_Separator'],
		['Other', 'Other'],
		['Control', 'Control'],
		['Format', 'Format'],
		['Unassigned', 'Unassigned'],
		['Private_Use', 'Private_Use'],
		['Surrogate', 'Surrogate'],
		['Letter', 'Letter'],
		['Cased_Letter', 'Cased_Letter'],
		['Lowercase_Letter', 'Lowercase_Letter'],
		['Modifier_Letter', 'Modifier_Letter'],
		['Other_Letter', 'Other_Letter'],
		['Titlecase_Letter', 'Titlecase_Letter'],
		['Uppercase_Letter', 'Uppercase_Letter'],
		['Mark', 'Mark'],
		['Spacing_Mark', 'Spacing_Mark'],
		['Enclosing_Mark', 'Enclosing_Mark'],
		['Nonspacing_Mark', 'Nonspacing_Mark'],
		['Number', 'Number'],
		['Decimal_Number', 'Decimal_Number'],
		['Letter_Number', 'Letter_Number'],
		['Other_Number', 'Other_Number'],
		['Punctuation', 'Punctuation'],
		['Connector_Punctuation', 'Connector_Punctuation'],
		['Dash_Punctuation', 'Dash_Punctuation'],
		['Close_Punctuation', 'Close_Punctuation'],
		['Final_Punctuation', 'Final_Punctuation'],
		['Initial_Punctuation', 'Initial_Punctuation'],
		['Other_Punctuation', 'Other_Punctuation'],
		['Open_Punctuation', 'Open_Punctuation'],
		['Symbol', 'Symbol'],
		['Currency_Symbol', 'Currency_Symbol'],
		['Modifier_Symbol', 'Modifier_Symbol'],
		['Math_Symbol', 'Math_Symbol'],
		['Other_Symbol', 'Other_Symbol'],
		['Separator', 'Separator'],
		['Line_Separator', 'Line_Separator'],
		['Paragraph_Separator', 'Paragraph_Separator'],
		['Space_Separator', 'Space_Separator']
	])],
	['Script', new Map([
		['Adlm', 'Adlam'],
		['Aghb', 'Caucasian_Albanian'],
		['Ahom', 'Ahom'],
		['Arab', 'Arabic'],
		['Armi', 'Imperial_Aramaic'],
		['Armn', 'Armenian'],
		['Avst', 'Avestan'],
		['Bali', 'Balinese'],
		['Bamu', 'Bamum'],
		['Bass', 'Bassa_Vah'],
		['Batk', 'Batak'],
		['Beng', 'Bengali'],
		['Bhks', 'Bhaiksuki'],
		['Bopo', 'Bopomofo'],
		['Brah', 'Brahmi'],
		['Brai', 'Braille'],
		['Bugi', 'Buginese'],
		['Buhd', 'Buhid'],
		['Cakm', 'Chakma'],
		['Cans', 'Canadian_Aboriginal'],
		['Cari', 'Carian'],
		['Cham', 'Cham'],
		['Cher', 'Cherokee'],
		['Copt', 'Coptic'],
		['Qaac', 'Coptic'],
		['Cprt', 'Cypriot'],
		['Cyrl', 'Cyrillic'],
		['Deva', 'Devanagari'],
		['Dogr', 'Dogra'],
		['Dsrt', 'Deseret'],
		['Dupl', 'Duployan'],
		['Egyp', 'Egyptian_Hieroglyphs'],
		['Elba', 'Elbasan'],
		['Elym', 'Elymaic'],
		['Ethi', 'Ethiopic'],
		['Geor', 'Georgian'],
		['Glag', 'Glagolitic'],
		['Gong', 'Gunjala_Gondi'],
		['Gonm', 'Masaram_Gondi'],
		['Goth', 'Gothic'],
		['Gran', 'Grantha'],
		['Grek', 'Greek'],
		['Gujr', 'Gujarati'],
		['Guru', 'Gurmukhi'],
		['Hang', 'Hangul'],
		['Hani', 'Han'],
		['Hano', 'Hanunoo'],
		['Hatr', 'Hatran'],
		['Hebr', 'Hebrew'],
		['Hira', 'Hiragana'],
		['Hluw', 'Anatolian_Hieroglyphs'],
		['Hmng', 'Pahawh_Hmong'],
		['Hmnp', 'Nyiakeng_Puachue_Hmong'],
		['Hrkt', 'Katakana_Or_Hiragana'],
		['Hung', 'Old_Hungarian'],
		['Ital', 'Old_Italic'],
		['Java', 'Javanese'],
		['Kali', 'Kayah_Li'],
		['Kana', 'Katakana'],
		['Khar', 'Kharoshthi'],
		['Khmr', 'Khmer'],
		['Khoj', 'Khojki'],
		['Knda', 'Kannada'],
		['Kthi', 'Kaithi'],
		['Lana', 'Tai_Tham'],
		['Laoo', 'Lao'],
		['Latn', 'Latin'],
		['Lepc', 'Lepcha'],
		['Limb', 'Limbu'],
		['Lina', 'Linear_A'],
		['Linb', 'Linear_B'],
		['Lisu', 'Lisu'],
		['Lyci', 'Lycian'],
		['Lydi', 'Lydian'],
		['Mahj', 'Mahajani'],
		['Maka', 'Makasar'],
		['Mand', 'Mandaic'],
		['Mani', 'Manichaean'],
		['Marc', 'Marchen'],
		['Medf', 'Medefaidrin'],
		['Mend', 'Mende_Kikakui'],
		['Merc', 'Meroitic_Cursive'],
		['Mero', 'Meroitic_Hieroglyphs'],
		['Mlym', 'Malayalam'],
		['Modi', 'Modi'],
		['Mong', 'Mongolian'],
		['Mroo', 'Mro'],
		['Mtei', 'Meetei_Mayek'],
		['Mult', 'Multani'],
		['Mymr', 'Myanmar'],
		['Nand', 'Nandinagari'],
		['Narb', 'Old_North_Arabian'],
		['Nbat', 'Nabataean'],
		['Newa', 'Newa'],
		['Nkoo', 'Nko'],
		['Nshu', 'Nushu'],
		['Ogam', 'Ogham'],
		['Olck', 'Ol_Chiki'],
		['Orkh', 'Old_Turkic'],
		['Orya', 'Oriya'],
		['Osge', 'Osage'],
		['Osma', 'Osmanya'],
		['Palm', 'Palmyrene'],
		['Pauc', 'Pau_Cin_Hau'],
		['Perm', 'Old_Permic'],
		['Phag', 'Phags_Pa'],
		['Phli', 'Inscriptional_Pahlavi'],
		['Phlp', 'Psalter_Pahlavi'],
		['Phnx', 'Phoenician'],
		['Plrd', 'Miao'],
		['Prti', 'Inscriptional_Parthian'],
		['Rjng', 'Rejang'],
		['Rohg', 'Hanifi_Rohingya'],
		['Runr', 'Runic'],
		['Samr', 'Samaritan'],
		['Sarb', 'Old_South_Arabian'],
		['Saur', 'Saurashtra'],
		['Sgnw', 'SignWriting'],
		['Shaw', 'Shavian'],
		['Shrd', 'Sharada'],
		['Sidd', 'Siddham'],
		['Sind', 'Khudawadi'],
		['Sinh', 'Sinhala'],
		['Sogd', 'Sogdian'],
		['Sogo', 'Old_Sogdian'],
		['Sora', 'Sora_Sompeng'],
		['Soyo', 'Soyombo'],
		['Sund', 'Sundanese'],
		['Sylo', 'Syloti_Nagri'],
		['Syrc', 'Syriac'],
		['Tagb', 'Tagbanwa'],
		['Takr', 'Takri'],
		['Tale', 'Tai_Le'],
		['Talu', 'New_Tai_Lue'],
		['Taml', 'Tamil'],
		['Tang', 'Tangut'],
		['Tavt', 'Tai_Viet'],
		['Telu', 'Telugu'],
		['Tfng', 'Tifinagh'],
		['Tglg', 'Tagalog'],
		['Thaa', 'Thaana'],
		['Thai', 'Thai'],
		['Tibt', 'Tibetan'],
		['Tirh', 'Tirhuta'],
		['Ugar', 'Ugaritic'],
		['Vaii', 'Vai'],
		['Wara', 'Warang_Citi'],
		['Wcho', 'Wancho'],
		['Xpeo', 'Old_Persian'],
		['Xsux', 'Cuneiform'],
		['Yiii', 'Yi'],
		['Zanb', 'Zanabazar_Square'],
		['Zinh', 'Inherited'],
		['Qaai', 'Inherited'],
		['Zyyy', 'Common'],
		['Zzzz', 'Unknown'],
		['Adlam', 'Adlam'],
		['Caucasian_Albanian', 'Caucasian_Albanian'],
		['Arabic', 'Arabic'],
		['Imperial_Aramaic', 'Imperial_Aramaic'],
		['Armenian', 'Armenian'],
		['Avestan', 'Avestan'],
		['Balinese', 'Balinese'],
		['Bamum', 'Bamum'],
		['Bassa_Vah', 'Bassa_Vah'],
		['Batak', 'Batak'],
		['Bengali', 'Bengali'],
		['Bhaiksuki', 'Bhaiksuki'],
		['Bopomofo', 'Bopomofo'],
		['Brahmi', 'Brahmi'],
		['Braille', 'Braille'],
		['Buginese', 'Buginese'],
		['Buhid', 'Buhid'],
		['Chakma', 'Chakma'],
		['Canadian_Aboriginal', 'Canadian_Aboriginal'],
		['Carian', 'Carian'],
		['Cherokee', 'Cherokee'],
		['Coptic', 'Coptic'],
		['Cypriot', 'Cypriot'],
		['Cyrillic', 'Cyrillic'],
		['Devanagari', 'Devanagari'],
		['Dogra', 'Dogra'],
		['Deseret', 'Deseret'],
		['Duployan', 'Duployan'],
		['Egyptian_Hieroglyphs', 'Egyptian_Hieroglyphs'],
		['Elbasan', 'Elbasan'],
		['Elymaic', 'Elymaic'],
		['Ethiopic', 'Ethiopic'],
		['Georgian', 'Georgian'],
		['Glagolitic', 'Glagolitic'],
		['Gunjala_Gondi', 'Gunjala_Gondi'],
		['Masaram_Gondi', 'Masaram_Gondi'],
		['Gothic', 'Gothic'],
		['Grantha', 'Grantha'],
		['Greek', 'Greek'],
		['Gujarati', 'Gujarati'],
		['Gurmukhi', 'Gurmukhi'],
		['Hangul', 'Hangul'],
		['Han', 'Han'],
		['Hanunoo', 'Hanunoo'],
		['Hatran', 'Hatran'],
		['Hebrew', 'Hebrew'],
		['Hiragana', 'Hiragana'],
		['Anatolian_Hieroglyphs', 'Anatolian_Hieroglyphs'],
		['Pahawh_Hmong', 'Pahawh_Hmong'],
		['Nyiakeng_Puachue_Hmong', 'Nyiakeng_Puachue_Hmong'],
		['Katakana_Or_Hiragana', 'Katakana_Or_Hiragana'],
		['Old_Hungarian', 'Old_Hungarian'],
		['Old_Italic', 'Old_Italic'],
		['Javanese', 'Javanese'],
		['Kayah_Li', 'Kayah_Li'],
		['Katakana', 'Katakana'],
		['Kharoshthi', 'Kharoshthi'],
		['Khmer', 'Khmer'],
		['Khojki', 'Khojki'],
		['Kannada', 'Kannada'],
		['Kaithi', 'Kaithi'],
		['Tai_Tham', 'Tai_Tham'],
		['Lao', 'Lao'],
		['Latin', 'Latin'],
		['Lepcha', 'Lepcha'],
		['Limbu', 'Limbu'],
		['Linear_A', 'Linear_A'],
		['Linear_B', 'Linear_B'],
		['Lycian', 'Lycian'],
		['Lydian', 'Lydian'],
		['Mahajani', 'Mahajani'],
		['Makasar', 'Makasar'],
		['Mandaic', 'Mandaic'],
		['Manichaean', 'Manichaean'],
		['Marchen', 'Marchen'],
		['Medefaidrin', 'Medefaidrin'],
		['Mende_Kikakui', 'Mende_Kikakui'],
		['Meroitic_Cursive', 'Meroitic_Cursive'],
		['Meroitic_Hieroglyphs', 'Meroitic_Hieroglyphs'],
		['Malayalam', 'Malayalam'],
		['Mongolian', 'Mongolian'],
		['Mro', 'Mro'],
		['Meetei_Mayek', 'Meetei_Mayek'],
		['Multani', 'Multani'],
		['Myanmar', 'Myanmar'],
		['Nandinagari', 'Nandinagari'],
		['Old_North_Arabian', 'Old_North_Arabian'],
		['Nabataean', 'Nabataean'],
		['Nko', 'Nko'],
		['Nushu', 'Nushu'],
		['Ogham', 'Ogham'],
		['Ol_Chiki', 'Ol_Chiki'],
		['Old_Turkic', 'Old_Turkic'],
		['Oriya', 'Oriya'],
		['Osage', 'Osage'],
		['Osmanya', 'Osmanya'],
		['Palmyrene', 'Palmyrene'],
		['Pau_Cin_Hau', 'Pau_Cin_Hau'],
		['Old_Permic', 'Old_Permic'],
		['Phags_Pa', 'Phags_Pa'],
		['Inscriptional_Pahlavi', 'Inscriptional_Pahlavi'],
		['Psalter_Pahlavi', 'Psalter_Pahlavi'],
		['Phoenician', 'Phoenician'],
		['Miao', 'Miao'],
		['Inscriptional_Parthian', 'Inscriptional_Parthian'],
		['Rejang', 'Rejang'],
		['Hanifi_Rohingya', 'Hanifi_Rohingya'],
		['Runic', 'Runic'],
		['Samaritan', 'Samaritan'],
		['Old_South_Arabian', 'Old_South_Arabian'],
		['Saurashtra', 'Saurashtra'],
		['SignWriting', 'SignWriting'],
		['Shavian', 'Shavian'],
		['Sharada', 'Sharada'],
		['Siddham', 'Siddham'],
		['Khudawadi', 'Khudawadi'],
		['Sinhala', 'Sinhala'],
		['Sogdian', 'Sogdian'],
		['Old_Sogdian', 'Old_Sogdian'],
		['Sora_Sompeng', 'Sora_Sompeng'],
		['Soyombo', 'Soyombo'],
		['Sundanese', 'Sundanese'],
		['Syloti_Nagri', 'Syloti_Nagri'],
		['Syriac', 'Syriac'],
		['Tagbanwa', 'Tagbanwa'],
		['Takri', 'Takri'],
		['Tai_Le', 'Tai_Le'],
		['New_Tai_Lue', 'New_Tai_Lue'],
		['Tamil', 'Tamil'],
		['Tangut', 'Tangut'],
		['Tai_Viet', 'Tai_Viet'],
		['Telugu', 'Telugu'],
		['Tifinagh', 'Tifinagh'],
		['Tagalog', 'Tagalog'],
		['Thaana', 'Thaana'],
		['Tibetan', 'Tibetan'],
		['Tirhuta', 'Tirhuta'],
		['Ugaritic', 'Ugaritic'],
		['Vai', 'Vai'],
		['Warang_Citi', 'Warang_Citi'],
		['Wancho', 'Wancho'],
		['Old_Persian', 'Old_Persian'],
		['Cuneiform', 'Cuneiform'],
		['Yi', 'Yi'],
		['Zanabazar_Square', 'Zanabazar_Square'],
		['Inherited', 'Inherited'],
		['Common', 'Common'],
		['Unknown', 'Unknown']
	])],
	['Script_Extensions', new Map([
		['Adlm', 'Adlam'],
		['Aghb', 'Caucasian_Albanian'],
		['Ahom', 'Ahom'],
		['Arab', 'Arabic'],
		['Armi', 'Imperial_Aramaic'],
		['Armn', 'Armenian'],
		['Avst', 'Avestan'],
		['Bali', 'Balinese'],
		['Bamu', 'Bamum'],
		['Bass', 'Bassa_Vah'],
		['Batk', 'Batak'],
		['Beng', 'Bengali'],
		['Bhks', 'Bhaiksuki'],
		['Bopo', 'Bopomofo'],
		['Brah', 'Brahmi'],
		['Brai', 'Braille'],
		['Bugi', 'Buginese'],
		['Buhd', 'Buhid'],
		['Cakm', 'Chakma'],
		['Cans', 'Canadian_Aboriginal'],
		['Cari', 'Carian'],
		['Cham', 'Cham'],
		['Cher', 'Cherokee'],
		['Copt', 'Coptic'],
		['Qaac', 'Coptic'],
		['Cprt', 'Cypriot'],
		['Cyrl', 'Cyrillic'],
		['Deva', 'Devanagari'],
		['Dogr', 'Dogra'],
		['Dsrt', 'Deseret'],
		['Dupl', 'Duployan'],
		['Egyp', 'Egyptian_Hieroglyphs'],
		['Elba', 'Elbasan'],
		['Elym', 'Elymaic'],
		['Ethi', 'Ethiopic'],
		['Geor', 'Georgian'],
		['Glag', 'Glagolitic'],
		['Gong', 'Gunjala_Gondi'],
		['Gonm', 'Masaram_Gondi'],
		['Goth', 'Gothic'],
		['Gran', 'Grantha'],
		['Grek', 'Greek'],
		['Gujr', 'Gujarati'],
		['Guru', 'Gurmukhi'],
		['Hang', 'Hangul'],
		['Hani', 'Han'],
		['Hano', 'Hanunoo'],
		['Hatr', 'Hatran'],
		['Hebr', 'Hebrew'],
		['Hira', 'Hiragana'],
		['Hluw', 'Anatolian_Hieroglyphs'],
		['Hmng', 'Pahawh_Hmong'],
		['Hmnp', 'Nyiakeng_Puachue_Hmong'],
		['Hrkt', 'Katakana_Or_Hiragana'],
		['Hung', 'Old_Hungarian'],
		['Ital', 'Old_Italic'],
		['Java', 'Javanese'],
		['Kali', 'Kayah_Li'],
		['Kana', 'Katakana'],
		['Khar', 'Kharoshthi'],
		['Khmr', 'Khmer'],
		['Khoj', 'Khojki'],
		['Knda', 'Kannada'],
		['Kthi', 'Kaithi'],
		['Lana', 'Tai_Tham'],
		['Laoo', 'Lao'],
		['Latn', 'Latin'],
		['Lepc', 'Lepcha'],
		['Limb', 'Limbu'],
		['Lina', 'Linear_A'],
		['Linb', 'Linear_B'],
		['Lisu', 'Lisu'],
		['Lyci', 'Lycian'],
		['Lydi', 'Lydian'],
		['Mahj', 'Mahajani'],
		['Maka', 'Makasar'],
		['Mand', 'Mandaic'],
		['Mani', 'Manichaean'],
		['Marc', 'Marchen'],
		['Medf', 'Medefaidrin'],
		['Mend', 'Mende_Kikakui'],
		['Merc', 'Meroitic_Cursive'],
		['Mero', 'Meroitic_Hieroglyphs'],
		['Mlym', 'Malayalam'],
		['Modi', 'Modi'],
		['Mong', 'Mongolian'],
		['Mroo', 'Mro'],
		['Mtei', 'Meetei_Mayek'],
		['Mult', 'Multani'],
		['Mymr', 'Myanmar'],
		['Nand', 'Nandinagari'],
		['Narb', 'Old_North_Arabian'],
		['Nbat', 'Nabataean'],
		['Newa', 'Newa'],
		['Nkoo', 'Nko'],
		['Nshu', 'Nushu'],
		['Ogam', 'Ogham'],
		['Olck', 'Ol_Chiki'],
		['Orkh', 'Old_Turkic'],
		['Orya', 'Oriya'],
		['Osge', 'Osage'],
		['Osma', 'Osmanya'],
		['Palm', 'Palmyrene'],
		['Pauc', 'Pau_Cin_Hau'],
		['Perm', 'Old_Permic'],
		['Phag', 'Phags_Pa'],
		['Phli', 'Inscriptional_Pahlavi'],
		['Phlp', 'Psalter_Pahlavi'],
		['Phnx', 'Phoenician'],
		['Plrd', 'Miao'],
		['Prti', 'Inscriptional_Parthian'],
		['Rjng', 'Rejang'],
		['Rohg', 'Hanifi_Rohingya'],
		['Runr', 'Runic'],
		['Samr', 'Samaritan'],
		['Sarb', 'Old_South_Arabian'],
		['Saur', 'Saurashtra'],
		['Sgnw', 'SignWriting'],
		['Shaw', 'Shavian'],
		['Shrd', 'Sharada'],
		['Sidd', 'Siddham'],
		['Sind', 'Khudawadi'],
		['Sinh', 'Sinhala'],
		['Sogd', 'Sogdian'],
		['Sogo', 'Old_Sogdian'],
		['Sora', 'Sora_Sompeng'],
		['Soyo', 'Soyombo'],
		['Sund', 'Sundanese'],
		['Sylo', 'Syloti_Nagri'],
		['Syrc', 'Syriac'],
		['Tagb', 'Tagbanwa'],
		['Takr', 'Takri'],
		['Tale', 'Tai_Le'],
		['Talu', 'New_Tai_Lue'],
		['Taml', 'Tamil'],
		['Tang', 'Tangut'],
		['Tavt', 'Tai_Viet'],
		['Telu', 'Telugu'],
		['Tfng', 'Tifinagh'],
		['Tglg', 'Tagalog'],
		['Thaa', 'Thaana'],
		['Thai', 'Thai'],
		['Tibt', 'Tibetan'],
		['Tirh', 'Tirhuta'],
		['Ugar', 'Ugaritic'],
		['Vaii', 'Vai'],
		['Wara', 'Warang_Citi'],
		['Wcho', 'Wancho'],
		['Xpeo', 'Old_Persian'],
		['Xsux', 'Cuneiform'],
		['Yiii', 'Yi'],
		['Zanb', 'Zanabazar_Square'],
		['Zinh', 'Inherited'],
		['Qaai', 'Inherited'],
		['Zyyy', 'Common'],
		['Zzzz', 'Unknown'],
		['Adlam', 'Adlam'],
		['Caucasian_Albanian', 'Caucasian_Albanian'],
		['Arabic', 'Arabic'],
		['Imperial_Aramaic', 'Imperial_Aramaic'],
		['Armenian', 'Armenian'],
		['Avestan', 'Avestan'],
		['Balinese', 'Balinese'],
		['Bamum', 'Bamum'],
		['Bassa_Vah', 'Bassa_Vah'],
		['Batak', 'Batak'],
		['Bengali', 'Bengali'],
		['Bhaiksuki', 'Bhaiksuki'],
		['Bopomofo', 'Bopomofo'],
		['Brahmi', 'Brahmi'],
		['Braille', 'Braille'],
		['Buginese', 'Buginese'],
		['Buhid', 'Buhid'],
		['Chakma', 'Chakma'],
		['Canadian_Aboriginal', 'Canadian_Aboriginal'],
		['Carian', 'Carian'],
		['Cherokee', 'Cherokee'],
		['Coptic', 'Coptic'],
		['Cypriot', 'Cypriot'],
		['Cyrillic', 'Cyrillic'],
		['Devanagari', 'Devanagari'],
		['Dogra', 'Dogra'],
		['Deseret', 'Deseret'],
		['Duployan', 'Duployan'],
		['Egyptian_Hieroglyphs', 'Egyptian_Hieroglyphs'],
		['Elbasan', 'Elbasan'],
		['Elymaic', 'Elymaic'],
		['Ethiopic', 'Ethiopic'],
		['Georgian', 'Georgian'],
		['Glagolitic', 'Glagolitic'],
		['Gunjala_Gondi', 'Gunjala_Gondi'],
		['Masaram_Gondi', 'Masaram_Gondi'],
		['Gothic', 'Gothic'],
		['Grantha', 'Grantha'],
		['Greek', 'Greek'],
		['Gujarati', 'Gujarati'],
		['Gurmukhi', 'Gurmukhi'],
		['Hangul', 'Hangul'],
		['Han', 'Han'],
		['Hanunoo', 'Hanunoo'],
		['Hatran', 'Hatran'],
		['Hebrew', 'Hebrew'],
		['Hiragana', 'Hiragana'],
		['Anatolian_Hieroglyphs', 'Anatolian_Hieroglyphs'],
		['Pahawh_Hmong', 'Pahawh_Hmong'],
		['Nyiakeng_Puachue_Hmong', 'Nyiakeng_Puachue_Hmong'],
		['Katakana_Or_Hiragana', 'Katakana_Or_Hiragana'],
		['Old_Hungarian', 'Old_Hungarian'],
		['Old_Italic', 'Old_Italic'],
		['Javanese', 'Javanese'],
		['Kayah_Li', 'Kayah_Li'],
		['Katakana', 'Katakana'],
		['Kharoshthi', 'Kharoshthi'],
		['Khmer', 'Khmer'],
		['Khojki', 'Khojki'],
		['Kannada', 'Kannada'],
		['Kaithi', 'Kaithi'],
		['Tai_Tham', 'Tai_Tham'],
		['Lao', 'Lao'],
		['Latin', 'Latin'],
		['Lepcha', 'Lepcha'],
		['Limbu', 'Limbu'],
		['Linear_A', 'Linear_A'],
		['Linear_B', 'Linear_B'],
		['Lycian', 'Lycian'],
		['Lydian', 'Lydian'],
		['Mahajani', 'Mahajani'],
		['Makasar', 'Makasar'],
		['Mandaic', 'Mandaic'],
		['Manichaean', 'Manichaean'],
		['Marchen', 'Marchen'],
		['Medefaidrin', 'Medefaidrin'],
		['Mende_Kikakui', 'Mende_Kikakui'],
		['Meroitic_Cursive', 'Meroitic_Cursive'],
		['Meroitic_Hieroglyphs', 'Meroitic_Hieroglyphs'],
		['Malayalam', 'Malayalam'],
		['Mongolian', 'Mongolian'],
		['Mro', 'Mro'],
		['Meetei_Mayek', 'Meetei_Mayek'],
		['Multani', 'Multani'],
		['Myanmar', 'Myanmar'],
		['Nandinagari', 'Nandinagari'],
		['Old_North_Arabian', 'Old_North_Arabian'],
		['Nabataean', 'Nabataean'],
		['Nko', 'Nko'],
		['Nushu', 'Nushu'],
		['Ogham', 'Ogham'],
		['Ol_Chiki', 'Ol_Chiki'],
		['Old_Turkic', 'Old_Turkic'],
		['Oriya', 'Oriya'],
		['Osage', 'Osage'],
		['Osmanya', 'Osmanya'],
		['Palmyrene', 'Palmyrene'],
		['Pau_Cin_Hau', 'Pau_Cin_Hau'],
		['Old_Permic', 'Old_Permic'],
		['Phags_Pa', 'Phags_Pa'],
		['Inscriptional_Pahlavi', 'Inscriptional_Pahlavi'],
		['Psalter_Pahlavi', 'Psalter_Pahlavi'],
		['Phoenician', 'Phoenician'],
		['Miao', 'Miao'],
		['Inscriptional_Parthian', 'Inscriptional_Parthian'],
		['Rejang', 'Rejang'],
		['Hanifi_Rohingya', 'Hanifi_Rohingya'],
		['Runic', 'Runic'],
		['Samaritan', 'Samaritan'],
		['Old_South_Arabian', 'Old_South_Arabian'],
		['Saurashtra', 'Saurashtra'],
		['SignWriting', 'SignWriting'],
		['Shavian', 'Shavian'],
		['Sharada', 'Sharada'],
		['Siddham', 'Siddham'],
		['Khudawadi', 'Khudawadi'],
		['Sinhala', 'Sinhala'],
		['Sogdian', 'Sogdian'],
		['Old_Sogdian', 'Old_Sogdian'],
		['Sora_Sompeng', 'Sora_Sompeng'],
		['Soyombo', 'Soyombo'],
		['Sundanese', 'Sundanese'],
		['Syloti_Nagri', 'Syloti_Nagri'],
		['Syriac', 'Syriac'],
		['Tagbanwa', 'Tagbanwa'],
		['Takri', 'Takri'],
		['Tai_Le', 'Tai_Le'],
		['New_Tai_Lue', 'New_Tai_Lue'],
		['Tamil', 'Tamil'],
		['Tangut', 'Tangut'],
		['Tai_Viet', 'Tai_Viet'],
		['Telugu', 'Telugu'],
		['Tifinagh', 'Tifinagh'],
		['Tagalog', 'Tagalog'],
		['Thaana', 'Thaana'],
		['Tibetan', 'Tibetan'],
		['Tirhuta', 'Tirhuta'],
		['Ugaritic', 'Ugaritic'],
		['Vai', 'Vai'],
		['Warang_Citi', 'Warang_Citi'],
		['Wancho', 'Wancho'],
		['Old_Persian', 'Old_Persian'],
		['Cuneiform', 'Cuneiform'],
		['Yi', 'Yi'],
		['Zanabazar_Square', 'Zanabazar_Square'],
		['Inherited', 'Inherited'],
		['Common', 'Common'],
		['Unknown', 'Unknown']
	])]
]);

/* -------------------------------------------------------------------------- */
/*                                  matchers                                  */
/* -------------------------------------------------------------------------- */

const unicodeMatchProperty = function(property) {
	if (canonicalProperties.has(property)) {
		return property;
	}
	if (propertyAliases.has(property)) {
		return propertyAliases.get(property);
	}
	throw new Error(`Unknown property: ${ property }`);
};

const unicodeMatchPropertyValue = function(property, value) {
	const aliasToValue = propertyToValueAliases.get(property);
	if (!aliasToValue) {
		throw new Error(`Unknown property \`${ property }\`.`);
	}
	const canonicalValue = aliasToValue.get(value);
	if (canonicalValue) {
		return canonicalValue;
	}
	throw new Error(
		`Unknown value \`${ value }\` for property \`${ property }\`.`
	);
};


/* -------------------------------------------------------------------------- */
/*                              rewrite patterns                              */
/* -------------------------------------------------------------------------- */


// Prepare a Regenerate set containing all code points, used for negative
// character classes (if any).
const UNICODE_SET = regenerate().addRange(0x0, 0x10FFFF);
// Without the `u` flag, the range stops at 0xFFFF.
// https://mths.be/es6#sec-pattern-semantics
const BMP_SET = regenerate().addRange(0x0, 0xFFFF);

// Prepare a Regenerate set containing all code points that are supposed to be
// matched by `/./u`. https://mths.be/es6#sec-atom
const DOT_SET_UNICODE = UNICODE_SET.clone() // all Unicode code points
	.remove(
		// minus `LineTerminator`s (https://mths.be/es6#sec-line-terminators):
		0x000A, // Line Feed <LF>
		0x000D, // Carriage Return <CR>
		0x2028, // Line Separator <LS>
		0x2029  // Paragraph Separator <PS>
	);

const getCharacterClassEscapeSet = (character, unicode, ignoreCase) => {
	if (unicode) {
		if (ignoreCase) {
			return ESCAPE_SETS.UNICODE_IGNORE_CASE.get(character);
		}
		return ESCAPE_SETS.UNICODE.get(character);
	}
	return ESCAPE_SETS.REGULAR.get(character);
};

const getUnicodeDotSet = (dotAll) => {
	return dotAll ? UNICODE_SET : DOT_SET_UNICODE;
};

const getUnicodePropertyValueSet = (property, value) => {
	const path = value ?
		`${ property }/${ value }` :
		`Binary_Property/${ property }`;
	try {
		return require(`regenerate-unicode-properties/${ path }.js`);
	} catch (exception) {
		throw new Error(
			`Failed to recognize value \`${ value }\` for property ` +
			`\`${ property }\`.`
		);
	}
};

const handleLoneUnicodePropertyNameOrValue = (value) => {
	// It could be a `General_Category` value or a binary property.
	// Note: `unicodeMatchPropertyValue` throws on invalid values.
	try {
		const property = 'General_Category';
		const category = unicodeMatchPropertyValue(property, value);
		return getUnicodePropertyValueSet(property, category);
	} catch (exception) {}
	// It’s not a `General_Category` value, so check if it’s a binary
	// property. Note: `unicodeMatchProperty` throws on invalid properties.
	const property = unicodeMatchProperty(value);
	return getUnicodePropertyValueSet(property);
};

const getUnicodePropertyEscapeSet = (value, isNegative) => {
	const parts = value.split('=');
	const firstPart = parts[0];
	let set;
	if (parts.length == 1) {
		set = handleLoneUnicodePropertyNameOrValue(firstPart);
	} else {
		// The pattern consists of two parts, i.e. `Property=Value`.
		const property = unicodeMatchProperty(firstPart);
		const value = unicodeMatchPropertyValue(property, parts[1]);
		set = getUnicodePropertyValueSet(property, value);
	}
	if (isNegative) {
		return UNICODE_SET.clone().remove(set);
	}
	return set.clone();
};

// Given a range of code points, add any case-folded code points in that range
// to a set.
regenerate.prototype.iuAddRange = function(min, max) {
	const $this = this;
	do {
		const folded = caseFold(min);
		if (folded) {
			$this.add(folded);
		}
	} while (++min <= max);
	return $this;
};

const update = (item, pattern) => {
	let tree = parse(pattern, config.useUnicodeFlag ? 'u' : '');
	switch (tree.type) {
		case 'characterClass':
		case 'group':
		case 'value':
			// No wrapping needed.
			break;
		default:
			// Wrap the pattern in a non-capturing group.
			tree = wrap(tree, pattern);
	}
	Object.assign(item, tree);
};

const wrap = (tree, pattern) => {
	// Wrap the pattern in a non-capturing group.
	return {
		'type': 'group',
		'behavior': 'ignore',
		'body': [tree],
		'raw': `(?:${ pattern })`
	};
};

const caseFold = (codePoint) => {
	return iuMappings.get(codePoint) || false;
};

const processCharacterClass = (characterClassItem, regenerateOptions) => {
	let set = regenerate();
	for (const item of characterClassItem.body) {
		switch (item.type) {
			case 'value':
				set.add(item.codePoint);
				if (config.ignoreCase && config.unicode && !config.useUnicodeFlag) {
					const folded = caseFold(item.codePoint);
					if (folded) {
						set.add(folded);
					}
				}
				break;
			case 'characterClassRange':
				const min = item.min.codePoint;
				const max = item.max.codePoint;
				set.addRange(min, max);
				if (config.ignoreCase && config.unicode && !config.useUnicodeFlag) {
					set.iuAddRange(min, max);
				}
				break;
			case 'characterClassEscape':
				set.add(getCharacterClassEscapeSet(
					item.value,
					config.unicode,
					config.ignoreCase
				));
				break;
			case 'unicodePropertyEscape':
				set.add(getUnicodePropertyEscapeSet(item.value, item.negative));
				break;
			// The `default` clause is only here as a safeguard; it should never be
			// reached. Code coverage tools should ignore it.
			/* istanbul ignore next */
			default:
				throw new Error(`Unknown term type: ${ item.type }`);
		}
	}
	if (characterClassItem.negative) {
		set = (config.unicode ? UNICODE_SET : BMP_SET).clone().remove(set);
	}
	update(characterClassItem, set.toString(regenerateOptions));
	return characterClassItem;
};

const updateNamedReference = (item, index) => {
	delete item.name;
	item.matchIndex = index;
};

const assertNoUnmatchedReferences = (groups) => {
	const unmatchedReferencesNames = Object.keys(groups.unmatchedReferences);
	if (unmatchedReferencesNames.length > 0) {
		throw new Error(`Unknown group names: ${unmatchedReferencesNames}`);
	}
};

const processTerm = (item, regenerateOptions, groups) => {
	switch (item.type) {
		case 'dot':
			if (config.unicode) {
				update(
					item,
					getUnicodeDotSet(config.dotAll).toString(regenerateOptions)
				);
			} else if (config.dotAll) {
				// TODO: consider changing this at the regenerate level.
				update(item, '[\\s\\S]');
			}
			break;
		case 'characterClass':
			item = processCharacterClass(item, regenerateOptions);
			break;
		case 'unicodePropertyEscape':
			update(
				item,
				getUnicodePropertyEscapeSet(item.value, item.negative)
					.toString(regenerateOptions)
			);
			break;
		case 'characterClassEscape':
			update(
				item,
				getCharacterClassEscapeSet(
					item.value,
					config.unicode,
					config.ignoreCase
				).toString(regenerateOptions)
			);
			break;
		case 'group':
			if (item.behavior == 'normal') {
				groups.lastIndex++;
			}
			if (item.name) {
				const name = item.name.value;

				if (groups.names[name]) {
					throw new Error(
						`Multiple groups with the same name (${ name }) are not allowed.`
					);
				}

				const index = groups.lastIndex;
				delete item.name;

				groups.names[name] = index;
				if (groups.onNamedGroup) {
					groups.onNamedGroup.call(null, name, index);
				}

				if (groups.unmatchedReferences[name]) {
					groups.unmatchedReferences[name].forEach(reference => {
						updateNamedReference(reference, index);
					});
					delete groups.unmatchedReferences[name];
				}
			}
			/* falls through */
		case 'alternative':
		case 'disjunction':
		case 'quantifier':
			item.body = item.body.map(term => {
				return processTerm(term, regenerateOptions, groups);
			});
			break;
		case 'value':
			const codePoint = item.codePoint;
			const set = regenerate(codePoint);
			if (config.ignoreCase && config.unicode && !config.useUnicodeFlag) {
				const folded = caseFold(codePoint);
				if (folded) {
					set.add(folded);
				}
			}
			update(item, set.toString(regenerateOptions));
			break;
		case 'reference':
			if (item.name) {
				const name = item.name.value;
				const index = groups.names[name];
				if (index) {
					updateNamedReference(item, index);
					break;
				}

				if (!groups.unmatchedReferences[name]) {
					groups.unmatchedReferences[name] = [];
				}
				// Keep track of references used before the corresponding group.
				groups.unmatchedReferences[name].push(item);
			}
			break;
		case 'anchor':
		case 'empty':
		case 'group':
			// Nothing to do here.
			break;
		// The `default` clause is only here as a safeguard; it should never be
		// reached. Code coverage tools should ignore it.
		/* istanbul ignore next */
		default:
			throw new Error(`Unknown term type: ${ item.type }`);
	}
	return item;
};

const config = {
	'ignoreCase': false,
	'unicode': false,
	'dotAll': false,
	'useUnicodeFlag': false
};
const rewritePattern = (pattern, flags, options) => {
	const regjsparserFeatures = {
		'unicodePropertyEscape': options && options.unicodePropertyEscape,
		'namedGroups': options && options.namedGroup,
		'lookbehind': options && options.lookbehind
	};
	config.ignoreCase = flags && flags.includes('i');
	config.unicode = flags && flags.includes('u');
	const supportDotAllFlag = options && options.dotAllFlag;
	config.dotAll = supportDotAllFlag && flags && flags.includes('s');
	config.useUnicodeFlag = options && options.useUnicodeFlag;
	const regenerateOptions = {
		'hasUnicodeFlag': config.useUnicodeFlag,
		'bmpOnly': !config.unicode
	};
	const groups = {
		'onNamedGroup': options && options.onNamedGroup,
		'lastIndex': 0,
		'names': Object.create(null), // { [name]: index }
		'unmatchedReferences': Object.create(null) // { [name]: Array<reference> }
	};
	const tree = parse(pattern, flags, regjsparserFeatures);
	// Note: `processTerm` mutates `tree` and `groups`.
	processTerm(tree, regenerateOptions, groups);
	assertNoUnmatchedReferences(groups);
	return generate(tree);
};


module.exports = rewritePattern;

import { IStyle,IStyleSheetConfig, keyframes, mergeStyles, Stylesheet, memoizeFunction } from './merge-styles';
import { fontFace, IFontFace, IFontWeight, GlobalClassNames ,IRawStyle } from './merge-styles';
import { Customizations, getLanguage, getWindow, GlobalSettings, ICustomizerContext } from './utilities';
import { IsFocusVisibleClassName, merge, mergeSettings, warn } from './utilities';

/* Register the keyframes */

const EASING_FUNCTION_1 = 'cubic-bezier(.1,.9,.2,1)';
const EASING_FUNCTION_2 = 'cubic-bezier(.1,.25,.75,.9)';
const DURATION_1 = '0.167s';
const DURATION_2 = '0.267s';
const DURATION_3 = '0.367s';
const DURATION_4 = '0.467s';

const FADE_IN: string = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 }
});

const FADE_OUT: string = keyframes({
  from: { opacity: 1 },
  to: { opacity: 0, visibility: 'hidden' }
});

const SLIDE_RIGHT_IN10: string = _createSlideInX(-10);
const SLIDE_RIGHT_IN20: string = _createSlideInX(-20);
const SLIDE_RIGHT_IN40: string = _createSlideInX(-40);
const SLIDE_RIGHT_IN400: string = _createSlideInX(-400);
const SLIDE_LEFT_IN10: string = _createSlideInX(10);
const SLIDE_LEFT_IN20: string = _createSlideInX(20);
const SLIDE_LEFT_IN40: string = _createSlideInX(40);
const SLIDE_LEFT_IN400: string = _createSlideInX(400);
const SLIDE_UP_IN10: string = _createSlideInY(10);
const SLIDE_UP_IN20: string = _createSlideInY(20);
const SLIDE_DOWN_IN10: string = _createSlideInY(-10);
const SLIDE_DOWN_IN20: string = _createSlideInY(-20);

const SLIDE_RIGHT_OUT10: string = _createSlideOutX(10);
const SLIDE_RIGHT_OUT20: string = _createSlideOutX(20);
const SLIDE_RIGHT_OUT40: string = _createSlideOutX(40);
const SLIDE_RIGHT_OUT400: string = _createSlideOutX(400);
const SLIDE_LEFT_OUT10: string = _createSlideOutX(-10);
const SLIDE_LEFT_OUT20: string = _createSlideOutX(-20);
const SLIDE_LEFT_OUT40: string = _createSlideOutX(-40);
const SLIDE_LEFT_OUT400: string = _createSlideOutX(-400);
const SLIDE_UP_OUT10: string = _createSlideOutY(-10);
const SLIDE_UP_OUT20: string = _createSlideOutY(-20);
const SLIDE_DOWN_OUT10: string = _createSlideOutY(10);
const SLIDE_DOWN_OUT20: string = _createSlideOutY(20);

const SCALE_UP100: string = keyframes({
  from: { transform: 'scale3d(.98,.98,1)' },
  to: { transform: 'scale3d(1,1,1)' }
});

const SCALE_DOWN98: string = keyframes({
  from: { transform: 'scale3d(1,1,1)' },
  to: { transform: 'scale3d(.98,.98,1)' }
});

const SCALE_DOWN100: string = keyframes({
  from: { transform: 'scale3d(1.03,1.03,1)' },
  to: { transform: 'scale3d(1,1,1)' }
});

const SCALE_UP103: string = keyframes({
  from: { transform: 'scale3d(1,1,1)' },
  to: { transform: 'scale3d(1.03,1.03,1)' }
});

const ROTATE90: string = keyframes({
  from: { transform: 'rotateZ(0deg)' },
  to: { transform: 'rotateZ(90deg)' }
});

const ROTATE_N90: string = keyframes({
  from: { transform: 'rotateZ(0deg)' },
  to: { transform: 'rotateZ(-90deg)' }
});

/**
 * Exporting raw duraction values and easing functions to be used in custom animations
 */
export const AnimationVariables: IAnimationVariables = {
  easeFunction1: EASING_FUNCTION_1,
  easeFunction2: EASING_FUNCTION_2,
  durationValue1: DURATION_1,
  durationValue2: DURATION_2,
  durationValue3: DURATION_3,
  durationValue4: DURATION_4
};

/**
 * All Fabric standard animations, exposed as json objects referencing predefined
 * keyframes. These objects can be mixed in with other class definitions.
 */
export const AnimationStyles: IAnimationStyles = {
  slideRightIn10: _createAnimation(`${FADE_IN},${SLIDE_RIGHT_IN10}`, DURATION_3, EASING_FUNCTION_1),
  slideRightIn20: _createAnimation(`${FADE_IN},${SLIDE_RIGHT_IN20}`, DURATION_3, EASING_FUNCTION_1),
  slideRightIn40: _createAnimation(`${FADE_IN},${SLIDE_RIGHT_IN40}`, DURATION_3, EASING_FUNCTION_1),
  slideRightIn400: _createAnimation(`${FADE_IN},${SLIDE_RIGHT_IN400}`, DURATION_3, EASING_FUNCTION_1),
  slideLeftIn10: _createAnimation(`${FADE_IN},${SLIDE_LEFT_IN10}`, DURATION_3, EASING_FUNCTION_1),
  slideLeftIn20: _createAnimation(`${FADE_IN},${SLIDE_LEFT_IN20}`, DURATION_3, EASING_FUNCTION_1),
  slideLeftIn40: _createAnimation(`${FADE_IN},${SLIDE_LEFT_IN40}`, DURATION_3, EASING_FUNCTION_1),
  slideLeftIn400: _createAnimation(`${FADE_IN},${SLIDE_LEFT_IN400}`, DURATION_3, EASING_FUNCTION_1),
  slideUpIn10: _createAnimation(`${FADE_IN},${SLIDE_UP_IN10}`, DURATION_3, EASING_FUNCTION_1),
  slideUpIn20: _createAnimation(`${FADE_IN},${SLIDE_UP_IN20}`, DURATION_3, EASING_FUNCTION_1),
  slideDownIn10: _createAnimation(`${FADE_IN},${SLIDE_DOWN_IN10}`, DURATION_3, EASING_FUNCTION_1),
  slideDownIn20: _createAnimation(`${FADE_IN},${SLIDE_DOWN_IN20}`, DURATION_3, EASING_FUNCTION_1),

  slideRightOut10: _createAnimation(`${FADE_OUT},${SLIDE_RIGHT_OUT10}`, DURATION_3, EASING_FUNCTION_1),
  slideRightOut20: _createAnimation(`${FADE_OUT},${SLIDE_RIGHT_OUT20}`, DURATION_3, EASING_FUNCTION_1),
  slideRightOut40: _createAnimation(`${FADE_OUT},${SLIDE_RIGHT_OUT40}`, DURATION_3, EASING_FUNCTION_1),
  slideRightOut400: _createAnimation(`${FADE_OUT},${SLIDE_RIGHT_OUT400}`, DURATION_3, EASING_FUNCTION_1),
  slideLeftOut10: _createAnimation(`${FADE_OUT},${SLIDE_LEFT_OUT10}`, DURATION_3, EASING_FUNCTION_1),
  slideLeftOut20: _createAnimation(`${FADE_OUT},${SLIDE_LEFT_OUT20}`, DURATION_3, EASING_FUNCTION_1),
  slideLeftOut40: _createAnimation(`${FADE_OUT},${SLIDE_LEFT_OUT40}`, DURATION_3, EASING_FUNCTION_1),
  slideLeftOut400: _createAnimation(`${FADE_OUT},${SLIDE_LEFT_OUT400}`, DURATION_3, EASING_FUNCTION_1),
  slideUpOut10: _createAnimation(`${FADE_OUT},${SLIDE_UP_OUT10}`, DURATION_3, EASING_FUNCTION_1),
  slideUpOut20: _createAnimation(`${FADE_OUT},${SLIDE_UP_OUT20}`, DURATION_3, EASING_FUNCTION_1),
  slideDownOut10: _createAnimation(`${FADE_OUT},${SLIDE_DOWN_OUT10}`, DURATION_3, EASING_FUNCTION_1),
  slideDownOut20: _createAnimation(`${FADE_OUT},${SLIDE_DOWN_OUT20}`, DURATION_3, EASING_FUNCTION_1),

  scaleUpIn100: _createAnimation(`${FADE_IN},${SCALE_UP100}`, DURATION_3, EASING_FUNCTION_1),
  scaleDownIn100: _createAnimation(`${FADE_IN},${SCALE_DOWN100}`, DURATION_3, EASING_FUNCTION_1),
  scaleUpOut103: _createAnimation(`${FADE_OUT},${SCALE_UP103}`, DURATION_1, EASING_FUNCTION_2),
  scaleDownOut98: _createAnimation(`${FADE_OUT},${SCALE_DOWN98}`, DURATION_1, EASING_FUNCTION_2),

  fadeIn100: _createAnimation(FADE_IN, DURATION_1, EASING_FUNCTION_2),
  fadeIn200: _createAnimation(FADE_IN, DURATION_2, EASING_FUNCTION_2),
  fadeIn400: _createAnimation(FADE_IN, DURATION_3, EASING_FUNCTION_2),
  fadeIn500: _createAnimation(FADE_IN, DURATION_4, EASING_FUNCTION_2),

  fadeOut100: _createAnimation(FADE_OUT, DURATION_1, EASING_FUNCTION_2),
  fadeOut200: _createAnimation(FADE_OUT, DURATION_2, EASING_FUNCTION_2),
  fadeOut400: _createAnimation(FADE_OUT, DURATION_3, EASING_FUNCTION_2),
  fadeOut500: _createAnimation(FADE_OUT, DURATION_4, EASING_FUNCTION_2),

  rotate90deg: _createAnimation(ROTATE90, '0.1s', EASING_FUNCTION_2),
  rotateN90deg: _createAnimation(ROTATE_N90, '0.1s', EASING_FUNCTION_2)

  // expandCollapse 100/200/400, delay 100/200
};

function _createAnimation(animationName: string, animationDuration: string, animationTimingFunction: string): IRawStyle {
  return {
    animationName,
    animationDuration,
    animationTimingFunction,
    animationFillMode: 'both'
  };
}

function _createSlideInX(fromX: number): string {
  return keyframes({
    from: { transform: `translate3d(${fromX}px,0,0)` },
    to: { transform: `translate3d(0,0,0)` }
  });
}

function _createSlideInY(fromY: number): string {
  return keyframes({
    from: { transform: `translate3d(0,${fromY}px,0)` },
    to: { transform: `translate3d(0,0,0)` }
  });
}

function _createSlideOutX(toX: number): string {
  return keyframes({
    from: { transform: `translate3d(0,0,0)` },
    to: { transform: `translate3d(${toX}px,0,0)` }
  });
}

function _createSlideOutY(toY: number): string {
  return keyframes({
    from: { transform: `translate3d(0,0,0)` },
    to: { transform: `translate3d(0,${toY}px,0)` }
  });
}


/**
 * Builds a class names object from a given map.
 *
 * @param styles - Map of unprocessed styles.
 * @returns Map of property name to class name.
 */
function buildClassMap<T extends Object>(styles: T): { [key in keyof T]?: string } {
  let classes: { [key in keyof T]?: string } = {};

  for (let styleName in styles) {
    if (styles.hasOwnProperty(styleName)) {
      let className: string;

      Object.defineProperty(classes, styleName, {
        get: (): string => {
          if (className === undefined) {
            // tslint:disable-next-line:no-any
            className = mergeStyles(styles[styleName] as any).toString();
          }
          return className;
        },
        enumerable: true,
        configurable: true
      });
    }
  }

  return classes;
}




export const AnimationClassNames: { [key in keyof IAnimationStyles]?: string } = buildClassMap(AnimationStyles);

export interface IColorClassNames {
  themeDarker: string;
  themeDarkerHover: string;
  themeDarkerBackground: string;
  themeDarkerBackgroundHover: string;
  themeDarkerBorder: string;
  themeDarkerBorderHover: string;
  themeDark: string;
  themeDarkHover: string;
  themeDarkBackground: string;
  themeDarkBackgroundHover: string;
  themeDarkBorder: string;
  themeDarkBorderHover: string;
  themeDarkAlt: string;
  themeDarkAltHover: string;
  themeDarkAltBackground: string;
  themeDarkAltBackgroundHover: string;
  themeDarkAltBorder: string;
  themeDarkAltBorderHover: string;
  themePrimary: string;
  themePrimaryHover: string;
  themePrimaryBackground: string;
  themePrimaryBackgroundHover: string;
  themePrimaryBorder: string;
  themePrimaryBorderHover: string;
  themeSecondary: string;
  themeSecondaryHover: string;
  themeSecondaryBackground: string;
  themeSecondaryBackgroundHover: string;
  themeSecondaryBorder: string;
  themeSecondaryBorderHover: string;
  themeTertiary: string;
  themeTertiaryHover: string;
  themeTertiaryBackground: string;
  themeTertiaryBackgroundHover: string;
  themeTertiaryBorder: string;
  themeTertiaryBorderHover: string;
  themeLight: string;
  themeLightHover: string;
  themeLightBackground: string;
  themeLightBackgroundHover: string;
  themeLightBorder: string;
  themeLightBorderHover: string;
  themeLighter: string;
  themeLighterHover: string;
  themeLighterBackground: string;
  themeLighterBackgroundHover: string;
  themeLighterBorder: string;
  themeLighterBorderHover: string;
  themeLighterAlt: string;
  themeLighterAltHover: string;
  themeLighterAltBackground: string;
  themeLighterAltBackgroundHover: string;
  themeLighterAltBorder: string;
  themeLighterAltBorderHover: string;
  black: string;
  blackHover: string;
  blackBackground: string;
  blackBackgroundHover: string;
  blackBorder: string;
  blackBorderHover: string;
  blackTranslucent40: string;
  blackTranslucent40Hover: string;
  blackTranslucent40Background: string;
  blackTranslucent40BackgroundHover: string;
  blackTranslucent40Border: string;
  blackTranslucent40BorderHover: string;
  neutralDark: string;
  neutralDarkHover: string;
  neutralDarkBackground: string;
  neutralDarkBackgroundHover: string;
  neutralDarkBorder: string;
  neutralDarkBorderHover: string;
  neutralPrimary: string;
  neutralPrimaryHover: string;
  neutralPrimaryBackground: string;
  neutralPrimaryBackgroundHover: string;
  neutralPrimaryBorder: string;
  neutralPrimaryBorderHover: string;
  neutralPrimaryAlt: string;
  neutralPrimaryAltHover: string;
  neutralPrimaryAltBackground: string;
  neutralPrimaryAltBackgroundHover: string;
  neutralPrimaryAltBorder: string;
  neutralPrimaryAltBorderHover: string;
  neutralSecondary: string;
  neutralSecondaryHover: string;
  neutralSecondaryBackground: string;
  neutralSecondaryBackgroundHover: string;
  neutralSecondaryBorder: string;
  neutralSecondaryBorderHover: string;
  neutralSecondaryAlt: string;
  neutralSecondaryAltHover: string;
  neutralSecondaryAltBackground: string;
  neutralSecondaryAltBackgroundHover: string;
  neutralSecondaryAltBorder: string;
  neutralSecondaryAltBorderHover: string;
  neutralTertiary: string;
  neutralTertiaryHover: string;
  neutralTertiaryBackground: string;
  neutralTertiaryBackgroundHover: string;
  neutralTertiaryBorder: string;
  neutralTertiaryBorderHover: string;
  neutralTertiaryAlt: string;
  neutralTertiaryAltHover: string;
  neutralTertiaryAltBackground: string;
  neutralTertiaryAltBackgroundHover: string;
  neutralTertiaryAltBorder: string;
  neutralTertiaryAltBorderHover: string;
  neutralQuaternary: string;
  neutralQuaternaryHover: string;
  neutralQuaternaryBackground: string;
  neutralQuaternaryBackgroundHover: string;
  neutralQuaternaryBorder: string;
  neutralQuaternaryBorderHover: string;
  neutralQuaternaryAlt: string;
  neutralQuaternaryAltHover: string;
  neutralQuaternaryAltBackground: string;
  neutralQuaternaryAltBackgroundHover: string;
  neutralQuaternaryAltBorder: string;
  neutralQuaternaryAltBorderHover: string;
  neutralLight: string;
  neutralLightHover: string;
  neutralLightBackground: string;
  neutralLightBackgroundHover: string;
  neutralLightBorder: string;
  neutralLightBorderHover: string;
  neutralLighter: string;
  neutralLighterHover: string;
  neutralLighterBackground: string;
  neutralLighterBackgroundHover: string;
  neutralLighterBorder: string;
  neutralLighterBorderHover: string;
  neutralLighterAlt: string;
  neutralLighterAltHover: string;
  neutralLighterAltBackground: string;
  neutralLighterAltBackgroundHover: string;
  neutralLighterAltBorder: string;
  neutralLighterAltBorderHover: string;
  white: string;
  whiteHover: string;
  whiteBackground: string;
  whiteBackgroundHover: string;
  whiteBorder: string;
  whiteBorderHover: string;
  whiteTranslucent40: string;
  whiteTranslucent40Hover: string;
  whiteTranslucent40Background: string;
  whiteTranslucent40BackgroundHover: string;
  whiteTranslucent40Border: string;
  whiteTranslucent40BorderHover: string;
  yellow: string;
  yellowHover: string;
  yellowBackground: string;
  yellowBackgroundHover: string;
  yellowBorder: string;
  yellowBorderHover: string;
  yellowLight: string;
  yellowLightHover: string;
  yellowLightBackground: string;
  yellowLightBackgroundHover: string;
  yellowLightBorder: string;
  yellowLightBorderHover: string;
  orange: string;
  orangeHover: string;
  orangeBackground: string;
  orangeBackgroundHover: string;
  orangeBorder: string;
  orangeBorderHover: string;
  orangeLight: string;
  orangeLightHover: string;
  orangeLightBackground: string;
  orangeLightBackgroundHover: string;
  orangeLightBorder: string;
  orangeLightBorderHover: string;
  orangeLighter: string;
  orangeLighterHover: string;
  orangeLighterBackground: string;
  orangeLighterBackgroundHover: string;
  orangeLighterBorder: string;
  orangeLighterBorderHover: string;
  redDark: string;
  redDarkHover: string;
  redDarkBackground: string;
  redDarkBackgroundHover: string;
  redDarkBorder: string;
  redDarkBorderHover: string;
  red: string;
  redHover: string;
  redBackground: string;
  redBackgroundHover: string;
  redBorder: string;
  redBorderHover: string;
  magentaDark: string;
  magentaDarkHover: string;
  magentaDarkBackground: string;
  magentaDarkBackgroundHover: string;
  magentaDarkBorder: string;
  magentaDarkBorderHover: string;
  magenta: string;
  magentaHover: string;
  magentaBackground: string;
  magentaBackgroundHover: string;
  magentaBorder: string;
  magentaBorderHover: string;
  magentaLight: string;
  magentaLightHover: string;
  magentaLightBackground: string;
  magentaLightBackgroundHover: string;
  magentaLightBorder: string;
  magentaLightBorderHover: string;
  purpleDark: string;
  purpleDarkHover: string;
  purpleDarkBackground: string;
  purpleDarkBackgroundHover: string;
  purpleDarkBorder: string;
  purpleDarkBorderHover: string;
  purple: string;
  purpleHover: string;
  purpleBackground: string;
  purpleBackgroundHover: string;
  purpleBorder: string;
  purpleBorderHover: string;
  purpleLight: string;
  purpleLightHover: string;
  purpleLightBackground: string;
  purpleLightBackgroundHover: string;
  purpleLightBorder: string;
  purpleLightBorderHover: string;
  blueDark: string;
  blueDarkHover: string;
  blueDarkBackground: string;
  blueDarkBackgroundHover: string;
  blueDarkBorder: string;
  blueDarkBorderHover: string;
  blueMid: string;
  blueMidHover: string;
  blueMidBackground: string;
  blueMidBackgroundHover: string;
  blueMidBorder: string;
  blueMidBorderHover: string;
  blue: string;
  blueHover: string;
  blueBackground: string;
  blueBackgroundHover: string;
  blueBorder: string;
  blueBorderHover: string;
  blueLight: string;
  blueLightHover: string;
  blueLightBackground: string;
  blueLightBackgroundHover: string;
  blueLightBorder: string;
  blueLightBorderHover: string;
  tealDark: string;
  tealDarkHover: string;
  tealDarkBackground: string;
  tealDarkBackgroundHover: string;
  tealDarkBorder: string;
  tealDarkBorderHover: string;
  teal: string;
  tealHover: string;
  tealBackground: string;
  tealBackgroundHover: string;
  tealBorder: string;
  tealBorderHover: string;
  tealLight: string;
  tealLightHover: string;
  tealLightBackground: string;
  tealLightBackgroundHover: string;
  tealLightBorder: string;
  tealLightBorderHover: string;
  greenDark: string;
  greenDarkHover: string;
  greenDarkBackground: string;
  greenDarkBackgroundHover: string;
  greenDarkBorder: string;
  greenDarkBorderHover: string;
  green: string;
  greenHover: string;
  greenBackground: string;
  greenBackgroundHover: string;
  greenBorder: string;
  greenBorderHover: string;
  greenLight: string;
  greenLightHover: string;
  greenLightBackground: string;
  greenLightBackgroundHover: string;
  greenLightBorder: string;
  greenLightBorderHover: string;
}

// Standard font sizes.
export namespace FontSizes {
  export const mini: string = '10px';
  export const xSmall: string = '10px';
  export const small: string = '12px';
  export const smallPlus: string = '12px';
  export const medium: string = '14px';
  export const mediumPlus: string = '16px';
  export const icon: string = '16px';
  export const large: string = '18px';
  export const xLarge: string = '20px';
  export const xLargePlus: string = '24px';
  export const xxLarge: string = '28px';
  export const xxLargePlus: string = '32px';
  export const superLarge: string = '42px';
  export const mega: string = '68px';
}

// Standard font weights.
export namespace FontWeights {
  export const light: IFontWeight = 100;
  export const semilight: IFontWeight = 300;
  export const regular: IFontWeight = 400;
  export const semibold: IFontWeight = 600;
  export const bold: IFontWeight = 700;
}

// Standard Icon Sizes.
export namespace IconFontSizes {
  export const xSmall: string = '10px';
  export const small: string = '12px';
  export const medium: string = '16px';
  export const large: string = '20px';
}

// Fallback fonts, if specified system or web fonts are unavailable.
const FontFamilyFallbacks = `'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif`;

// Font face names to be registered.
export namespace LocalizedFontNames {
  export const Arabic = 'Segoe UI Web (Arabic)';
  export const Cyrillic = 'Segoe UI Web (Cyrillic)';
  export const EastEuropean = 'Segoe UI Web (East European)';
  export const Greek = 'Segoe UI Web (Greek)';
  export const Hebrew = 'Segoe UI Web (Hebrew)';
  export const Thai = 'Leelawadee UI Web';
  export const Vietnamese = 'Segoe UI Web (Vietnamese)';
  export const WestEuropean = 'Segoe UI Web (West European)';
  export const Selawik = 'Selawik Web';
  export const Armenian = 'Segoe UI Web (Armenian)';
  export const Georgian = 'Segoe UI Web (Georgian)';
}

// Font families with fallbacks, for the general regions.
export namespace LocalizedFontFamilies {
  export const Arabic = `'${LocalizedFontNames.Arabic}'`;
  export const ChineseSimplified = `'Microsoft Yahei UI', Verdana, Simsun`;
  export const ChineseTraditional = `'Microsoft Jhenghei UI', Pmingliu`;
  export const Cyrillic = `'${LocalizedFontNames.Cyrillic}'`;
  export const EastEuropean = `'${LocalizedFontNames.EastEuropean}'`;
  export const Greek = `'${LocalizedFontNames.Greek}'`;
  export const Hebrew = `'${LocalizedFontNames.Hebrew}'`;
  export const Hindi = `'Nirmala UI'`;
  export const Japanese = `'Yu Gothic UI', 'Meiryo UI', Meiryo, 'MS Pgothic', Osaka`;
  export const Korean = `'Malgun Gothic', Gulim`;
  export const Selawik = `'${LocalizedFontNames.Selawik}'`;
  export const Thai = `'Leelawadee UI Web', 'Kmer UI'`;
  export const Vietnamese = `'${LocalizedFontNames.Vietnamese}'`;
  export const WestEuropean = `'${LocalizedFontNames.WestEuropean}'`;
  export const Armenian = `'${LocalizedFontNames.Armenian}'`;
  export const Georgian = `'${LocalizedFontNames.Georgian}'`;
}

// Mapping of language prefix to to font family.
const LanguageToFontMap = {
  ar: LocalizedFontFamilies.Arabic,
  bg: LocalizedFontFamilies.Cyrillic,
  cs: LocalizedFontFamilies.EastEuropean,
  el: LocalizedFontFamilies.Greek,
  et: LocalizedFontFamilies.EastEuropean,
  he: LocalizedFontFamilies.Hebrew,
  hi: LocalizedFontFamilies.Hindi,
  hr: LocalizedFontFamilies.EastEuropean,
  hu: LocalizedFontFamilies.EastEuropean,
  ja: LocalizedFontFamilies.Japanese,
  kk: LocalizedFontFamilies.EastEuropean,
  ko: LocalizedFontFamilies.Korean,
  lt: LocalizedFontFamilies.EastEuropean,
  lv: LocalizedFontFamilies.EastEuropean,
  pl: LocalizedFontFamilies.EastEuropean,
  ru: LocalizedFontFamilies.Cyrillic,
  sk: LocalizedFontFamilies.EastEuropean,
  'sr-latn': LocalizedFontFamilies.EastEuropean,
  th: LocalizedFontFamilies.Thai,
  tr: LocalizedFontFamilies.EastEuropean,
  uk: LocalizedFontFamilies.Cyrillic,
  vi: LocalizedFontFamilies.Vietnamese,
  'zh-hans': LocalizedFontFamilies.ChineseSimplified,
  'zh-hant': LocalizedFontFamilies.ChineseTraditional,
  hy: LocalizedFontFamilies.Armenian,
  ka: LocalizedFontFamilies.Georgian
};

// When adding or removing a color, make sure you keep this consistent with IColorClassNames by adding the color variants.
export const DefaultPalette: IPalette = {
  themeDarker: '#004578',
  themeDark: '#005a9e',
  themeDarkAlt: '#106ebe',
  themePrimary: '#0078d4',
  themeSecondary: '#2b88d8',
  themeTertiary: '#71afe5',
  themeLight: '#c7e0f4',
  themeLighter: '#deecf9',
  themeLighterAlt: '#eff6fc',
  black: '#000000',
  blackTranslucent40: 'rgba(0,0,0,.4)',
  neutralDark: '#201f1e',
  neutralPrimary: '#323130',
  neutralPrimaryAlt: '#3b3a39',
  neutralSecondary: '#605e5c',
  neutralSecondaryAlt: '#8a8886',
  neutralTertiary: '#a19f9d',
  neutralTertiaryAlt: '#c8c6c4',
  neutralQuaternary: '#d2d0ce',
  neutralQuaternaryAlt: '#e1dfdd',
  neutralLight: '#edebe9',
  neutralLighter: '#f3f2f1',
  neutralLighterAlt: '#faf9f8',
  accent: '#0078d4',
  white: '#ffffff',
  whiteTranslucent40: 'rgba(255,255,255,.4)',
  yellowDark: '#d29200',
  yellow: '#ffb900',
  yellowLight: '#fff100',
  orange: '#d83b01',
  orangeLight: '#ea4300',
  orangeLighter: '#ff8c00',
  redDark: '#a4262c',
  red: '#e81123',
  magentaDark: '#5c005c',
  magenta: '#b4009e',
  magentaLight: '#e3008c',
  purpleDark: '#32145a',
  purple: '#5c2d91',
  purpleLight: '#b4a0ff',
  blueDark: '#002050',
  blueMid: '#00188f',
  blue: '#0078d4',
  blueLight: '#00bcf2',
  tealDark: '#004b50',
  teal: '#008272',
  tealLight: '#00b294',
  greenDark: '#004b1c',
  green: '#107c10',
  greenLight: '#bad80a'
};


export const DefaultSpacing: ISpacing = {
  s2: '4px',
  s1: '8px',
  m: '16px',
  l1: '20px',
  l2: '32px'
};

export const ColorClassNames: IColorClassNames = {} as IColorClassNames;

for (const colorName in DefaultPalette) {
  if (DefaultPalette.hasOwnProperty(colorName)) {
    // Foreground color
    _defineGetter(ColorClassNames, colorName, '', false, 'color');

    // Hover color
    _defineGetter(ColorClassNames, colorName, 'Hover', true, 'color');

    // Background color
    _defineGetter(ColorClassNames, colorName, 'Background', false, 'background');

    // Background hover
    _defineGetter(ColorClassNames, colorName, 'BackgroundHover', true, 'background');

    // Border color
    _defineGetter(ColorClassNames, colorName, 'Border', false, 'borderColor');

    // Border hover color
    _defineGetter(ColorClassNames, colorName, 'BorderHover', true, 'borderColor');
  }
}

/**
 * Defines a getter for the given class configuration.
 */
function _defineGetter(obj: IColorClassNames, colorName: string, suffix: string, isHover: boolean, cssProperty: string): void {
  Object.defineProperty(obj, colorName + suffix, {
    get: (): string => {
      // tslint:disable-next-line:no-any
      const style: IRawStyle = { [cssProperty]: (getTheme().palette as any)[colorName] };

      return mergeStyles(isHover ? { selectors: { ':hover': style } } : style).toString();
    },
    enumerable: true,
    configurable: true
  });
}

// Standard font styling.
export const DefaultFontStyles: IFontStyles = createFontStyles(getLanguage());

export const FontClassNames: { [key in keyof IFontStyles]?: string } = buildClassMap(DefaultFontStyles);

export const HighContrastSelector = '@media screen and (-ms-high-contrast: active)';
export const HighContrastSelectorWhite = '@media screen and (-ms-high-contrast: black-on-white)';
export const HighContrastSelectorBlack = '@media screen and (-ms-high-contrast: white-on-black)';

export const ScreenWidthMinSmall = 320;
export const ScreenWidthMinMedium = 480;
export const ScreenWidthMinLarge = 640;
export const ScreenWidthMinXLarge = 1024;
export const ScreenWidthMinXXLarge = 1366;
export const ScreenWidthMinXXXLarge = 1920;
export const ScreenWidthMaxSmall = ScreenWidthMinMedium - 1;
export const ScreenWidthMaxMedium = ScreenWidthMinLarge - 1;
export const ScreenWidthMaxLarge = ScreenWidthMinXLarge - 1;
export const ScreenWidthMaxXLarge = ScreenWidthMinXXLarge - 1;
export const ScreenWidthMaxXXLarge = ScreenWidthMinXXXLarge - 1;

export const ScreenWidthMinUhfMobile = 768;

export function getScreenSelector(min: number, max: number): string {
  return `@media only screen and (min-width: ${min}px) and (max-width: ${max}px)`;
}


export const DefaultEffects: IEffects = {
  // commented values are the defaults for Fluent
  elevation4: '0 1.6px 3.6px 0 rgba(0, 0, 0, 0.132), 0 0.3px 0.9px 0 rgba(0, 0, 0, 0.108)',
  elevation8: '0 3.2px 7.2px 0 rgba(0, 0, 0, 0.132), 0 0.6px 1.8px 0 rgba(0, 0, 0, 0.108)',
  elevation16: '0 6.4px 14.4px 0 rgba(0, 0, 0, 0.132), 0 1.2px 3.6px 0 rgba(0, 0, 0, 0.108)',
  elevation64: '0 25.6px 57.6px 0 rgba(0, 0, 0, 0.22), 0 4.8px 14.4px 0 rgba(0, 0, 0, 0.18)',

  roundedCorner2: '2px'
};


// Default urls.
const DefaultBaseUrl = 'https://static2.sharepointonline.com/files/fabric/assets';



function _registerFontFace(fontFamily: string, url: string, fontWeight?: IFontWeight, localFontName?: string): void {
  fontFamily = `'${fontFamily}'`;

  const localFontSrc = localFontName !== undefined ? `local('${localFontName}'),` : '';

  fontFace({
    fontFamily,
    src: localFontSrc + `url('${url}.woff2') format('woff2'),` + `url('${url}.woff') format('woff')`,
    fontWeight,
    fontStyle: 'normal',
    //@ts-ignore
    fontDisplay: 'swap'
  });
}

function _registerFontFaceSet(
  baseUrl: string,
  fontFamily: string,
  cdnFolder: string,
  cdnFontName: string = 'segoeui',
  localFontName?: string
): void {
  const urlBase = `${baseUrl}/${cdnFolder}/${cdnFontName}`;

  _registerFontFace(fontFamily, urlBase + '-light', FontWeights.light, localFontName && localFontName + ' Light');
  _registerFontFace(fontFamily, urlBase + '-semilight', FontWeights.semilight, localFontName && localFontName + ' SemiLight');
  _registerFontFace(fontFamily, urlBase + '-regular', FontWeights.regular, localFontName);
  _registerFontFace(fontFamily, urlBase + '-semibold', FontWeights.semibold, localFontName && localFontName + ' SemiBold');
}

export function registerDefaultFontFaces(baseUrl: string): void {
  if (baseUrl) {
    const fontUrl = `${baseUrl}/fonts`;

    // Produce @font-face definitions for all supported web fonts.
    _registerFontFaceSet(fontUrl, LocalizedFontNames.Thai, 'leelawadeeui-thai', 'leelawadeeui');
    _registerFontFaceSet(fontUrl, LocalizedFontNames.Arabic, 'segoeui-arabic');
    _registerFontFaceSet(fontUrl, LocalizedFontNames.Cyrillic, 'segoeui-cyrillic');
    _registerFontFaceSet(fontUrl, LocalizedFontNames.EastEuropean, 'segoeui-easteuropean');
    _registerFontFaceSet(fontUrl, LocalizedFontNames.Greek, 'segoeui-greek');
    _registerFontFaceSet(fontUrl, LocalizedFontNames.Hebrew, 'segoeui-hebrew');
    _registerFontFaceSet(fontUrl, LocalizedFontNames.Vietnamese, 'segoeui-vietnamese');
    _registerFontFaceSet(fontUrl, LocalizedFontNames.WestEuropean, 'segoeui-westeuropean', 'segoeui', 'Segoe UI');
    _registerFontFaceSet(fontUrl, LocalizedFontFamilies.Selawik, 'selawik', 'selawik');
    _registerFontFaceSet(fontUrl, LocalizedFontNames.Armenian, 'segoeui-armenian');
    _registerFontFaceSet(fontUrl, LocalizedFontNames.Georgian, 'segoeui-georgian');

    // Leelawadee UI (Thai) does not have a 'light' weight, so we override
    // the font-face generated above to use the 'semilight' weight instead.
    _registerFontFace('Leelawadee UI Web', `${fontUrl}/leelawadeeui-thai/leelawadeeui-semilight`, FontWeights.light);

    // Leelawadee UI (Thai) does not have a 'semibold' weight, so we override
    // the font-face generated above to use the 'bold' weight instead.
    _registerFontFace('Leelawadee UI Web', `${fontUrl}/leelawadeeui-thai/leelawadeeui-bold`, FontWeights.semibold);
  }
}

/**
 * Reads the fontBaseUrl from window.FabricConfig.fontBaseUrl or falls back to a default.
 */
function _getFontBaseUrl(): string {
  let win = getWindow();

  // tslint:disable-next-line:no-string-literal no-any
  let fabricConfig: IFabricConfig = win ? win['FabricConfig'] : undefined;

  return fabricConfig && fabricConfig.fontBaseUrl !== undefined ? fabricConfig.fontBaseUrl : DefaultBaseUrl;
}

/**
 * Register the font faces.
 */
registerDefaultFontFaces(_getFontBaseUrl());








// By default, we favor system fonts for the default.
// All localized fonts use a web font and never use the system font.
var defaultFontFamily = `'Segoe UI', '${LocalizedFontNames.WestEuropean}'`;



function _fontFamilyWithFallbacks(fontFamily: string): string {
  return `${fontFamily}, ${FontFamilyFallbacks}`;
}

export function createFontStyles(localeCode: string | null): IFontStyles {
  const localizedFont = _getLocalizedFontFamily(localeCode);
  let fontFamilyWithFallback = _fontFamilyWithFallbacks(localizedFont);

  const fontStyles = {
    tiny: _createFont(FontSizes.mini, FontWeights.regular, fontFamilyWithFallback),
    xSmall: _createFont(FontSizes.xSmall, FontWeights.regular, fontFamilyWithFallback),
    small: _createFont(FontSizes.small, FontWeights.regular, fontFamilyWithFallback),
    smallPlus: _createFont(FontSizes.smallPlus, FontWeights.regular, fontFamilyWithFallback),
    medium: _createFont(FontSizes.medium, FontWeights.regular, fontFamilyWithFallback),
    mediumPlus: _createFont(FontSizes.mediumPlus, FontWeights.regular, fontFamilyWithFallback),
    large: _createFont(FontSizes.large, FontWeights.regular, fontFamilyWithFallback),
    xLarge: _createFont(FontSizes.xLarge, FontWeights.semibold, fontFamilyWithFallback),
    xLargePlus: _createFont(FontSizes.xLargePlus, FontWeights.semibold, fontFamilyWithFallback),
    xxLarge: _createFont(FontSizes.xxLarge, FontWeights.semibold, fontFamilyWithFallback),
    xxLargePlus: _createFont(FontSizes.xxLargePlus, FontWeights.semibold, fontFamilyWithFallback),
    superLarge: _createFont(FontSizes.superLarge, FontWeights.semibold, fontFamilyWithFallback),
    mega: _createFont(FontSizes.mega, FontWeights.semibold, fontFamilyWithFallback)
  };

  return fontStyles;
}

/**
 * If there is a localized font for this language, return that. Returns undefined if there is no localized font for that language.
 */
function _getLocalizedFontFamily(language: string | null): string {
  for (let lang in LanguageToFontMap) {
    if (LanguageToFontMap.hasOwnProperty(lang) && language && lang.indexOf(language) === 0) {
      // tslint:disable-next-line:no-any
      return (LanguageToFontMap as any)[lang];
    }
  }

  return defaultFontFamily;
}

function _createFont(size: string, weight: IFontWeight, fontFamily: string): IRawStyle {
  return {
    fontFamily: fontFamily,
    MozOsxFontSmoothing: 'grayscale',
    WebkitFontSmoothing: 'antialiased',
    fontSize: size,
    fontWeight: weight
  };
}


export const normalize: IRawStyle = {
  boxShadow: 'none',
  margin: 0,
  padding: 0,
  boxSizing: 'border-box'
};

export const noWrap: IRawStyle = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};


interface IRGB {
  r: number;
  g: number;
  b: number;
}

const DEFAULT_HEIGHT = '50%';
const DEFAULT_WIDTH = 20;

/**
 * - Generates a style used to fade out an overflowing content by defining a style for an :after pseudo element.
 * - Apply it to the :after selector for all combination of states the parent of content might have (normal, hover, selected, focus).
 * - Requires the target to have position set to relative and overflow set to hidden.
 *
 * @example
 * ```tsx
 * // Assuming the following DOM structure and the different background colors coming from the parent holding the content.
 * <div className={classNames.parent}>
 *   <span className={classNames.content}>Overflown Content</span>
 * </div>
 * ```
 * ```ts
 * // This is how the style set would look in Component.styles.ts
 * const { bodyBackground } = theme.semanticColors;
 * const { neutralLighter } = theme.palette;
 *
 * // The second argument of getFadedOverflowStyle function is a string representing a key of ISemanticColors or IPalette.
 *
 * const styles = {
 *   parent: [
 *     backgroundColor: bodyBackground,
 *     selectors: {
 *       '&:hover: {
 *         backgroundColor: neutralLighter
 *       },
 *       '$content:after': {
 *         ...getFadedOverflowStyle(theme, 'bodyBackground')
 *       },
 *       '&:hover $content:after': {
 *         ...getFadedOverflowStyle(theme, 'neutralLighter')
 *       }
 *     }
 *   ],
 *   content: [
 *     width: '100%',
 *     display: 'inline-block',
 *     position: 'relative',
 *     overflow: 'hidden'
 *   ]
 * }
 * ```
 * @param theme - The theme object to use.
 * @param color - The background color to fade out to. Accepts only keys of ISemanticColors or IPalette. Defaults to 'bodyBackground'.
 * @param direction - The direction of the overflow. Defaults to horizontal.
 * @param width - The width of the fading overflow. Vertical direction defaults it to 100% vs 20px when horizontal.
 * @param height - The Height of the fading overflow. Vertical direction defaults it to 50% vs 100% when horizontal.
 * @returns The style object.
 */
export function getFadedOverflowStyle(
  theme: ITheme,
  color: keyof ISemanticColors | keyof IPalette = 'bodyBackground',
  direction: 'horizontal' | 'vertical' = 'horizontal',
  width: string | number = getDefaultValue('width', direction),
  height: string | number = getDefaultValue('height', direction)
): IRawStyle {
  // Get the color value string from the theme semanticColors or palette.
  const colorValue: string = theme.semanticColors[color as keyof ISemanticColors] || theme.palette[color as keyof IPalette];
  // Get the red, green, blue values of the colorValue.
  const rgbColor: IRGB = color2rgb(colorValue);
  // Apply opacity 0 to serve as a start color of the gradient.
  const rgba = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0)`;
  // Get the direction of the gradient.
  const gradientDirection = direction === 'vertical' ? 'to bottom' : 'to right'; // mergeStyles take care of RTL direction.

  return {
    content: '""',
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    pointerEvents: 'none',
    backgroundImage: `linear-gradient(${gradientDirection}, ${rgba} 0%, ${colorValue} 100%)`
  };
}

// TODO consider moving this to a separate module along with some more color functions from OUFR/utilities.
/**
 * Helper function to convert a string hex color to an RGB object.
 *
 * @param colorValue - Color to be converted from hex to rgba.
 */
function color2rgb(colorValue: string): IRGB {
  if (colorValue[0] === '#') {
    // If it's a hex code
    return {
      r: parseInt(colorValue.slice(1, 3), 16),
      g: parseInt(colorValue.slice(3, 5), 16),
      b: parseInt(colorValue.slice(5, 7), 16)
    };
  } else if (colorValue.indexOf('rgba(') === 0) {
    // If it's an rgba color string
    colorValue = colorValue.match(/rgba\(([^)]+)\)/)![1];
    const parts = colorValue.split(/ *, */).map(Number);

    return {
      r: parts[0],
      g: parts[1],
      b: parts[2]
    };
  }
  // The only remaining possibility is transparent.
  return {
    r: 255,
    g: 255,
    b: 255
  };
}

/**
 * Helper function to get the default values for parameters of main function.
 *
 * @param style - Which style to get the default value for.
 * @param direction - What direction to take into consideration.
 */
function getDefaultValue(style: 'width' | 'height', direction: string): number | string {
  if (style === 'width') {
    return direction === 'horizontal' ? DEFAULT_WIDTH : '100%';
  } else {
    return direction === 'vertical' ? DEFAULT_HEIGHT : '100%';
  }
}


/**
 * Generates a focus style which can be used to define an :after focus border.
 *
 * @param theme - The theme object to use.
 * @param options - Options to customize the focus border.
 * @returns The style object.
 */
export function getFocusStyle(theme: ITheme, options?: IGetFocusStylesOptions): IRawStyle;
/**
 * Generates a focus style which can be used to define an :after focus border.
 *
 * @param theme - The theme object to use.
 * @param inset - The number of pixels to inset the border.
 * @param position - The positioning applied to the container. Must
 * be 'relative' or 'absolute' so that the focus border can live around it.
 * @param highContrastStyle - Style for high contrast mode.
 * @param borderColor - Color of the border.
 * @param outlineColor - Color of the outline.
 * @param isFocusedOnly - If the styles should apply on focus or not.
 * @returns The style object.
 * @deprecated Use the object parameter version instead.
 */
export function getFocusStyle(
  theme: ITheme,
  inset?: number,
  position?: 'relative' | 'absolute',
  highContrastStyle?: IRawStyle | undefined,
  borderColor?: string,
  outlineColor?: string,
  isFocusedOnly?: boolean
): IRawStyle;
export function getFocusStyle(
  theme: ITheme,
  insetOrOptions?: number | IGetFocusStylesOptions,
  position?: 'relative' | 'absolute',
  highContrastStyle?: IRawStyle,
  borderColor?: string,
  outlineColor?: string,
  isFocusedOnly?: boolean
): IRawStyle {
  if (typeof insetOrOptions === 'number' || !insetOrOptions) {
    //@ts-ignore
    return _getFocusStyleInternal(theme, { inset: insetOrOptions, position, highContrastStyle, borderColor, outlineColor, isFocusedOnly });
  } else {
    return _getFocusStyleInternal(theme, insetOrOptions);
  }
}

function _getFocusStyleInternal(theme: ITheme, options: IGetFocusStylesOptions = {}): IRawStyle {
  const {
    inset = 0,
    width = 1,
    position = 'relative',
    highContrastStyle,
    borderColor = theme.palette.white,
    outlineColor = theme.palette.neutralSecondary,
    isFocusedOnly = true
  } = options;

  return {
    // Clear browser-specific focus styles and use 'transparent' as placeholder for focus style.
    outline: 'transparent',
    // Requirement because pseudo-element is absolutely positioned.
    position,

    selectors: {
      // Clear the focus border in Firefox.
      // Reference: http://stackoverflow.com/a/199319/1436671
      '::-moz-focus-inner': {
        border: '0'
      },

      // When the element that uses this mixin is in a :focus state, add a pseudo-element to
      // create a border.
      [`.${IsFocusVisibleClassName} &${isFocusedOnly ? ':focus' : ''}:after`]: {
        content: '""',
        position: 'absolute',
        left: inset + 1,
        top: inset + 1,
        bottom: inset + 1,
        right: inset + 1,
        border: `${width}px solid ${borderColor}`,
        outline: `${width}px solid ${outlineColor}`,
        zIndex: ZIndexes.FocusStyle,
        selectors: {
          [HighContrastSelector]: highContrastStyle
        }
      }
    }
  };
}

/**
 * Generates style to clear browser specific focus styles.
 */
export function focusClear(): IRawStyle {
  return {
    selectors: {
      '&::-moz-focus-inner': {
        // Clear the focus border in Firefox. Reference: http://stackoverflow.com/a/199319/1436671
        border: 0
      },
      '&': {
        // Clear browser specific focus styles and use transparent as placeholder for focus style
        outline: 'transparent'
      }
    }
  };
}

/**
 * Generates a style which can be used to set a border on focus.
 *
 * @param theme - The theme object to use.
 * @param inset - The number of pixels to inset the border (default 0)
 * @param width - The border width in pixels (default 1)
 * @param color - Color of the outline (default `theme.palette.neutralSecondary`)
 * @returns The style object.
 */
export function getFocusOutlineStyle(theme: ITheme, inset: number = 0, width: number = 1, color?: string): IRawStyle {
  return {
    selectors: {
      [`:global(${IsFocusVisibleClassName}) &:focus`]: {
        outline: `${width} solid ${color || theme.palette.neutralSecondary}`,
        outlineOffset: `${-inset}px`
      }
    }
  };
}


//export type GlobalClassNames<IStyles> = Record<keyof IStyles, string>;

/**
 * Internal memoized function which simply takes in the class map and the
 * disable boolean. These immutable values can be memoized.
 */
const _getGlobalClassNames = memoizeFunction(
  <T>(classNames: GlobalClassNames<T>, disableGlobalClassNames?: boolean): Partial<GlobalClassNames<T>> => {
    const styleSheet = Stylesheet.getInstance();

    if (disableGlobalClassNames) {
      // disable global classnames
      return Object.keys(classNames).reduce((acc: {}, className: string) => {
        acc[className] = styleSheet.getClassName(classNames[className]);
        return acc;
      }, {});
    }

    // use global classnames
    return classNames;
  }
);

/**
 * Checks for the `disableGlobalClassNames` property on the `theme` to determine if it should return `classNames`
 * Note that calls to this function are memoized.
 *
 * @param classNames - The collection of global class names that apply when the flag is false. Make sure to pass in
 * the same instance on each call to benefit from memoization.
 * @param theme - The theme to check the flag on
 * @param disableGlobalClassNames - Optional. Explicitly opt in/out of disabling global classnames. Defaults to false.
 */
export function getGlobalClassNames<T>(
  classNames: GlobalClassNames<T>,
  theme: ITheme,
  disableGlobalClassNames?: boolean
): Partial<GlobalClassNames<T>> {
  return _getGlobalClassNames(classNames, disableGlobalClassNames !== undefined ? disableGlobalClassNames : theme.disableGlobalClassNames);
}


/**
 * Generates placeholder style for each of the browsers supported by office-ui-fabric-react.
 * @param styles - The style to use.
 * @returns The placeholder style object for each browser depending on the placeholder directive it uses.
 */
export function getPlaceholderStyles(styles: IStyle): IStyle {
  return {
    selectors: {
      '::placeholder': styles, // Chrome, Safari, Opera, Firefox
      ':-ms-input-placeholder': styles, // IE 10+
      '::-ms-input-placeholder': styles // Edge
    }
  };
}


export const hiddenContentStyle: IRawStyle = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  border: 0,
  overflow: 'hidden'
};


export type IIconSubset = {
  fontFace?: Partial<IFontFace>
  icons: {
    [key: string]: string | JSX.Element;
  };

  style?: Partial<IRawStyle>;
}

// export interface IIconSubset {
//   fontFace?: IFontFace;
//   icons: {
//     [key: string]: string | JSX.Element;
//   };

//   style?: IRawStyle;
// }

export interface IIconSubsetRecord extends IIconSubset {
  isRegistered?: boolean;
  className?: string;
}

export interface IIconRecord {
  code: string | undefined;
  subset: IIconSubsetRecord;
}

export interface IIconOptions {
  disableWarnings: boolean;
  warnOnMissingIcons?: boolean;
}

export interface IIconRecords {
  __options: IIconOptions;
  __remapped: { [key: string]: string };
  [key: string]: IIconRecord | {};
}

const ICON_SETTING_NAME = 'icons';

const _iconSettings = GlobalSettings.getValue<IIconRecords>(ICON_SETTING_NAME, {
  __options: {
    disableWarnings: false,
    warnOnMissingIcons: true
  },
  __remapped: {}
});

// Reset icon registration on stylesheet resets.
const stylesheet = Stylesheet.getInstance();

if (stylesheet && stylesheet.onReset) {
  stylesheet.onReset(() => {
    for (const name in _iconSettings) {
      if (_iconSettings.hasOwnProperty(name) && !!(_iconSettings[name] as IIconRecord).subset) {
        (_iconSettings[name] as IIconRecord).subset.className = undefined;
      }
    }
  });
}

/**
 * Normalizes an icon name for consistent mapping.
 * Current implementation is to convert the icon name to lower case.
 *
 * @param name - Icon name to normalize.
 * @returns {string} Normalized icon name to use for indexing and mapping.
 */
const normalizeIconName = (name: string): string => name.toLowerCase();




//export function registerIcons(iconSubset: IIconSubset, options?: Partial<IIconOptions>): void {
/**
 * Registers a given subset of icons.
 *
 * @param iconSubset - the icon subset definition.
 */
 export function registerIcons<T extends any>(iconSubset: T, options?: Partial<IIconOptions>): void {
  let subset = {
    ...iconSubset,
    isRegistered: false,
    className: undefined
  };
  let { icons } = iconSubset;

  // Grab options, optionally mix user provided ones on top.
  options = options ? { ..._iconSettings.__options, ...options } : _iconSettings.__options;

  for (const iconName in icons) {
    if (icons.hasOwnProperty(iconName)) {
      const code = icons[iconName];
      const normalizedIconName = normalizeIconName(iconName);

      if (_iconSettings[normalizedIconName]) {
        _warnDuplicateIcon(iconName);
      } else {
        //@ts-ignore
        _iconSettings[normalizedIconName] = {
          code,
          subset
        } //as IIconRecord;
      }
    }
  }
}

/**
 * Unregisters icons by name.
 *
 * @param iconNames - List of icons to unregister.
 */
export function unregisterIcons(iconNames: string[]): void {
  const options = _iconSettings.__options;

  for (const iconName of iconNames) {
    const normalizedIconName = normalizeIconName(iconName);
    if (_iconSettings[normalizedIconName]) {
      delete _iconSettings[normalizedIconName];
    } else {
      // Warn that we are trying to delete an icon that doesn't exist
      if (!options.disableWarnings) {
        warn(`The icon "${iconName}" tried to unregister but was not registered.`);
      }
    }

    // Delete any aliases for this iconName
    if (_iconSettings.__remapped[normalizedIconName]) {
      delete _iconSettings.__remapped[normalizedIconName];
    }

    // Delete any items that were an alias for this iconName
    Object.keys(_iconSettings.__remapped).forEach((key: string) => {
      if (_iconSettings.__remapped[key] === normalizedIconName) {
        delete _iconSettings.__remapped[key];
      }
    });
  }
}

/**
 * Remaps one icon name to another.
 */
export function registerIconAlias(iconName: string, mappedToName: string): void {
  _iconSettings.__remapped[normalizeIconName(iconName)] = normalizeIconName(mappedToName);
}

/**
 * Gets an icon definition. If an icon is requested but the subset has yet to be registered,
 * it will get registered immediately.
 *
 * @public
 * @param name - Name of icon.
 */
export function getIcon(name?: string): IIconRecord | undefined {
  let icon: IIconRecord | undefined = undefined;
  const options = _iconSettings.__options;

  name = name ? normalizeIconName(name) : '';
  name = _iconSettings.__remapped[name] || name;

  if (name) {
    icon = _iconSettings[name!] as IIconRecord;

    if (icon) {
      let { subset } = icon;
      if (subset && subset.fontFace) {
        if (!subset.isRegistered) {
          fontFace(subset.fontFace);
          subset.isRegistered = true;
        }

        if (!subset.className) {
          subset.className = mergeStyles(subset.style, {
            fontFamily: subset.fontFace.fontFamily,
            fontWeight: subset.fontFace.fontWeight || 'normal',
            fontStyle: subset.fontFace.fontStyle || 'normal'
          });
        }
      }
    } else {
      if (!options.disableWarnings && options.warnOnMissingIcons) {
        warn(`The icon "${name}" was used but not registered. See http://aka.ms/fabric-icon-usage for more information.`);
      }
    }
  }

  return icon;
}

/**
 * Sets the icon options.
 *
 * @public
 */
export function setIconOptions(options: Partial<IIconOptions>): void {
  _iconSettings.__options = {
    ..._iconSettings.__options,
    ...options
  };
}

let _missingIcons: string[] = [];
let _missingIconsTimer: any | number | undefined = undefined;

function _warnDuplicateIcon(iconName: string): void {
  const options = _iconSettings.__options;
  const warningDelay = 2000;
  const maxIconsInMessage = 10;

  if (!options.disableWarnings) {
    _missingIcons.push(iconName);
    if (_missingIconsTimer === undefined) {
      _missingIconsTimer = setTimeout(() => {
        warn(
          `Some icons were re-registered. Applications should only call registerIcons for any given ` +
          `icon once. Redefining what an icon is may have unintended consequences. Duplicates ` +
          `include: \n` +
          _missingIcons.slice(0, maxIconsInMessage).join(', ') +
          (_missingIcons.length > maxIconsInMessage ? ` (+ ${_missingIcons.length - maxIconsInMessage} more)` : '')
        );
        _missingIconsTimer = undefined;
        _missingIcons = [];
      }, warningDelay);
    }
  }
}


const defaultIconStyles: IStyle = {
  display: 'inline-block'
};

export function getIconClassName(name: string): string {
  let className = '';
  const icon = getIcon(name);

  if (icon) {
    className = mergeStyles(icon.subset.className, defaultIconStyles, {
      selectors: {
        '::before': {
          content: `"${icon.code}"`
        }
      }
    });
  }
  return className;
}


export interface IAnimationStyles {
  slideRightIn10: IRawStyle;
  slideRightIn20: IRawStyle;
  slideRightIn40: IRawStyle;
  slideRightIn400: IRawStyle;
  slideLeftIn10: IRawStyle;
  slideLeftIn20: IRawStyle;
  slideLeftIn40: IRawStyle;
  slideLeftIn400: IRawStyle;
  slideUpIn10: IRawStyle;
  slideUpIn20: IRawStyle;
  slideDownIn10: IRawStyle;
  slideDownIn20: IRawStyle;
  slideRightOut10: IRawStyle;
  slideRightOut20: IRawStyle;
  slideRightOut40: IRawStyle;
  slideRightOut400: IRawStyle;
  slideLeftOut10: IRawStyle;
  slideLeftOut20: IRawStyle;
  slideLeftOut40: IRawStyle;
  slideLeftOut400: IRawStyle;
  slideUpOut10: IRawStyle;
  slideUpOut20: IRawStyle;
  slideDownOut10: IRawStyle;
  slideDownOut20: IRawStyle;
  scaleUpIn100: IRawStyle;
  scaleDownIn100: IRawStyle;
  scaleUpOut103: IRawStyle;
  scaleDownOut98: IRawStyle;
  fadeIn100: IRawStyle;
  fadeIn200: IRawStyle;
  fadeIn400: IRawStyle;
  fadeIn500: IRawStyle;
  fadeOut100: IRawStyle;
  fadeOut200: IRawStyle;
  fadeOut400: IRawStyle;
  fadeOut500: IRawStyle;
  rotate90deg: IRawStyle;
  rotateN90deg: IRawStyle;
}

export interface IAnimationVariables {
  easeFunction1: string;
  easeFunction2: string;
  durationValue1: string;
  durationValue2: string;
  durationValue3: string;
  durationValue4: string;
}


export interface IEffects {
  /**
   * Used to provide a visual affordance that this element is elevated above the surface it rests on.
   * This is lower than elevations with a higher value, and higher than elevations with a lower value.
   * Used for: cards, grid items
   */
  elevation4: string;
  /**
   * Used to provide a visual affordance that this element is elevated above the surface it rests on.
   * This is lower than elevations with a higher value, and higher than elevations with a lower value.
   * Used for: menus, command surfaces
   */
  elevation8: string;
  /**
   * Used to provide a visual affordance that this element is elevated above the surface it rests on.
   * This is lower than elevations with a higher value, and higher than elevations with a lower value.
   * Used for: search result dropdowns, hover cards, tooltips, help bubbles
   */
  elevation16: string;
  /**
   * Used to provide a visual affordance that this element is elevated above the surface it rests on.
   * This is lower than elevations with a higher value, and higher than elevations with a lower value.
   * Used for: Panels, Dialogs
   */
  elevation64: string;

  /**
   * How much corners should be rounded, for use with border-radius.
   */
  roundedCorner2: string;
}

export interface IFabricConfig {
  /**
   * An override for where the fonts should be downloaded from.
   */
  fontBaseUrl?: string;

  /**
   * The mergeStyles stylesheet config.
   */
  mergeStyles?: IStyleSheetConfig;
}


export interface IFontStyles {
  tiny: IRawStyle;
  xSmall: IRawStyle;
  small: IRawStyle;
  smallPlus: IRawStyle;
  medium: IRawStyle;
  mediumPlus: IRawStyle;
  large: IRawStyle;
  xLarge: IRawStyle;
  /**
   * @deprecated Exists for forward compatibility with Fabric 7's Fluent theme.
   * Not recommended for use with Fabric 6.
   */
  xLargePlus: IRawStyle;
  xxLarge: IRawStyle;
  /**
   * @deprecated Exists for forward compatibility with Fabric 7's Fluent theme
   * Not recommended for use with Fabric 6.
   */
  xxLargePlus: IRawStyle;
  superLarge: IRawStyle;
  mega: IRawStyle;
}


export interface IGetFocusStylesOptions {
  /**
   * The number of pixels to inset the border.
   * @defaultvalue 0
   */
  inset?: number;

  /**
   * The width of the border in pixels.
   * @defaultvalue 1
   */
  width?: number;

  /**
   * The positioning applied to the container.
   * Must be 'relative' or 'absolute' so that the focus border can live around it.
   * @defaultvalue 'relative'
   */
  position?: 'relative' | 'absolute';

  /**
   * Style for high contrast mode.
   */
  highContrastStyle?: IRawStyle;

  /**
   * Color of the border.
   * @defaultvalue theme.palette.white
   */
  borderColor?: string;

  /**
   * Color of the outline.
   * @defaultvalue theme.palette.neutralSecondary
   */
  outlineColor?: string;

  /**
   * If the styles should apply on `:focus` pseudo element.
   * @defaultvalue true
   */
  isFocusedOnly?: boolean;
}

export interface IPalette {
  /**
   * Color code for themeDarker.
   */
  themeDarker: string;

  /**
   * Color code for themeDark.
   */
  themeDark: string;

  /**
   * Color code for themeDarkAlt.
   */
  themeDarkAlt: string;

  /**
   * Color code for themePrimary.
   */
  themePrimary: string;

  /**
   * Color code for themeSecondary.
   */
  themeSecondary: string;

  /**
   * Color code for themeTertiary.
   */
  themeTertiary: string;

  /**
   * Color code for themeLight.
   */
  themeLight: string;

  /**
   * Color code for themeLighter.
   */
  themeLighter: string;

  /**
   * Color code for themeLighterAlt.
   */
  themeLighterAlt: string;

  /**
   * Color code for the strongest color, which is black in the default theme. This is a very light color in inverted themes.
   */
  black: string;

  /**
   * Color code for blackTranslucent40.
   */
  blackTranslucent40: string;

  /**
   * Color code for neutralDark.
   */
  neutralDark: string;

  /**
   * Color code for neutralPrimary.
   */
  neutralPrimary: string;

  /**
   * Color code for neutralPrimaryAlt.
   */
  neutralPrimaryAlt: string;

  /**
   * Color code for neutralSecondary.
   */
  neutralSecondary: string;

  /**
   * Color code for neutralSecondaryAlt.
   */
  neutralSecondaryAlt: string;

  /**
   * Color code for neutralTertiary.
   */
  neutralTertiary: string;

  /**
   * Color code for neutralTertiaryAlt.
   */
  neutralTertiaryAlt: string;

  /**
   * Color code for neutralQuaternary.
   */
  neutralQuaternary: string;

  /**
   * Color code for neutralQuaternaryAlt.
   */
  neutralQuaternaryAlt: string;

  /**
   * Color code for neutralLight.
   */
  neutralLight: string;

  /**
   * Color code for neutralLighter.
   */
  neutralLighter: string;

  /**
   * Color code for neutralLighterAlt.
   */
  neutralLighterAlt: string;

  /**
   * Color code for the accent.
   */
  accent: string;

  /**
   * Color code for the softest color, which is white in the default theme. This is a very dark color in dark themes.
   * This is the page background.
   */
  white: string;

  /**
   * Color code for whiteTranslucent40
   */
  whiteTranslucent40: string;

  /**
   * Color code for yellowDark.
   */
  yellowDark: string;

  /**
   * Color code for yellow.
   */
  yellow: string;

  /**
   * Color code for yellowLight.
   */
  yellowLight: string;

  /**
   * Color code for orange.
   */
  orange: string;

  /**
   * Color code for orangeLight.
   */
  orangeLight: string;

  /**
   * Color code for orangeLighter.
   */
  orangeLighter: string;

  /**
   * Color code for redDark.
   */
  redDark: string;

  /**
   * Color code for red.
   */
  red: string;

  /**
   * Color code for magentaDark.
   */
  magentaDark: string;

  /**
   * Color code for magenta.
   */
  magenta: string;

  /**
   * Color code for magentaLight.
   */
  magentaLight: string;

  /**
   * Color code for purpleDark.
   */
  purpleDark: string;

  /**
   * Color code for purple.
   */
  purple: string;

  /**
   * Color code for purpleLight.
   */
  purpleLight: string;

  /**
   * Color code for blueDark.
   */
  blueDark: string;

  /**
   * Color code for blueMid.
   */
  blueMid: string;

  /**
   * Color code for blue.
   */
  blue: string;

  /**
   * Color code for blueLight.
   */
  blueLight: string;

  /**
   * Color code for tealDark.
   */
  tealDark: string;

  /**
   * Color code for teal.
   */
  teal: string;

  /**
   * Color code for tealLight.
   */
  tealLight: string;

  /**
   * Color code for greenDark.
   */
  greenDark: string;

  /**
   * Color code for green.
   */
  green: string;

  /**
   * Color code for greenLight.
   */
  greenLight: string;
}

// WARNING: The comment below must use valid markdown, or it will break the website.
// Headings must start at h4 to be appropriate for the website.
/**
 * The collection of all semantic slots for colors used in themes.
 *
 * Note: text colors are defined in ISemanticTextColors.ts.
 *
 * #### Naming Convention
 *
 * The name of a semantic slot can quickly tell you how it’s meant to be used. It generally follows this format:
 *
 * `[category name][element name][Checked][Hovered/Pressed/Disabled state]`
 *
 * * `[category name]` – The “family” that this slot belongs to.
 * * `[element name]` – The name of the thing being targeted, such as the background or border.
 * * `[Checked]` – Whether the thing is checked. We assume things are unchecked by default, so no need to specify the unchecked state.
 * (We used “checked” to refer to anything that is on, selected, toggled, highlighted, emphasized, etc.)
 * * `[Hovered/Pressed/Disabled state]` – One of these states, if applicable. Each of these states are mutually exclusive.
 * Pressed styles overwrite hovered styles, and disabled elements cannot be hovered or pressed.
 *
 * #### Base Slots
 *
 * A basic set of slots that provide many default body styles, such as text, subtext, disabled colors, and so on.
 * If a category doesn't provide the slot you're looking for, use one from this category.
 * For example, the placeholder text on a text input field has no corresponding slot in its category,
 * so you'd use the bodySubtextColor from this category.
 *
 * #### Invariants
 *
 * When color has meaning, we do not want to change the color much theme to theme. For example, we
 * will always want errors to be some shade of red, but we will need to tweak the exact shade so it's
 * legible depending on whether it's an inverted theme or not.
 * Invariant colors should almost never be changed by the theme, the defaults should suffice.
 *
 * #### Input Controls
 *
 * This category contains input components commonly used to denote state, including radio buttons,
 * check boxes, toggle switches, sliders, progress bars, and more.
 *
 * #### Buttons
 *
 * Buttons! And all the flavors thereof.
 *
 * #### Menus
 *
 * Any kind of popup menus uses this category.
 *
 * #### Lists
 *
 * Lists differ from menus in that they are designed to show infinite amounts of items, often scroll,
 * and have a large and complex interaction surface.
 * This category covers all kinds of lists, whether they're typical one-item-per-row lists (like DetailsList) or ones with a tiled layout.
 * {@docCategory ISemanticColors}
 */
export interface ISemanticColors extends ISemanticTextColors {
  /* ANY ADDITIONS/REMOVALS HERE MUST ALSO BE MADE TO \packages\office-ui-fabric-react\src\common\_semanticSlots.scss */

  //// Base slots

  /**
   * The default color for backgrounds.
   */
  bodyBackground: string;

  /**
   * The default hover color for the backgrounds of interactable elements that don't have their own backgrounds.
   * e.g. if links had hover backgrounds, they'd use this
   */
  bodyBackgroundHovered: string;

  /**
   * The default background color of selected interactable elements that don't have their own backgrounds.
   * e.g. indicates in the nav which page you're currently on
   */
  bodyBackgroundChecked: string;

  /**
   * The standout color for highlighted content backgrounds.
   * For highlighted content when there is no emphasis, use the neutral variant instead.
   * This should be a shade darker than bodyBackground in light themes,
   * and a shade lighter in inverted themes.
   */
  bodyStandoutBackground: string;

  /**
   * The color for chrome adjacent to an area with bodyBackground.
   * This can be used to provide visual separation of zones when using stronger colors, when using a divider line is not desired.
   * In most themes, this should match the color of bodyBackground.
   * See also: bodyFrameDivider
   */
  bodyFrameBackground: string;

  /**
   * Used as the border between a zone with bodyFrameBackground and a zone with bodyBackground.
   * If bodyBackground and bodyFrameBackground are different, this should be the same color as bodyFrameBackground
   * in order to visually disappear.
   * See also: bodyFrameBackground
   */
  bodyFrameDivider: string;

  /**
   * Divider lines; e.g. lines that separate sections in a menu, an <HR> element.
   */
  bodyDivider: string;

  /**
   * The default color for backgrounds of disabled controls; e.g. disabled text field.
   */
  disabledBackground: string;

  /**
   * The default color for border of disabled controls; e.g. disabled slider, disabled toggle border.
   */
  disabledBorder: string;

  /**
   * The color of the outline around focused controls that don't already have a border; e.g. menu items
   */
  focusBorder: string;

  /**
   * The color of the border that provides contrast between an element, such as a card, and an emphasized background.
   */
  variantBorder: string;

  /**
   * Hover color of border that provides contrast between an element, such as a card, and an emphasized background.
   */
  variantBorderHovered: string;

  /**
   * Background color for default/empty state graphical elements; eg default icons, empty section that
   * needs user to fill in content, placeholder graphics, empty seats, etc.
   */
  defaultStateBackground: string;

  //// Invariants - slots that rarely change color theme-to-theme because the color has meaning
  /**
   * The background for errors, if necessary, or highlighting the section of the page where the error is present.
   */
  errorBackground: string;
  /**
   * Background for blocking issues, which is more severe than a warning, but not as bad as an error.
   */
  blockingBackground: string;
  /**
   * Background for warning messages.
   */
  warningBackground: string;
  /**
   * Foreground color for warning highlights
   */
  warningHighlight: string;
  /**
   * Background for success
   */
  successBackground: string;

  //// Input controls slots (text fields, checkboxes, radios...)

  /**
   * The border of a large input control in its resting, state; e.g. the box of dropdown.
   */
  inputBorder: string;

  /**
   * The border of a small input control in its resting unchecked state; e.g. the box of an unchecked checkbox.
   */
  smallInputBorder: string;

  /**
   * The border color of a large hovered input control, such as textbox.
   */
  inputBorderHovered: string;

  /**
   * The background color of an input, e.g. textbox background.
   */
  inputBackground: string;

  /**
   * The background of a checked control; e.g. checked radio button's dot, checked toggle's background.
   */
  inputBackgroundChecked: string;

  /**
   * The background of a checked and hovered control; e.g. checked checkbox's background color on hover.
   */
  inputBackgroundCheckedHovered: string;

  /**
   * The placeholder background color of a checked control, e.g. slider background, spinner background.
   */
  inputPlaceholderBackgroundChecked: string;

  /**
   * The foreground of a checked control; e.g. checked checkbox's checkmark color, checked toggle's thumb color,
   * radio button's background color around the dot.
   */
  inputForegroundChecked: string;

  /**
   * The alternate focus border color for elements that already have a border; e.g. text field borders on focus.
   */
  inputFocusBorderAlt: string;

  /**
   * The color for disabled icon ; e.g. SearchBox magnifying glass in disabled state.
   */
  inputIconDisabled: string;

  /**
   * The color for icon ; e.g. SearchBox magnifying glass in rest state.
   */
  inputIcon: string;

  /**
   * The color for hovered icon ; e.g. SearchBox magnifying glass in hovered state.
   */
  inputIconHovered: string;

  //// Buttons

  /**
   * Background of a standard button
   */
  buttonBackground: string;

  /**
   * Background of a checked standard button; e.g. bold/italicize/underline text button in toolbar
   */
  buttonBackgroundChecked: string;

  /**
   * Background of a hovered standard button
   */
  buttonBackgroundHovered: string;

  /**
   * Background of a checked and hovered standard button; e.g. bold/italicize/underline text button in toolbar
   */
  buttonBackgroundCheckedHovered: string;

  /**
   * Background of a disabled standard button
   */
  buttonBackgroundDisabled: string;

  /**
   * Background of a pressed standard button; i.e. currently being clicked by mouse
   */
  buttonBackgroundPressed: string;

  /**
   * Border of a standard button
   */
  buttonBorder: string;

  /**
   * Border of a disabled standard button
   */
  buttonBorderDisabled: string;

  /**
   * Background of a primary button
   */
  primaryButtonBackground: string;

  /**
   * Background of a hovered primary button
   */
  primaryButtonBackgroundHovered: string;

  /**
   * Background of a pressed primary button; i.e. currently being clicked by mouse
   */
  primaryButtonBackgroundPressed: string;

  /**
   * Background of a disabled primary button
   */
  primaryButtonBackgroundDisabled: string;

  /**
   * Border of a primary button
   */
  primaryButtonBorder: string;

  /**
   * Background of an accent button (kicker)
   */
  accentButtonBackground: string;

  //// Menus, popups, etc

  /**
   * The background of a menu.
   */
  menuBackground: string;

  /**
   * The divider between menu items.
   */
  menuDivider: string;

  /**
   * The default colors of icons in menus.
   */
  menuIcon: string;

  /**
   * The headers in menus that denote title of a section.
   */
  menuHeader: string;

  /**
   * The background of a hovered menu item.
   */
  menuItemBackgroundHovered: string;

  /**
   * The background of a pressed menu item.
   */
  menuItemBackgroundPressed: string;

  /**
   * The text color of a menu item.
   */
  menuItemText: string;

  /**
   * The text color of a hovered menu item.
   */
  menuItemTextHovered: string;

  //// Lists

  /**
   * The background color for the entire list.
   */
  listBackground: string;

  /**
   * The default text color for list item titles and text in column fields.
   */
  listText: string;

  /**
   * The background color of a hovered list item.
   */
  listItemBackgroundHovered: string;

  /**
   * The background color of a checked list item.
   */
  listItemBackgroundChecked: string;

  /**
   * The background color of a checked and hovered list item.
   */
  listItemBackgroundCheckedHovered: string;

  /**
   * The background color for a hovered list header.
   */
  listHeaderBackgroundHovered: string;

  /**
   * The background color for a pressed list header.
   */
  listHeaderBackgroundPressed: string;

  //// DEPRECATED SLOTS
  // Do not use these slots, they are only maintained for backwards compatibility.

  /**
   * @deprecated
   * (Checked menu items no longer get a background color.)
   * The background of checked menu item; e.g. a menu item whose submenu is open, a selected dropdown item.
   */
  menuItemBackgroundChecked: string;
}


export interface ISemanticTextColors {
  /* ANY ADDITIONS/REMOVALS HERE MUST ALSO BE MADE TO \packages\office-ui-fabric-react\src\common\_semanticSlots.scss */

  //// Base slots

  /**
   * The default color for text.
   */
  bodyText: string;

  /**
   * Checked text color, e.g. selected menu item text.
   */
  bodyTextChecked: string;

  /**
   * De-emphasized text; e.g. metadata, captions, placeholder text.
   */
  bodySubtext: string;

  /**
   * Neutral colored links and links for action buttons.
   */
  actionLink: string;

  /**
   * Hover state for neutral colored links and links for action buttons.
   */
  actionLinkHovered: string;

  /**
   * The color of a link.
   */
  link: string;

  /**
   * The color of a hovered link. Also used when the link is active.
   */
  linkHovered: string;

  /**
   * The default color for disabled text on top of disabledBackground; e.g. text in a disabled text field, disabled button text.
   */
  disabledText: string;

  /**
   * The default color for disabled text on the default background (bodyBackground).
   */
  disabledBodyText: string;

  /**
   * Disabled de-emphasized text, for use on disabledBackground.
   */
  disabledSubtext: string;

  /**
   * Disabled de-emphasized text, for use on the default background (bodyBackground).
   */
  disabledBodySubtext: string;

  //// Invariants - slots that rarely change color theme-to-theme because the color has meaning

  /**
   * The default color of error text on bodyBackground.
   */
  errorText: string;

  /**
   * The default color of text on errorBackground, warningBackground, blockingBackground, or successBackground.
   */
  warningText: string;

  /**
   * The default color of success text on successBackground.
   */
  successText: string;

  /**
   * The color of input text.
   */
  inputText: string;

  /**
   * The color of input text on hover.
   */
  inputTextHovered: string;

  /**
   * The color of placeholder text.
   */
  inputPlaceholderText: string;

  //// Buttons

  /**
   * Color of text in a standard button
   */
  buttonText: string;
  /**
   * Color of text in a hovered standard button
   */
  buttonTextHovered: string;
  /**
   * Color of text in a checked standard button
   */
  buttonTextChecked: string;
  /**
   * Color of text in a checked and hovered standard button
   */
  buttonTextCheckedHovered: string;
  /**
   * Color of text in a pressed standard button; i.e. currently being clicked by mouse
   */
  buttonTextPressed: string;

  /**
   * Color of text in a disabled standard button
   */
  buttonTextDisabled: string;

  /**
   * Color of text in a primary button
   */
  primaryButtonText: string;
  /**
   * Color of text in a hovered primary button
   */
  primaryButtonTextHovered: string;
  /**
   * Color of text in a pressed primary button; i.e. currently being clicked by mouse
   */
  primaryButtonTextPressed: string;

  /**
   * Color of text in a disabled primary button
   */
  primaryButtonTextDisabled: string;

  /**
   * Color of text for accent button (kicker)
   */
  accentButtonText: string;

  //// Lists

  /**
   * The default text color for list item titles and text in column fields.
   */
  listText: string;

  //// DEPRECATED SLOTS
  // Do not use these slots, they are only maintained for backwards compatibility.

  /** @deprecated
   * This slot was incorrectly named. Use listText instead. */
  listTextColor: string;
}


export interface ISpacing {
  s2: string;
  s1: string;
  m: string;
  l1: string;
  l2: string;
}


export type ISchemeNames = 'default' | 'neutral' | 'soft' | 'strong';

/**
 * {@docCategory IScheme}
 */
export interface IScheme {
  palette: IPalette;
  fonts: IFontStyles;
  semanticColors: ISemanticColors;
  isInverted: boolean;

  /**
   * This setting is for a very narrow use case and you probably don't need to worry about,
   * unless you share a environment with others that also use fabric.
   * It is used for disabling global styles on fabric components. This will prevent global
   * overrides that might have been set by other fabric users from applying to your components.
   * When you set this setting to `true` on your theme the components in the subtree of your
   * Customizer will not get the global styles applied to them.
   */
  disableGlobalClassNames: boolean;

  /**
   * @internal
   * The spacing property is still in an experimental phase. The intent is to have it
   * be used for padding and margin sizes in a future release, but it is still undergoing review.
   * Avoid using it until it is finalized.
   */
  spacing: ISpacing;

  effects: IEffects;
}

/**
 * {@docCategory ITheme}
 */
export interface ITheme extends IScheme {
  /**
   * @internal
   * The schemes property is still in an experimental phase. The intent is to have it work
   * in conjunction with new 'schemes' prop that any component making use of Foundation can use.
   * Alternative themes that can be referred to by name.
   */
  schemes?: { [P in ISchemeNames]?: IScheme };
}

/**
 * {@docCategory ITheme}
 */
export type IPartialTheme = {
  palette?: Partial<IPalette>;
  fonts?: Partial<IFontStyles>;

  /**
   * Use this property to specify font property defaults.
   */
  defaultFontStyle?: IRawStyle;

  semanticColors?: Partial<ISemanticColors>;
  isInverted?: boolean;
  disableGlobalClassNames?: boolean;
  spacing?: Partial<ISpacing>;
  effects?: Partial<IEffects>;
  schemes?: { [P in ISchemeNames]?: IScheme };
};


const DEFAULT_DURATION = '14s';
const DEFAULT_DELAY = '2s';
const DEFAULT_ITERATION_COUNT = '1';

function _continuousPulseStepOne(beaconColorOne: string, innerDimension: string): IRawStyle {
  return {
    borderColor: beaconColorOne,
    borderWidth: '0px',
    width: innerDimension,
    height: innerDimension
  };
}

function _continuousPulseStepTwo(borderWidth: string): IRawStyle {
  return {
    opacity: 1,
    borderWidth: borderWidth
  };
}

function _continuousPulseStepThree(): IRawStyle {
  return {
    opacity: 1
  };
}

function _continuousPulseStepFour(beaconColorTwo: string, outerDimension: string): IRawStyle {
  return {
    borderWidth: '0',
    width: outerDimension,
    height: outerDimension,
    opacity: 0,
    borderColor: beaconColorTwo
  };
}

function _continuousPulseStepFive(beaconColorOne: string, innerDimension: string): IRawStyle {
  return {
    ..._continuousPulseStepOne(beaconColorOne, innerDimension),
    ...{
      opacity: 0
    }
  };
}

function _continuousPulseAnimationDouble(
  beaconColorOne: string,
  beaconColorTwo: string,
  innerDimension: string,
  outerDimension: string,
  borderWidth: string
): string {
  return keyframes({
    '0%': _continuousPulseStepOne(beaconColorOne, innerDimension),
    '1.42%': _continuousPulseStepTwo(borderWidth),
    '3.57%': _continuousPulseStepThree(),
    '7.14%': _continuousPulseStepFour(beaconColorTwo, outerDimension),
    '8%': _continuousPulseStepFive(beaconColorOne, innerDimension),
    '29.99%': _continuousPulseStepFive(beaconColorOne, innerDimension),
    '30%': _continuousPulseStepOne(beaconColorOne, innerDimension),
    '31.42%': _continuousPulseStepTwo(borderWidth),
    '33.57%': _continuousPulseStepThree(),
    '37.14%': _continuousPulseStepFour(beaconColorTwo, outerDimension),
    '38%': _continuousPulseStepFive(beaconColorOne, innerDimension),
    '79.42%': _continuousPulseStepFive(beaconColorOne, innerDimension),
    '79.43': _continuousPulseStepOne(beaconColorOne, innerDimension),
    '81.85': _continuousPulseStepTwo(borderWidth),
    '83.42': _continuousPulseStepThree(),
    '87%': _continuousPulseStepFour(beaconColorTwo, outerDimension),
    '100%': {}
  });
}

function _continuousPulseAnimationSingle(
  beaconColorOne: string,
  beaconColorTwo: string,
  innerDimension: string,
  outerDimension: string,
  borderWidth: string
): string {
  return keyframes({
    '0%': _continuousPulseStepOne(beaconColorOne, innerDimension),
    '14.2%': _continuousPulseStepTwo(borderWidth),
    '35.7%': _continuousPulseStepThree(),
    '71.4%': _continuousPulseStepFour(beaconColorTwo, outerDimension),
    '100%': {}
  });
}

function _createDefaultAnimation(animationName: string, delayLength?: string): IRawStyle {
  return {
    animationName,
    animationIterationCount: DEFAULT_ITERATION_COUNT,
    animationDuration: DEFAULT_DURATION,
    animationDelay: delayLength || DEFAULT_DELAY
  };
}

export const PulsingBeaconAnimationStyles = {
  continuousPulseAnimationDouble: _continuousPulseAnimationDouble,
  continuousPulseAnimationSingle: _continuousPulseAnimationSingle,
  createDefaultAnimation: _createDefaultAnimation
};


/**
 * @internal
 * This function is still in experimental phase in support of Foundation experimental development. Its API signature and existence
 * are subject to change.
 *
 * Modify context to activate the specified scheme or theme. For schemes, look in context (if available) and fall back to global
 * Customizations. If both scheme and theme are specified, scheme will be looked up in theme. In this case, scheme must be
 * present in theme arg, otherwise new context will default to theme arg (there is no fallback to settings to look up scheme.)
 *
 * @param context - Context in which to get schemed customizations.
 * @param scheme - Scheme to get customizations for from theme arg (if supplied) OR from context and global settings.
 * @param theme - Theme to merge into context.
 * @returns modified schemed context if scheme is valid and not already applied, unmodified context otherwise.
 */
export function getThemedContext(context: ICustomizerContext, scheme?: ISchemeNames, theme?: ITheme): ICustomizerContext {
  let newContext: ICustomizerContext = context;
  let newSettings;

  // Only fall back to context and customizations when theme arg is not provided.
  let schemeSource = theme || Customizations.getSettings(['theme'], undefined, context.customizations).theme;

  if (theme) {
    newSettings = { theme };
  }

  const schemeTheme: ITheme | undefined = scheme && schemeSource && schemeSource.schemes && schemeSource.schemes[scheme];

  // These first two checks are logically redundant but TS doesn't infer schemeSource.schemes is defined when schemeTheme is defined.
  if (schemeSource && schemeTheme && schemeSource !== schemeTheme) {
    newSettings = { theme: schemeTheme };
    newSettings.theme.schemes = schemeSource.schemes;
  }

  if (newSettings) {
    newContext = {
      customizations: {
        settings: mergeSettings(context.customizations.settings, newSettings),
        scopedSettings: context.customizations.scopedSettings
      }
    };
  }

  return newContext;
}


let _theme: ITheme = createTheme({
  palette: DefaultPalette,
  semanticColors: _makeSemanticColorsFromPalette(DefaultPalette, false, false),
  fonts: DefaultFontStyles,
  isInverted: false,
  disableGlobalClassNames: false
});
let _onThemeChangeCallbacks: Array<(theme: ITheme) => void> = [];

export const ThemeSettingName = 'theme';

if (!Customizations.getSettings([ThemeSettingName]).theme) {
  const win = getWindow();

  // tslint:disable:no-string-literal no-any
  if (win && (win as any)['FabricConfig'] && (win as any)['FabricConfig'].theme) {
    _theme = createTheme((win as any)['FabricConfig'].theme);
  }
  // tslint:enable:no-string-literal no-any

  // Set the default theme.
  Customizations.applySettings({ [ThemeSettingName]: _theme });
}

/**
 * Gets the theme object
 * @param depComments - Whether to include deprecated tags as comments for deprecated slots.
 */
export function getTheme(depComments: boolean = false): ITheme {
  if (depComments === true) {
    _theme = createTheme({}, depComments);
  }
  return _theme;
}



/**
 * Registers a callback that gets called whenever the theme changes.
 * This should only be used when the component cannot automatically get theme changes through its state.
 * This will not register duplicate callbacks.
 */
export function registerOnThemeChangeCallback(callback: (theme: ITheme) => void): void {
  if (_onThemeChangeCallbacks.indexOf(callback) === -1) {
    _onThemeChangeCallbacks.push(callback);
  }
}

/**
 * See registerOnThemeChangeCallback().
 * Removes previously registered callbacks.
 */
export function removeOnThemeChangeCallback(callback: (theme: ITheme) => void): void {
  const i = _onThemeChangeCallbacks.indexOf(callback);
  if (i === -1) {
    return;
  }

  _onThemeChangeCallbacks.splice(i, 1);
}

/**
 * Applies the theme, while filling in missing slots.
 * @param theme - Partial theme object.
 * @param depComments - Whether to include deprecated tags as comments for deprecated slots.
 */
export function loadTheme(theme: IPartialTheme, depComments: boolean = false): ITheme {
  _theme = createTheme(theme, depComments);

  // Invoke the legacy method of theming the page as well.
  //legacyLoadTheme({ ..._theme.palette, ..._theme.semanticColors, ..._theme.effects, ..._loadFonts(_theme) });

  Customizations.applySettings({ [ThemeSettingName]: _theme });

  _onThemeChangeCallbacks.forEach((callback: (theme: ITheme) => void) => {
    try {
      callback(_theme);
    } catch (e) {
      // don't let a bad callback break everything else
    }
  });

  return _theme;
}

/**
 * Loads font variables into a JSON object.
 * @param theme - The theme object
 */
function _loadFonts(theme: ITheme): { [name: string]: string } {
  const lines = {};

  for (const fontName of Object.keys(theme.fonts)) {
    const font = theme.fonts[fontName];
    for (const propName of Object.keys(font)) {
      const name = fontName + propName.charAt(0).toUpperCase() + propName.slice(1);
      let value = font[propName];
      if (propName === 'fontSize' && typeof value === 'number') {
        // if it's a number, convert it to px by default like our theming system does
        value = value + 'px';
      }
      lines[name] = value;
    }
  }
  return lines;
}

/**
 * Creates a custom theme definition which can be used with the Customizer.
 * @param theme - Partial theme object.
 * @param depComments - Whether to include deprecated tags as comments for deprecated slots.
 */
export function createTheme(theme: IPartialTheme, depComments: boolean = false): ITheme {
  let newPalette = { ...DefaultPalette, ...theme.palette };

  if (!theme.palette || !theme.palette.accent) {
    newPalette.accent = newPalette.themePrimary;
  }

  // mix in custom overrides with good slots first, since custom overrides might be used in fixing deprecated slots
  let newSemanticColors = {
    ..._makeSemanticColorsFromPalette(newPalette, !!theme.isInverted, depComments),
    ...theme.semanticColors
  };

  let defaultFontStyles: IFontStyles = { ...DefaultFontStyles };

  if (theme.defaultFontStyle) {
    for (const fontStyle of Object.keys(defaultFontStyles)) {
      defaultFontStyles[fontStyle] = merge({}, defaultFontStyles[fontStyle], theme.defaultFontStyle);
    }
  }

  if (theme.fonts) {
    for (const fontStyle of Object.keys(theme.fonts)) {
      defaultFontStyles[fontStyle] = merge({}, defaultFontStyles[fontStyle], theme.fonts[fontStyle]);
    }
  }

  return {
    palette: newPalette,
    fonts: {
      ...defaultFontStyles
    },
    semanticColors: newSemanticColors,
    isInverted: !!theme.isInverted,
    disableGlobalClassNames: !!theme.disableGlobalClassNames,
    spacing: {
      ...DefaultSpacing,
      ...theme.spacing
    },
    effects: {
      ...DefaultEffects,
      ...theme.effects
    }
  };
}

/**
 * Helper to pull a given property name from a given set of sources, in order, if available. Otherwise returns the property name.
 */
function _expandFrom<TRetVal, TMapType>(propertyName: string | TRetVal | undefined, ...maps: TMapType[]): TRetVal {
  if (propertyName) {
    for (const map of maps) {
      if (map[propertyName as string]) {
        return map[propertyName as string];
      }
    }
  }

  return propertyName as TRetVal;
}

// Generates all the semantic slot colors based on the Fabric palette.
// We'll use these as fallbacks for semantic slots that the passed in theme did not define.
function _makeSemanticColorsFromPalette(p: IPalette, isInverted: boolean, depComments: boolean): ISemanticColors {
  let toReturn: ISemanticColors = {
    bodyBackground: p.white,
    bodyBackgroundHovered: p.neutralLighter,
    bodyBackgroundChecked: p.neutralLight,
    bodyStandoutBackground: p.neutralLighterAlt,
    bodyFrameBackground: p.white,
    bodyFrameDivider: p.neutralLight,
    bodyText: p.neutralPrimary,
    bodyTextChecked: p.black,
    bodySubtext: p.neutralSecondary,
    bodyDivider: p.neutralLight,

    disabledBackground: p.neutralLighter,
    disabledText: p.neutralTertiary,
    disabledSubtext: p.neutralQuaternary,
    disabledBodyText: p.neutralTertiary,
    disabledBodySubtext: p.neutralTertiaryAlt,
    disabledBorder: p.neutralTertiaryAlt,

    focusBorder: p.neutralSecondary,
    variantBorder: p.neutralLight,
    variantBorderHovered: p.neutralTertiary,
    defaultStateBackground: p.neutralLighterAlt,

    errorText: !isInverted ? p.redDark : '#ff5f5f',
    warningText: !isInverted ? '#333333' : '#ffffff',
    successText: !isInverted ? '#107C10' : '#92c353',
    errorBackground: !isInverted ? 'rgba(245, 135, 145, .2)' : 'rgba(232, 17, 35, .5)',
    blockingBackground: !isInverted ? 'rgba(250, 65, 0, .2)' : 'rgba(234, 67, 0, .5)',
    warningBackground: !isInverted ? 'rgba(255, 200, 10, .2)' : 'rgba(255, 251, 0, .6)',
    warningHighlight: !isInverted ? '#ffb900' : '#fff100',
    successBackground: !isInverted ? 'rgba(95, 210, 85, .2)' : 'rgba(186, 216, 10, .4)',

    inputBorder: p.neutralSecondaryAlt,
    inputBorderHovered: p.neutralPrimary,
    inputBackground: p.white,
    inputBackgroundChecked: p.themePrimary,
    inputBackgroundCheckedHovered: p.themeDark,
    inputPlaceholderBackgroundChecked: p.themeLighter,
    inputForegroundChecked: p.white,
    inputIcon: p.themePrimary,
    inputIconHovered: p.themeDark,
    inputIconDisabled: p.neutralTertiary,
    inputFocusBorderAlt: p.themePrimary,
    smallInputBorder: p.neutralSecondary,
    inputText: p.neutralPrimary,
    inputTextHovered: p.neutralDark,
    inputPlaceholderText: p.neutralSecondary,

    buttonBackground: p.white,
    buttonBackgroundChecked: p.neutralTertiaryAlt,
    buttonBackgroundHovered: p.neutralLighter,
    buttonBackgroundCheckedHovered: p.neutralLight,
    buttonBackgroundPressed: p.neutralLight,
    buttonBackgroundDisabled: p.neutralLighter,
    buttonBorder: p.neutralSecondaryAlt,
    buttonText: p.neutralPrimary,
    buttonTextHovered: p.neutralDark,
    buttonTextChecked: p.neutralDark,
    buttonTextCheckedHovered: p.black,
    buttonTextPressed: p.neutralDark,
    buttonTextDisabled: p.neutralTertiary,
    buttonBorderDisabled: p.neutralLighter,

    primaryButtonBackground: p.themePrimary,
    primaryButtonBackgroundHovered: p.themeDarkAlt,
    primaryButtonBackgroundPressed: p.themeDark,
    primaryButtonBackgroundDisabled: p.neutralLighter,
    primaryButtonBorder: 'transparent',
    primaryButtonText: p.white,
    primaryButtonTextHovered: p.white,
    primaryButtonTextPressed: p.white,
    primaryButtonTextDisabled: p.neutralQuaternary,

    accentButtonBackground: p.accent,
    accentButtonText: p.white,

    menuBackground: p.white,
    menuDivider: p.neutralTertiaryAlt,
    menuIcon: p.themePrimary,
    menuHeader: p.themePrimary,
    menuItemBackgroundHovered: p.neutralLighter,
    menuItemBackgroundPressed: p.neutralLight,
    menuItemText: p.neutralPrimary,
    menuItemTextHovered: p.neutralDark,

    listBackground: p.white,
    listText: p.neutralPrimary,
    listItemBackgroundHovered: p.neutralLighter,
    listItemBackgroundChecked: p.neutralLight,
    listItemBackgroundCheckedHovered: p.neutralQuaternaryAlt,

    listHeaderBackgroundHovered: p.neutralLighter,
    listHeaderBackgroundPressed: p.neutralLight,

    actionLink: p.neutralPrimary,
    actionLinkHovered: p.neutralDark,
    link: p.themePrimary,
    linkHovered: p.themeDarker,

    // Deprecated slots, second pass by _fixDeprecatedSlots() later for self-referential slots
    listTextColor: '',
    menuItemBackgroundChecked: p.neutralLight
  };

  return _fixDeprecatedSlots(toReturn, depComments!);
}

function _fixDeprecatedSlots(s: ISemanticColors, depComments: boolean): ISemanticColors {
  // Add @deprecated tag as comment if enabled
  let dep = '';
  if (depComments === true) {
    dep = ' /* @deprecated */';
  }

  s.listTextColor = s.listText + dep;
  s.menuItemBackgroundChecked += dep;
  return s;
}

export namespace ZIndexes {
  export const Nav: number = 1;
  /**
   * @deprecated ScrollablePane
   */
  export const ScrollablePane: number = 1;
  export const FocusStyle: number = 1;
  export const Coachmark: number = 1000;
  export const Layer: number = 1000000;
  export const KeytipLayer: number = 1000001;
}


export var defaultTheme = getTheme()

export enum PersonaSize {
  /**
   * `tiny` size has been deprecated in favor of standardized numeric sizing. Use `size8` instead.
   * @deprecated Use `size8` instead.
   */
  tiny = 0,

  /**
   *
   * `extraExtraSmall` size has been deprecated in favor of standardized numeric sizing. Use `size24` instead.
   * @deprecated Use `size24` instead.
   */
  extraExtraSmall = 1,

  /**
   * `extraSmall` size has been deprecated in favor of standardized numeric sizing. Use `size32` instead.
   * @deprecated Use `size32` instead.
   */
  extraSmall = 2,

  /**
   * `small` size has been deprecated in favor of standardized numeric sizing. Use `size40` instead.
   * @deprecated Use `size40` instead.
   */
  small = 3,

  /**
   * `regular` size has been deprecated in favor of standardized numeric sizing. Use `size48` instead.
   * @deprecated Use `size48` instead.
   */
  regular = 4,

  /**
   * `large` size has been deprecated in favor of standardized numeric sizing. Use `size72` instead.
   * @deprecated Use `size72` instead.
   */
  large = 5,

  /**
   * `extraLarge` size has been deprecated in favor of standardized numeric sizing. Use `size100` instead.
   * @deprecated Use `size100` instead.
   */
  extraLarge = 6,

  /**
   * No `PersonaCoin` is rendered.
   */
  size8 = 17,

  /**
   * No `PersonaCoin` is rendered. Deprecated in favor of `size8` to align with design specifications.
   * @deprecated Use `size8` instead. Will be removed in a future major release.
   */
  size10 = 9,

  /**
   * Renders a 16px `PersonaCoin`. Deprecated due to not being in the design specification.
   * @deprecated Will be removed in a future major release.
   */
  size16 = 8,

  /**
   * Renders a 24px `PersonaCoin`.
   */
  size24 = 10,

  /**
   * Renders a 28px `PersonaCoin`. Deprecated due to not being in the design specification.
   * @deprecated Will be removed in a future major release.
   */
  size28 = 7,

  /**
   * Renders a 32px `PersonaCoin`.
   */
  size32 = 11,

  /**
   * Renders a 40px `PersonaCoin`.
   */
  size40 = 12,

  /**
   * Renders a 48px `PersonaCoin`.
   */
  size48 = 13,

  /**
   * Renders a 56px `PersonaCoin`.
   */
  size56 = 16,

  /**
   * Renders a 72px `PersonaCoin`.
   */
  size72 = 14,

  /**
   * Renders a 100px `PersonaCoin`.
   */
  size100 = 15
}

/**
 * {@docCategory Persona}
 */
export enum PersonaPresenceEnum {
  none = 0,
  offline = 1,
  online = 2,
  away = 3,
  dnd = 4,
  blocked = 5,
  busy = 6
}

/**
 * {@docCategory Persona}
 */
export enum PersonaInitialsColor {
  lightBlue = 0,
  blue = 1,
  darkBlue = 2,
  teal = 3,
  lightGreen = 4,
  green = 5,
  darkGreen = 6,
  lightPink = 7,
  pink = 8,
  magenta = 9,
  purple = 10,
  /**
   * `black` is a color that can result in offensive persona coins with some initials combinations, so it can only be set with overrides.
   * @deprecated will be removed in a future major release.
   */
  black = 11,
  orange = 12,
  /**
   * `red` is a color that often has a special meaning, so it is considered a reserved color and can only be set with overrides
   * @deprecated will be removed in a future major release.
   */
  red = 13,
  darkRed = 14,
  /**
   * Transparent is not intended to be used with typical initials due to accessibility issues.
   * Its primary use is for overflow buttons, so it is considered a reserved color and can only be set with overrides.
   */
  transparent = 15,
  violet = 16,
  lightRed = 17,
  gold = 18,
  burgundy = 19,
  warmGray = 20,
  coolGray = 21,
  /**
   * `gray` is a color that can result in offensive persona coins with some initials combinations, so it can only be set with overrides
   */
  gray = 22,
  cyan = 23,
  rust = 24
}

// Persona Sizes
export class personaSize {
  static size8 = "20px"
  // TODO: remove in a future major release as it's deprecated.
  static size10 = "20px"
  // TODO: remove in a future major release as it's deprecated.
  static size16 = "16px"
  static size24 = "24px"
  // TODO: remove in a future major release as it's deprecated.
  static size28 = "28px"
  static size32 = "32px"
  static size40 = "40px"
  static size48 = "48px"
  static size56 = "56px"
  static size72 = "72px"
  static size100 = "100px"
}

// Persona Presence Sizes
export class personaPresenceSize {
  static size6 = "6px"
  static size8 = "8px"
  static size12 = "12px"
  static size16 = "16px"
  static size20 = "20px"
  static size28 = "28px"
  static border = "2px"
}

// TODO: remove the deprecated parts in a future major release.
export const sizeBoolean = (size: PersonaSize) => ({
  isSize8: size === PersonaSize.size8,
  isSize10: size === PersonaSize.size10 || size === PersonaSize.tiny,
  isSize16: size === PersonaSize.size16,
  isSize24: size === PersonaSize.size24 || size === PersonaSize.extraExtraSmall,
  isSize28: size === PersonaSize.size28 || size === PersonaSize.extraSmall,
  isSize32: size === PersonaSize.size32,
  isSize40: size === PersonaSize.size40 || size === PersonaSize.small,
  isSize48: size === PersonaSize.size48 || size === PersonaSize.regular,
  isSize56: size === PersonaSize.size56,
  isSize72: size === PersonaSize.size72 || size === PersonaSize.large,
  isSize100: size === PersonaSize.size100 || size === PersonaSize.extraLarge
})

export const sizeToPixels: { [key: number]: number } = {
  // Old deprecated sizes
  [PersonaSize.tiny]: 10,
  [PersonaSize.extraExtraSmall]: 24,
  [PersonaSize.extraSmall]: 28,
  [PersonaSize.small]: 40,
  [PersonaSize.regular]: 48,
  [PersonaSize.large]: 72,
  [PersonaSize.extraLarge]: 100,
  // New sizes
  [PersonaSize.size8]: 8,
  [PersonaSize.size10]: 10, // TODO: deprecated (not in the design specs)
  [PersonaSize.size16]: 16, // TODO: deprecated (not in the design specs)
  [PersonaSize.size24]: 24,
  [PersonaSize.size28]: 28, // TODO: deprecated (not in the design specs)
  [PersonaSize.size32]: 32,
  [PersonaSize.size40]: 40,
  [PersonaSize.size48]: 48,
  [PersonaSize.size56]: 56,
  [PersonaSize.size72]: 72,
  [PersonaSize.size100]: 100
}

export const presenceBoolean = (presence: PersonaPresenceEnum) => ({
  isAvailable: presence === PersonaPresenceEnum.online,
  isAway: presence === PersonaPresenceEnum.away,
  isBlocked: presence === PersonaPresenceEnum.blocked,
  isBusy: presence === PersonaPresenceEnum.busy,
  isDoNotDisturb: presence === PersonaPresenceEnum.dnd,
  isOffline: presence === PersonaPresenceEnum.offline
})

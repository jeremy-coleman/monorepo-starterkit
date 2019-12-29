import {
  addElementAtIndex,
  arraysEqual,
  EventGroup,
  find,
  findIndex,
  getId,
  KeyCodes,
  replaceElement
} from "@uifabric/styleguide"

interface IPoint {
  x: number
  y: number
}

export interface IKeytipLike {
  /**
   * Content to put inside the keytip
   */
  content: string

  /**
   * Theme for the component
   */
  theme?: any //ITheme;

  /**
   * T/F if the corresponding control for this keytip is disabled
   */
  disabled?: boolean

  /**
   * T/F if the keytip is visible
   */
  visible?: boolean

  /**
   * Function to call when this keytip is activated.
   * 'executeTarget' is the DOM element marked with 'data-ktp-execute-target'.
   * 'target' is the DOM element marked with 'data-ktp-target'.
   */
  onExecute?: (executeTarget: HTMLElement | null, target: HTMLElement | null) => void

  /**
   * Function to call when the keytip is the currentKeytip and a return sequence is pressed.
   * 'executeTarget' is the DOM element marked with 'data-ktp-execute-target'.
   * 'target' is the DOM element marked with 'data-ktp-target'.
   */
  onReturn?: (executeTarget: HTMLElement | null, target: HTMLElement | null) => void

  /**
   * Array of KeySequences which is the full key sequence to trigger this keytip
   * Should not include initial 'start' key sequence
   */
  keySequences: string[]

  /**
   * Full KeySequence of the overflow set button, will be set automatically if this keytip is inside an overflow
   */
  overflowSetSequence?: string[]

  /**
   * ICalloutProps to pass to the callout element
   */
  calloutProps?: any //ICalloutProps;

  /**
   * Optional styles for the component.
   */
  styles?: any //IStyleFunctionOrObject<IKeytipStyleProps, IKeytipStyles>;

  /**
   * Offset x and y for the keytip, added from the top-left corner
   * By default the keytip will be anchored to the bottom-center of the element
   */
  offset?: IPoint

  /**
   * Whether or not this keytip will have children keytips that are dynamically created (DOM is generated on keytip activation)
   * Common cases are a Pivot or Modal
   */
  hasDynamicChildren?: boolean

  /**
   * Whether or not this keytip belongs to a component that has a menu
   * Keytip mode will stay on when a menu is opened, even if the items in that menu have no keytips
   */
  hasMenu?: boolean
}

export enum KeytipTransitionModifier {
  shift = KeyCodes.shift,
  ctrl = KeyCodes.ctrl,
  alt = KeyCodes.alt,
  meta = KeyCodes.leftWindow
}

export interface IKeytipTransitionKey {
  key: string
  modifierKeys?: KeytipTransitionModifier[]
}

/**
 * Tests for equality between two IKeytipTransitionKeys.
 *
 * @param key1 - First IKeytipTransitionKey.
 * @param key2 - Second IKeytipTransitionKey.
 * @returns {boolean} T/F if the transition keys are equal.
 */
export function transitionKeysAreEqual(key1: IKeytipTransitionKey, key2: IKeytipTransitionKey): boolean {
  if (key1.key !== key2.key) {
    return false
  }

  let mod1 = key1.modifierKeys
  let mod2 = key2.modifierKeys

  if ((!mod1 && mod2) || (mod1 && !mod2)) {
    // Not equal if one modifier is defined and the other isn't
    return false
  }

  if (mod1 && mod2) {
    if (mod1.length !== mod2.length) {
      return false
    }

    // Sort both arrays
    mod1 = mod1.sort()
    mod2 = mod2.sort()
    for (let i = 0; i < mod1.length; i++) {
      if (mod1[i] !== mod2[i]) {
        return false
      }
    }
  }

  return true
}

/**
 * Tests if 'key' is present in 'keys'.
 *
 * @param keys - Array of IKeytipTransitionKey.
 * @param key - IKeytipTransitionKey to find in 'keys'.
 * @returns {boolean} T/F if 'keys' contains 'key'.
 */
export function transitionKeysContain(keys: IKeytipTransitionKey[], key: IKeytipTransitionKey): boolean {
  return !!find(keys, (transitionKey: IKeytipTransitionKey) => {
    return transitionKeysAreEqual(transitionKey, key)
  })
}

export interface IKeytipConfig {
  keytips: IKeytipConfigItem[]
}

export interface IKeytipConfigItem {
  /**
   * Key Sequence for this keytip only
   * If sequence is not defined it will be derived from the content string
   */
  sequence?: string

  /**
   * Content for the keytip
   */
  content: string

  /**
   * Identifier for the keytip, to be used to access in the configMap
   */
  id: string

  /**
   * Optional props in IKeytipProps
   */
  optionalProps?: Partial<IKeytipLike>

  /**
   * Children keytips of this keytip
   */
  children?: IKeytipConfigItem[]
}

export interface IKeytipConfigMap {
  [id: string]: IKeytipLike
}

/**
 * Builds a map of ID -> IKeytipProps
 *
 * @param config - IKeytipConfig object
 * @returns {IKeytipConfigMap} - Config map
 */
export function buildKeytipConfigMap(config: IKeytipConfig): IKeytipConfigMap {
  const configMap: IKeytipConfigMap = {}

  for (const keytip of config.keytips) {
    constructKeytip(configMap, [], keytip)
  }

  return configMap
}

/**
 * Constructs a keytip from an IKeytipConfigItem and puts it in the configMap
 *
 * @param configMap - IKeytipConfigMap to store the keytip in
 * @param parentSequence - string of the parent keytip
 * @param keytip - IKeytipConfigItem data
 */
export function constructKeytip(configMap: IKeytipConfigMap, parentSequence: string[], keytip: IKeytipConfigItem): void {
  // Compute full key sequence
  const sequence = keytip.sequence ? keytip.sequence : keytip.content.toLocaleLowerCase()
  const keytipSequence = parentSequence.concat(sequence)

  // Save props in configMap
  const keytipProps: IKeytipLike = { ...keytip.optionalProps, keySequences: keytipSequence, content: keytip.content }
  configMap[keytip.id] = keytipProps

  if (keytip.children) {
    for (const child of keytip.children) {
      // Create keytips for all children
      constructKeytip(configMap, keytipSequence, child)
    }
  }
}

export const KTP_PREFIX = "ktp"
export const KTP_SEPARATOR = "-"
export const KTP_FULL_PREFIX = KTP_PREFIX + KTP_SEPARATOR
export const DATAKTP_TARGET = "data-ktp-target"
export const DATAKTP_EXECUTE_TARGET = "data-ktp-execute-target"
export const KTP_LAYER_ID = "ktp-layer-id"
export const KTP_ARIA_SEPARATOR = ", "

// Events
export class KeytipEvents {
  static KEYTIP_ADDED = "keytipAdded"
  static KEYTIP_REMOVED = "keytipRemoved"
  static KEYTIP_UPDATED = "keytipUpdated"
  static PERSISTED_KEYTIP_ADDED = "persistedKeytipAdded"
  static PERSISTED_KEYTIP_REMOVED = "persistedKeytipRemoved"
  static PERSISTED_KEYTIP_EXECUTE = "persistedKeytipExecute"
  static ENTER_KEYTIP_MODE = "enterKeytipMode"
  static EXIT_KEYTIP_MODE = "exitKeytipMode"
}

export interface IUniqueKeytip {
  uniqueID: string
  keytip: IKeytipLike
}

/**
 * This class is responsible for handling registering, updating, and unregistering of keytips
 */
export class KeytipManager {
  private static _instance: KeytipManager = new KeytipManager()

  keytips: IUniqueKeytip[] = []
  persistedKeytips: IUniqueKeytip[] = []

  // This is (and should be) updated and kept in sync
  // with the inKeytipMode in KeytipLayer.
  inKeytipMode = false

  // Boolean that gets checked before entering keytip mode by the KeytipLayer
  // Used for an override in special cases (e.g. Disable entering keytip mode when a modal is shown)
  shouldEnterKeytipMode = true

  /**
   * Static function to get singleton KeytipManager instance
   *
   * @returns {KeytipManager} Singleton KeytipManager instance
   */
  static getInstance(): KeytipManager {
    return this._instance
  }

  /**
   * Registers a keytip
   *
   * @param keytipProps - Keytip to register
   * @param persisted - T/F if this keytip should be persisted, default is false
   * @returns {string} Unique ID for this keytip
   */
  register(keytipProps: IKeytipLike, persisted = false): string {
    let props: IKeytipLike = keytipProps
    if (!persisted) {
      // Add the overflowSetSequence if necessary
      props = this.addParentOverflow(keytipProps)
    }
    // Create a unique keytip
    const uniqueKeytip: IUniqueKeytip = this._getUniqueKtp(props)
    // Add to array
    persisted ? this.persistedKeytips.push(uniqueKeytip) : this.keytips.push(uniqueKeytip)

    const event = persisted ? KeytipEvents.PERSISTED_KEYTIP_ADDED : KeytipEvents.KEYTIP_ADDED
    EventGroup.raise(this, event, {
      keytip: props,
      uniqueID: uniqueKeytip.uniqueID
    })

    return uniqueKeytip.uniqueID
  }

  /**
   * Update a keytip
   *
   * @param keytipProps - Keytip to update
   * @param uniqueID - Unique ID of this keytip
   */
  update(keytipProps: IKeytipLike, uniqueID: string): void {
    const newKeytipProps = this.addParentOverflow(keytipProps)
    const uniqueKeytip = this._getUniqueKtp(newKeytipProps, uniqueID)
    const keytipIndex = findIndex(this.keytips, (ktp: IUniqueKeytip) => {
      return ktp.uniqueID === uniqueID
    })
    if (keytipIndex >= 0) {
      // Update everything except 'visible'
      uniqueKeytip.keytip.visible = this.keytips[keytipIndex].keytip.visible
      // Update keytip in this.keytips
      this.keytips = replaceElement(this.keytips, uniqueKeytip, keytipIndex)
      // Raise event
      EventGroup.raise(this, KeytipEvents.KEYTIP_UPDATED, {
        keytip: uniqueKeytip.keytip,
        uniqueID: uniqueKeytip.uniqueID
      })
    }
  }

  /**
   * Unregisters a keytip
   *
   * @param keytipToRemove - IKeytipProps of the keytip to remove
   * @param uniqueID - Unique ID of this keytip
   * @param persisted - T/F if this keytip should be persisted, default is false
   */
  unregister(keytipToRemove: IKeytipLike, uniqueID: string, persisted = false): void {
    if (persisted) {
      // Remove keytip from this.persistedKeytips
      this.persistedKeytips = this.persistedKeytips.filter((uniqueKtp: IUniqueKeytip) => {
        return uniqueKtp.uniqueID !== uniqueID
      })
    } else {
      // Remove keytip from this.keytips
      this.keytips = this.keytips.filter((uniqueKtp: IUniqueKeytip) => {
        return uniqueKtp.uniqueID !== uniqueID
      })
    }

    const event = persisted ? KeytipEvents.PERSISTED_KEYTIP_REMOVED : KeytipEvents.KEYTIP_REMOVED
    EventGroup.raise(this, event, {
      keytip: keytipToRemove,
      uniqueID
    })
  }

  /**
   * Manual call to enter keytip mode
   */
  enterKeytipMode(): void {
    EventGroup.raise(this, KeytipEvents.ENTER_KEYTIP_MODE)
  }

  /**
   * Manual call to exit keytip mode
   */
  exitKeytipMode(): void {
    EventGroup.raise(this, KeytipEvents.EXIT_KEYTIP_MODE)
  }

  /**
   * Gets all IKeytipProps from this.keytips
   *
   * @returns {IKeytipProps[]} All keytips stored in the manager
   */
  getKeytips(): IKeytipLike[] {
    return this.keytips.map((uniqueKeytip: IUniqueKeytip) => {
      return uniqueKeytip.keytip
    })
  }

  /**
   * Adds the overflowSetSequence to the keytipProps if its parent keytip also has it
   *
   * @param keytipProps - Keytip props to add overflowSetSequence to if necessary
   * @returns {IKeytipProps} - Modified keytip props, if needed to be modified
   */
  addParentOverflow(keytipProps: IKeytipLike): IKeytipLike {
    const fullSequence = [...keytipProps.keySequences]
    fullSequence.pop()
    if (fullSequence.length !== 0) {
      const parentKeytip = find(this.getKeytips(), (keytip: IKeytipLike) => {
        return arraysEqual(fullSequence, keytip.keySequences)
      })
      if (parentKeytip && parentKeytip.overflowSetSequence) {
        return {
          ...keytipProps,
          overflowSetSequence: parentKeytip.overflowSetSequence
        }
      }
    }
    return keytipProps
  }

  /**
   * Public function to bind for overflow items that have a submenu
   *
   * @param overflowButtonSequences
   * @param keytipSequences
   */
  menuExecute(overflowButtonSequences: string[], keytipSequences: string[]) {
    EventGroup.raise(this, KeytipEvents.PERSISTED_KEYTIP_EXECUTE, {
      overflowButtonSequences,
      keytipSequences
    })
  }

  /**
   * Creates an IUniqueKeytip object
   *
   * @param keytipProps - IKeytipProps
   * @param uniqueID - Unique ID, will default to the next unique ID if not passed
   * @returns {IUniqueKeytip} IUniqueKeytip object
   */
  private _getUniqueKtp(keytipProps: IKeytipLike, uniqueID: string = getId()): IUniqueKeytip {
    return { keytip: { ...keytipProps }, uniqueID }
  }
}

/**
 * Converts a whole set of KeySequences into one keytip ID, which will be the ID for the last keytip sequence specified
 * keySequences should not include the initial keytip 'start' sequence.
 *
 * @param keySequences - Full path of IKeySequences for one keytip.
 * @returns {string} String to use for the keytip ID.
 */
export function sequencesToID(keySequences: string[]): string {
  return keySequences.reduce((prevValue: string, keySequence: string): string => {
    return prevValue + KTP_SEPARATOR + keySequence.split("").join(KTP_SEPARATOR)
  }, KTP_PREFIX)
}

/**
 * Merges an overflow sequence with a key sequence.
 *
 * @param keySequences - Full sequence for one keytip.
 * @param overflowKeySequences - Full overflow keytip sequence.
 * @returns {string[]} Sequence that will be used by the keytip when in the overflow.
 */
export function mergeOverflows(keySequences: string[], overflowKeySequences: string[]): string[] {
  const overflowSequenceLen = overflowKeySequences.length
  const overflowSequence = [...overflowKeySequences].pop()
  const newKeySequences = [...keySequences]
  return addElementAtIndex(newKeySequences, overflowSequenceLen - 1, overflowSequence!)
}

/**
 * Constructs the data-ktp-target attribute selector from a full key sequence.
 *
 * @param keySequences - Full string[] for a Keytip.
 * @returns {string} String selector to use to query for the keytip target.
 */
export function ktpTargetFromSequences(keySequences: string[]): string {
  return "[" + DATAKTP_TARGET + '="' + sequencesToID(keySequences) + '"]'
}

/**
 * Constructs the data-ktp-execute-target attribute selector from a keytip ID.
 *
 * @param keytipId - ID of the Keytip.
 * @returns {string} String selector to use to query for the keytip execute target.
 */
export function ktpTargetFromId(keytipId: string): string {
  return "[" + DATAKTP_EXECUTE_TARGET + '="' + keytipId + '"]'
}

/**
 * Gets the aria-describedby value to put on the component with this keytip.
 *
 * @param keySequences - KeySequences of the keytip.
 * @returns {string} The aria-describedby value to set on the component with this keytip.
 */
export function getAriaDescribedBy(keySequences: string[]): string {
  const describedby = " " + KTP_LAYER_ID
  if (!keySequences.length) {
    // Return just the layer ID
    return describedby
  }

  return describedby + " " + sequencesToID(keySequences)
}

export interface ISequence {
  next(): string;
}

export class SequenceId implements ISequence {
  private _prefix: string;
  private _id: number;
  constructor(prefix: string = "") {
    this._prefix = prefix;
  }
  next(): string {
    if (this._id === undefined) {
      this._id = 0;
    } else {
      this._id++;
    }
    return this._prefix + this._id;
  }
}

interface ISequenceInstances {
  [k: string]: ISequence;
}

const instances: ISequenceInstances = {};
const defaultInstance = new SequenceId();

export const getSequence = function(name?: string): ISequence {
  if (name !== undefined) {
    let instance = instances[name];
    if (!instance) {
      instance = new SequenceId(name);
      instances[name] = instance;
    }
    return instance;
  }
  return defaultInstance;
};

export const next = function(name?: string): string {
  return getSequence(name).next();
};

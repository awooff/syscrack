import { EventEmitter } from "events";
import { Process } from "backend/src/generated/client";

export interface WebEmitterEvents {
  processCompleted: (process: Process) => {};
  showModal: (modal: string, data: object) => {};
}

export declare interface WebEventEmitter {
  on: (eventName: keyof WebEmitterEvents, cb: Function) => any;
  emit: (eventName: keyof WebEmitterEvents, ...args: any[]) => any;
}
// eslint-disable-next-line no-redeclare
export class WebEventEmitter extends EventEmitter {}

const WebEvents = new WebEventEmitter();

export default WebEvents;

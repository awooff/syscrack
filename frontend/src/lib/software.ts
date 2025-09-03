import WebEvents from "./events";
import { Computer } from "backend/src/generated/client";
import { Process } from "backend/src/generated/client";
import { Software } from "backend/src/generated/client";

export type ActionFunc = (
  software: Software,
  computer: Computer,
  executor: Computer,
  process: Process,
  navigate: (to: string, data?: { state: object }) => void
) => void | Promise<void>;

/**
 * Parameters needed for execution
 */
export const executionParameters = {
  collector: {
    modal: "collector", //show the collector modal
    parameters: {
      bankAccount: "bank_account",
    },
  },
} as Record<
  string,
  {
    modal?: string;
    parameters?: {
      [str: string]:
        | "bank_account"
        | "text"
        | "password"
        | "number"
        | "ip"
        | "domain";
    };
  }
>;

/**
 * Called when an action is complete, each method is dependant on the action
 */
export const actions = {
  collector: {
    execute: async (software, computer, executor, process, navigate) => {
      WebEvents.emit("showModal", "collectorReport", process.data as any);
    },
  },
} as Record<string, Record<string, ActionFunc>>;

/**
 * Run an action, has to be after a completed process
 * @param action
 * @param software
 * @param computer
 * @param executor
 * @param process
 * @param navigate
 * @returns
 */
export const run = async (
  action: string,
  software: Software,
  computer: Computer,
  executor: Computer,
  process: Process,
  navigate: (to: string, data?: { state: object }) => void
) => {
  if (!actions?.[software.type]?.[action]) return;
  await actions[software.type][action](
    software,
    computer,
    executor,
    process,
    navigate
  );
};

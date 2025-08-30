import { Process as Table } from "~/db/client";
import { Computer } from "./computer";
import { server } from "~/index";
import processes from "~/app/processes";
import * as z from "zod";
import { Process, ProcessParameters } from "~/lib/types/process.type";

export type ProcessType = keyof typeof processes;

export class ComputerProcess {
  public computer?: Computer;
  public processId: string;
  public process?: Table;

  constructor(processId: string, process?: Table, computer?: Computer) {
    this.processId = processId;

    if (process != null) {
      this.process = process;
    }
    if (computer != null) {
      this.computer = computer;
    }
  }

  public async load(data?: Table) {
    this.process =
      data ||
      (await server.prisma.process.findFirstOrThrow({
        where: {
          id: this.processId,
          gameId: process.env.CURRENT_GAME_ID,
        },
      }));

    if (this.computer == null) {
      this.computer = new Computer(this.process.computerId);
      await this.computer.load();
    } else {
      this.computer.process = this.computer.process.map((process) => {
        if (process.processId === this.processId) {
          return this;
        }
        return process;
      });

      if (
        !this.computer.process.find((val) => val.processId === this.processId)
      ) {
        this.computer.process.push(this);
      }
    }
  }
}

export const zodObjects = {
  computer: async () => {
    return z.string();
  },
  ip: async () => {
    return z.string();
  },
  sessionId: async () => {
    return z.string();
  },
  softwareId: async () => {
    return z.string();
  },
  userId: async () => {
    return z.string();
  },
} as Record<
  keyof ProcessParameters,
  (data?: any) => Promise<z.ZodString | z.ZodNumber>
>;

export const getProcessZodObject = async (
  type: ProcessType,
  extend?: ProcessParameters,
) => {
  let process = processes[type] as Process;
  let obj: any = {};

  if (!process.settings?.parameters) return z.object({});

  let settingsParameters = {
    ...process.settings.parameters,
    ...extend,
  };

  await Promise.all(
    Object.keys(settingsParameters).map(async (key) => {
      if (key === "custom" || key === "sessionId") return;
      let result =
        await zodObjects?.[key as keyof ProcessParameters]?.(
          settingsParameters,
        );
      obj[key] = result;
    }),
  );

  if (settingsParameters?.custom) {
    let custom = {} as any;

    await Promise.all(
      Object.keys(settingsParameters.custom).map(async (key) => {
        custom[key] = await settingsParameters.custom?.[key](z);
      }),
    );

    obj = {
      ...obj,
      ...custom,
    };
  }

  return z.object(obj);
};
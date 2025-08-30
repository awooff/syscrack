import { Computer } from "~/app/computer";
import * as zod from "zod";
import { HardwareTypes } from "~/db/client";

export interface ProcessData {
  custom: Record<string, any>;
  userId: number;
  sessionId: string;
  computer: string;
  softwareId: string;
  ip: string;
}

export interface ProcessParameters {
  custom?: Record<
    string,
    (
      z: typeof zod,
    ) =>
      | zod.ZodString
      | zod.ZodNumber
      | zod.ZodBoolean
      | zod.ZodArray<zod.ZodString>
      | zod.ZodArray<zod.ZodNumber>
  >;
  userId?: boolean;
  sessionId?: boolean;
  computer?: boolean;
  softwareId?: boolean;
  ip?: boolean;
}

export interface ProcessSettings {
  localProcessOnly?: boolean;
  external?: boolean;
  delay?: number;
  utilizesHardware?: HardwareTypes;
  minimumExecutionTime?: number;
  parameters?: ProcessParameters;
}

export interface Process {
  settings?: ProcessSettings;
  delay?: (
    computer: Computer | null,
    executor: Computer,
    data: any,
  ) => Promise<number>;
  before: (
    computer: Computer | null,
    executor: Computer,
    data: any,
  ) => Promise<boolean>;
  after: (
    computer: Computer | null,
    executor: Computer,
    data: any,
  ) => Promise<void | any>;
}
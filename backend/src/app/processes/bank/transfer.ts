import {
  Process,
  ProcessData,
  ProcessSettings,
} from "@/lib/types/process.type";
import { Computer } from "@/app/computer";
import GameException from "@/lib/exceptions/game.exception";
import settings from "../../../settings";
import { getBankAccount } from "@/app/finance";

export type TransferData = {
  custom: {
    bankAccount: string;
  };
} & ProcessData;

const transfer = {
  settings: {
    parameters: {
      computer: true,
      custom: {
        bankAccount: (z) => {
          return z.string().trim().max(32);
        },
      },
    },
  },
  before: async (
    computer: Computer | null,
    executor: Computer,
    data: TransferData,
  ) => {
    if (computer === null) throw new Error("no computer");

    if (computer?.computer?.type !== "bank") {
      throw new Error("computer must be a bank");
    }

    const bankAccount = await getBankAccount(data.custom.bankAccount);

    if (bankAccount === null) throw new GameException("invalid bank account");

    return true;
  },
  after: async (
    computer: Computer | null,
    executor: Computer,
    data: ProcessData,
  ) => {
  },
} satisfies Process;
export default transfer;

import { Process, ProcessData } from "~/lib/types/process.type";
import { Computer } from "~/app/computer";

const create = {
  settings: {
    parameters: {
      computer: true,
    },
  },
  before: async (
    computer: Computer | null,
    executor: Computer,
    data: ProcessData,
  ) => {
    if (computer === null) throw new Error("no computer");
    if (computer?.computer?.type !== "bank") {
      throw new Error("computer must be a bank");
    }

    return true;
  },
  after: async (
    computer: Computer | null,
    executor: Computer,
    data: ProcessData,
  ) => {},
} satisfies Process;
export default create;
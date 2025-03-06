import { Process, ProcessData } from "@/lib/types/process.type";
import { Computer } from "../computer";
import settings from "../../settings";
import GameException from "@/lib/exceptions/game.exception";

const hack = {
  settings: {
    parameters: {
      ip: true,
    },
    delay: 4,
    utilizesHardware: "CPU",
    external: true,
  },
  delay: async (
    computer: Computer | null,
    executor: Computer,
    data: ProcessData,
  ) => {
    if (computer === null) {
      throw new Error("no computer");
    }

    const hasher = computer.getFirstTypeInstalled("hasher");
    const cracker = executor.getFirstTypeInstalled("cracker");

    return (
      hasher.getExecutionCost("execute") +
      cracker.getExecutionCost("execute") +
      settings.processDelay.hack * 1000
    );
  },
  before: async (
    computer: Computer | null,
    executor: Computer,
    data: ProcessData,
  ) => {
    if (computer === null) {
      throw new Error("no computer");
    }
    if (computer.computerId === executor.computerId) {
      throw new GameException(
        "cannot perform this action on your own computer",
      );
    }

    const hasher = computer.getFirstTypeInstalled("hasher");
    const cracker = executor.getFirstTypeInstalled("cracker");

    if (hasher.level > cracker.level) {
      throw new GameException("your cracker is too weak");
    }

    return true;
  },
  after: async (
    computer: Computer | null,
    executor: Computer,
    data: ProcessData,
  ) => {
    if (computer === null) throw new Error("no computer");

    if (!executor.addressBook) throw new Error("owner address book invalid");

    return await executor.addressBook.addToAddressBook(computer, "GOD");
  },
} satisfies Process;
export default hack;

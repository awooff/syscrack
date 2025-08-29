import { Process, ProcessData } from "~/lib/types/process.type";
import { Computer } from "~/app/computer";
import GameException from "~/lib/exceptions/game.exception";
import { AddressBook } from "~/app/addressbook";
import { server } from "~/index";
import settings from "~/settings";

export type ModifyData = {
  custom: {
    indexes: number[];
  };
} & ProcessData;

const modify = {
  settings: {
    parameters: {
      ip: true,
    },
    delay: settings.processDelay.modify,
    utilizesHardware: "HDD",
  },
  before: async (
    computer: Computer | null,
    executor: Computer,
    data: ModifyData,
  ) => {
    if (!computer || !executor.computer) throw new Error("invalid computer");

    let addressBook = new AddressBook(executor.computer?.userId);
    await addressBook.check();

    if (
      !(await addressBook.findInAddressBook(data.ip)) &&
      executor.computerId !== computer.computerId
    ) {
      throw new GameException("you must hack this computer first");
    }

    let logs = [] as any[];

    //check if these logs exists
    await Promise.all(
      data.custom.indexes.map(async (index: number) => {
        let result = await server.prisma.logs.findFirst({
          where: {
            id: index,
            gameId: process.env.CURRENT_GAME_ID,
          },
        });

        if (result) logs.push(result);
      }),
    );

    //if none exit return false
    if (logs.length === 0) return false;

    return true;
  },
  after: async (
    computer: Computer | null,
    executor: Computer,
    data: ProcessData,
  ) => {
    if (!computer || !executor.computer) throw new Error("invalid computer");

    let logs = [] as any[];

    await Promise.all(
      data.custom.indexes.map(async (index: number) => {
        let result = await server.prisma.logs.findFirst({
          where: {
            id: index,
            gameId: process.env.CURRENT_GAME_ID,
          },
        });

        if (result) logs.push(result);
      }),
    );

    await computer.deleteLogs(logs);
  },
} satisfies Process;
export default modify;
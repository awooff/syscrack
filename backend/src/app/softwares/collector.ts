import { SoftwareAction } from "~/lib/types/software.type";
import { deposit, getBankAccount } from "~/app/finance";
import { ProcessData } from "~/lib/types/process.type";
import GameException from "~/lib/exceptions/game.exception";
import { AddressBook } from "~/app/addressbook";
import { getComputer } from "~/app/computer";
import { AddressBook as Table, Software } from "~/db/client";
import settings from "~/settings";
import { server } from "~/index";

export type CollectorData = {
  custom: {
    bankAccount: string;
  };
} & ProcessData;

const collector = {
  settings: {
    localExecutionOnly: true,
    requireOwnership: true,
    parameters: {
      execute: {
        custom: {
          bankAccount: (z) => {
            return z.string().max(32);
          },
        },
      },
    },
  },
  preExecute: async (software, computer, executor, data: CollectorData) => {
    const account = await getBankAccount(data.custom.bankAccount);

    if (account === null) throw new GameException("bank account is invalid");
    if (!executor.computer) throw new Error("invalid executor");

    let addressBook = new AddressBook(executor.computer.userId);
    let viruses = await addressBook.viruses();

    if (viruses.length === 0) {
      throw new GameException(
        "You have no viruses installed on any of your computers in the address book",
      );
    }

    return true;
  },
  execute: async (software, computer, executor, data: CollectorData) => {
    const account = await getBankAccount(data.custom.bankAccount);

    if (account === null) throw new Error("bank account invalid");

    if (account === null) throw new GameException("bank account is invalid");
    if (!executor.computer) throw new Error("invalid executor");

    let addressBook = new AddressBook(executor.computer.userId);
    let viruses = await addressBook.viruses();
    let profit = 0;
    let result = [] as {
      profit: number;
      ranFor: number;
      address: Table;
      virus: Software;
    }[];

    viruses.forEach((res) => {
      let virus = res.virus;
      if (!virus) return;
      let total =
        software.level *
        (virus.level *
          (0.1 * (Date.now() - new Date(virus.executed).getTime())));

      total = total * (computer.getCombinedHardwareStrength("CPU") / 1000);
      total = total / settings.difficulty;
      total = total * settings.inflation;
      total = parseFloat(total.toFixed(2));

      result.push({
        profit: total,
        ranFor: Date.now() - new Date(virus.executed).getTime(),
        virus: virus,
        address: res.address,
      });
      profit += total;
    });

    //update executed time on all viruses
    await server.prisma.software.updateMany({
      where: {
        AND: viruses.map((virus) => {
          return { id: virus.virus?.id };
        }),
      },
      data: {
        executed: new Date(Date.now()).toString(),
      },
    });

    await deposit(account, profit);

    let bank = await getComputer(account.computerId);
    if (bank) executor.log(`Deposited ${profit} to ${account.key}`, bank);

    let report = await executor.addUserMemory(
      "Collection " + new Date(Date.now()).toString(),
      "collection_report",
      executor.computer.userId,
      result,
    );

    return {
      report: report,
    };
  },
} satisfies SoftwareAction;

export default collector;
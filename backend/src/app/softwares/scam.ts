import { SoftwareAction } from "~/lib/types/software.type";
import defaultSoftware from "./generic";
import { AddressBook } from "~/app/addressbook";

const scam = {
  settings: {
    // Spammer settings
    requireOwnership: true,
  },
  install: async (software, computer, executor, data) => {
    await defaultSoftware.install(software, computer, executor);

    if (!executor.computer) throw new Error("bad executor");

    let addressBook = new AddressBook(executor.computer.userId);
    await addressBook.addVirus(computer, software);
  },
  uninstall: async (software, computer, executor, data) => {
    await defaultSoftware.uninstall(software, computer, executor);

    if (!executor.computer) throw new Error("bad executor");

    let addressBook = new AddressBook(executor.computer.userId);
    await addressBook.removeVirus(computer, software);
  },
} satisfies SoftwareAction;

export default scam;
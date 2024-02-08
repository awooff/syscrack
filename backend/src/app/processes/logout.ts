import { Process, ProcessData } from "@/lib/types/process.type";
import { Computer } from "../computer";
import GameException from "@/lib/exceptions/game.exception";
import { AddressBook } from "../addressbook";
import { server } from "../../index";
import settings from "../../settings";

const logout = {
  settings: {
    parameters: {
      ip: true,
      sessionId: true,
    },
    delay: settings.processDelay.logout, // 1 seconds
    utilizesHardware: "Upload",
    external: true,
  },
  before: async (
    computer: Computer | null,
    executor: Computer,
    data: ProcessData
  ) => {
    if (!computer?.computer || !executor.computer)
      throw new Error("invalid computer");

    if (computer.computerId === executor.computerId)
      throw new GameException("cannot login to the same computer you own");

    let addressBook = new AddressBook(executor.computer?.userId);
    await addressBook.check();

    if (!(await addressBook.findInAddressBook(data.ip)))
      throw new GameException("you must hack this computer first");

    let request = server.request[data.sessionId];

    if (
      !request.session.logins ||
      !request.session.logins?.[executor.computerId] ||
      !request.session.logins[executor.computerId].find(
        (val) => val.id === computer.computerId
      )
    )
      return false;

    return true;
  },
  after: async (
    computer: Computer | null,
    executor: Computer,
    data: ProcessData
  ) => {
    if (!computer?.computer || !executor.computer)
      throw new Error("invalid computer");

    let req = server.request[data.sessionId];

    if (
      req.session.logins &&
      req.session.logins?.[executor.computerId] &&
      req.session.logins[executor.computerId].find(
        (val) => val.id === computer.computerId
      )
    )
      req.session.logins[executor.computerId] = req.session.logins[
        executor.computerId
      ].filter((val) => val.id !== computer.computerId);

    req.session.save();

    executor.log("remote session terminated", computer);
  },
} satisfies Process;
export default logout;

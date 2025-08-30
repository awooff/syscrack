import { Route } from "~/lib/types/route.type";
import { Groups } from "~/db/client";
import { Computer, findComputer, getComputer } from "~/app/computer";
import { connectionSchema } from "~/lib/schemas/connection.schema";
import { isConnectedToMachine } from "~/lib/helpers";
import { paginationSchema } from "~/lib/schemas/pagination.schema";

const fetch = {
  settings: {
    groupOnly: Groups.User,
    title: "Fetch Computer",
    description: "Used in the internet browser",
  },

  async post(req, res, error) {
    const body = await connectionSchema.safeParseAsync(req.body);

    if (!body.success) return error(body.error);
    if (!req.session.userId) return error("no user");

    const { ip, connectionId } = body.data;
    const computer = await findComputer(ip);
    const pagination = await paginationSchema.safeParseAsync(req.body);

    if (!pagination.success) return error(pagination.error);

    const { page } = pagination.data;

    if (!computer) return error("computer invalid");

    if (
      !req.session.connections?.find((element) => element.id === connectionId)
    ) {
      return error("not connected to that current computer");
    }

    let target = null;

    const executor = await getComputer(connectionId);

    if (!executor) throw new Error("bad computer");

    target = new Computer(computer?.id, computer);

    if (!isConnectedToMachine(req, executor, target)) {
      return error("your current computer must be connected to this computer");
    }

    let logs = await target.getLogs(64, page);
    let count = await target.getLogCount();

    res.send({
      logs,
      count,
      pages: Math.floor(count / 64) + 1,
    });
  },
} as Route;

export default fetch;
import { Route } from "../../lib/types/route.type";
import { Groups } from "@/db/client";
import { processCompleteSchema } from "@/lib/schemas/process.schema";
import { getProcessZodObject, ProcessType } from "@/app/process";
import processes from "@/app/processes";
import { Computer, findComputer, getComputer } from "@/app/computer";
import { server } from "../../index";
import GameException from "@/lib/exceptions/game.exception";
import { ProcessSettings } from "@/lib/types/process.type";
import { isConnectedToMachine } from "@/lib/helpers";

const cancel = {
  settings: {
    groupOnly: Groups.User,
    title: "Cancel Process",
    description: "Will cancel a process",
  },

  async post(req, res, error) {
    const body = await processCompleteSchema.safeParseAsync(req.body);

    if (!body.success) return error(body.error);
    if (!req.session.userId) return error("no user");

    const { processId } = body.data;

    const processData = await server.prisma.process.findUnique({
      where: {
        id: processId,
        userId: req.session.userId,
      },
      include: {
        computer: true,
      },
    });

    if (!processData) return error("invalid process");

    await server.prisma.process.delete({
      where: {
        id: processData.id,
      },
    });

    res.send({
      process: processData,
    });
  },
} as Route;

export default cancel;

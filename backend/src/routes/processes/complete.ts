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

const create = {
  settings: {
    groupOnly: Groups.User,
    title: "Create Process",
    description: "Will create a process",
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

    const executor = await getComputer(processData?.computerId);
    let target = null;

    if (processData.ip) target = await findComputer(processData.ip);

    if (!executor) return error("invalid executing computer");

    const gameProcess = processes[processData.type as ProcessType];

    if (
      !req.session.connections?.find(
        (element) => element.id === executor.computerId,
      )
    ) {
      return error(
        "you need to connect to this computer to finish this process",
      );
    }

    if (
      target &&
      !(gameProcess.settings as ProcessSettings).external &&
      !isConnectedToMachine(req, executor, new Computer(target.id, target)) &&
      target.id !== executor.computerId
    ) {
      return error("your current computer must be connected to this computer");
    }

    if (new Date(processData.completion).getMilliseconds() >= Date.now()) {
      return error("process not ready to complete");
    }

    if (
      !(await gameProcess.before(
        target ? await getComputer(target.id, target) : null,
        executor,
        processData.data as any,
      ))
    ) {
      return error("cannot complete process");
    }

    const result = await gameProcess.after(
      target ? await getComputer(target.id, target) : null,
      executor,
      processData.data as any,
    );

    await server.prisma.process.delete({
      where: {
        id: processData.id,
      },
    });

    res.send({
      process: processData,
      data: result,
    });
  },
} as Route;

export default create;

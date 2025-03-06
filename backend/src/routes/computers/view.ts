import { Route } from "../../lib/types/route.type";
import { server } from "../../index";
import { Groups, Prisma } from "@/db/client";
import { getComputer } from "@/app/computer";
import { computerIdSchema } from "@/lib/schemas/computer.schema";

const connect = {
  settings: {
    groupOnly: Groups.User,
    title: "View Your Computers",
    description: "Returns your computer and the latest 64 logs",
  },

  async post(req, res, error) {
    const body = await computerIdSchema.safeParseAsync(req.body);

    if (!body.success) return error(body.error);

    const { computerId } = body.data;
    const computer = await getComputer(computerId);

    if (computer === null) {
      return error("computer does not exist");
    }
    if (computer?.computer?.userId !== req.session.userId) {
      return error("user does not own this computer");
    }
    if (
      !req.session.connections ||
      req.session.connections.filter((that) => that.id === computer.computerId)
          .length === 0
    ) {
      return error("not connected to this computer");
    }

    res.send({
      computer: computer.computer,
    });
  },
} as Route;

export type ReturnType = {
  computer: Prisma.ComputerGetPayload<{
    include: {
      Logs: true;
      process: true;
      software: true;
      hardware: true;
    };
  }>;
};

export default connect;

import { Route } from "../../lib/types/route.type";
import { Groups, Logs, Prisma } from "@/db/client";
import { getComputer } from "@/app/computer";
import { computerIdSchema } from "@/lib/schemas/computer.schema";
import { paginationSchema } from "@/lib/schemas/pagination.schema";

const logs = {
  settings: {
    groupOnly: Groups.User,
    title: "View Computer Logs",
    description: "View your computers logs",
  },

  async post(req, res, error) {
    let body = await computerIdSchema.safeParseAsync(req.body);

    if (!body.success) return error(body.error);

    const { computerId } = body.data;

    let pagination = await paginationSchema.safeParseAsync(req.body);

    if (!pagination.success) return error(pagination.error);

    const { page } = pagination.data;
    const computer = await getComputer(computerId);

    if (!computer?.computer) {
      return error("invalid computer");
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

    let logs = await computer.getLogs(64, page);
    let count = await computer.getLogCount();

    res.send({
      logs,
      count,
      pageMax: Math.floor(count / 64) + 1,
    });
  },
} as Route;

export type ReturnType = {
  logs: Prisma.LogsGetPayload<{
    include: {
      computer: true;
    };
  }>[];
  count: number;
  pages: number;
  pageMax: number;
};

export default logs;

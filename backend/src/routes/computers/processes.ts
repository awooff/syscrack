import { Route } from "../../lib/types/route.type";
import { Groups, Prisma } from "@/db/client";
import { getComputer } from "@/app/computer";
import { computerIdSchema } from "@/lib/schemas/computer.schema";
import { paginationSchema } from "@/lib/schemas/pagination.schema";
import { server } from "../../index";

const processes = {
  settings: {
    groupOnly: Groups.User,
    title: "View Computer Processes",
    description: "View your computers processes",
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

    let processes = await server.prisma.process.findMany({
      where: {
        computerId: computerId,
        gameId: process.env.CURRENT_GAME_ID,
      },
      take: 32,
      skip: page * 32,
    });

    let count = await server.prisma.process.count({
      where: {
        computerId: computerId,
        gameId: process.env.CURRENT_GAME_ID,
      },
    });

    res.send({
      processes,
      count,
      pageMax: Math.floor(count / 64) + 1,
    });
  },
} as Route;

export type ReturnType = {
  processes: Prisma.ProcessGetPayload<{
    include: {
      computer: true;
    };
  }>[];
  count: number;
  pageMax: number;
};

export default processes;

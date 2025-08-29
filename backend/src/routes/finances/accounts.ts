import { Route } from "~/lib/types/route.type";
import { server } from "~/index";
import { Groups } from "~/db/client";
import { getUserBankAccount } from "~/app/finance";
import { paginationSchema } from "~/lib/schemas/pagination.schema";

const logout = {
  settings: {
    groupOnly: Groups.User,
    title: "Get Bank Accounts",
    description: "Will get all a users bank accounts",
  },

  async post(req, res, error) {
    const body = await paginationSchema.safeParseAsync(req.body);

    if (!body.success) return error(body.error);

    const { page } = body.data;

    let accounts = await server.prisma.memory.findMany({
      where: {
        userId: req.session.userId,
        type: "bank_account",
      },
      include: {
        computer: true,
      },
      skip: page * 32,
      take: 32,
    });

    const count = await server.prisma.computer.count({
      where: {
        userId: req.session.userId,
      },
    });

    res.send({
      accounts: accounts,
      page,
      count: accounts.length,
      pageMax: Math.floor(count / 64) + 1,
    });
  },
} as Route;

export default logout;
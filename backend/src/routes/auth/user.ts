import { Route } from "~/lib/types/route.type";
import { server } from "~/index";
import { Groups, User } from "~/db/client";
import { removeFromObject } from "~/lib/helpers";

const user = {
  settings: {
    groupOnly: Groups.User,
    title: "Return the user",
    description: "returns the current user",
  },

  async get(req, res, error) {
    const user = await server.prisma.user.findFirstOrThrow({
      where: {
        id: req.session.userId,
      },
      select: {
        name: true,
        email: true,
        group: true,
        id: true,
        created: true,
      },
    });
    res.send({
      user,
    });
  },
} as Route;

export type ReturnType = {
  user: User;
};

export default user;
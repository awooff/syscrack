import { Route } from "~/lib/types/route.type";
import { server } from "~/index";
import { Groups } from "~/db/client";

const logout = {
  settings: {
    groupOnly: Groups.User,
    title: "Logout User",
    description: "will logout the user from syscrack",
  },

  async post(req, res, error) {
    if (!req.session) return error("no sussin");

    await server.prisma.session.deleteMany({
      where: {
        id: req.sessionID,
      },
    });

    // destroy session data
    await new Promise((resolve) => req.session.destroy(resolve));

    res.send({
      success: true,
    });
  },
} as Route;

export type ReturnType = {
  success: boolean;
};

export default logout;
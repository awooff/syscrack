import { Route } from "~/lib/types/route.type";
import { server } from "~/index";
import { Groups } from "~/db/client";

const profile = {
  settings: {
    groupOnly: Groups.User,
    title: "Get User Profile",
    description:
      "Returns the user game profile, their bio, character, current quest among other things",
  },

  async post(req, res, error) {
    if (!req.session) return error("invalid session");

    let result = await server.prisma.profile.findFirst({
      where: {
        userId: req.session.userId,
        gameId: process.env.CURRENT_GAME_ID,
      },
    });

    if (!result) return error("invalid profile");

    res.send({
      profile,
    });
  },
} as Route;

export default profile;
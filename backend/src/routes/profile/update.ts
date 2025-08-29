import { Route } from "~/lib/types/route.type";
import { server } from "~/index";
import { Groups } from "~/db/client";
import { profileUpdateSchema } from "~/lib/schemas/profile.schema";

const profile = {
  settings: {
    groupOnly: Groups.User,
    title: "Update Profile",
    description:
      "Returns the user game profile, their bio, character, current quest among other things",
  },

  async post(req, res, error) {
    const body = await profileUpdateSchema.safeParseAsync(req.body);

    if (!body.success) return error(body.error);

    await server.prisma.profile.updateMany({
      where: {
        userId: req.session.userId,
        gameId: process.env.CURRENT_GAME_ID,
      },
      data: req.body,
    });

    res.send({
      success: true,
    });
  },
} as Route;

export default profile;

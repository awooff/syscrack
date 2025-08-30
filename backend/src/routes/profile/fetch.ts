import { Route } from "~/lib/types/route.type";
import { server } from "~/index";
import { Groups } from "~/db/client";
import { profileFetchSchema } from "~/lib/schemas/profile.schema";
import { ProfileData } from "~/lib/types/profile.type";

const profile = {
  settings: {
    groupOnly: Groups.User,
    title: "Update Profile",
    description:
      "Returns the user game profile, their bio, character, current quest among other things",
  },

  async post(req, res, error) {
    const body = await profileFetchSchema.safeParseAsync(req.body);

    if (!body.success) return error(body.error);

    let result = await server.prisma.profile.findFirst({
      where: {
        userId: body.data.userId,
        gameId: process.env.CURRENT_GAME_ID,
      },
    });

    if (!result) return error("invalid user");

    let data = (result.data as any).user as ProfileData;

    res.send({
      profile: {
        user: data.user,
        avatar: data.avatar,
      },
    });
  },
} as Route;

export default profile;
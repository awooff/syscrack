import { Route } from "~/lib/types/route.type";
import { server } from "~/index";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { removeFromObject } from "~/lib/helpers";
import { Groups, User } from "~/db/client";
import { loginSchema } from "~/lib/schemas/login.schema";

const login = {
  settings: {
    groupOnly: Groups.Guest,
    title: "Login User",
    description: "will login the user to syscrack",
  },

  async post(req, res, error) {
    const body = await loginSchema.safeParseAsync(req.body);

    if (!body.success) return error(body.error);

    const { username, password } = body.data;

    // check if email exists
    const user = await server.prisma.user.findFirst({
      where: {
        name: username,
      },
    });

    if (user === null) {
      return error("user doesn't exist");
    }
    if ((await bcrypt.hash(password, user.salt)) !== user.password) {
      return error("password incorrect");
    }
    if (
      await server.prisma.session.findFirst({
        where: {
          id: req.sessionID,
        },
      })
    ) {
      return error("already logged in");
    }

    // reload the session
    await new Promise((resolve) => {
      req.session.reload(resolve);
    });

    // create a JWT Token
    const token = jwt.sign(
      {
        userId: user.id,
        userEmail: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    //delete old sessions that have expired
    await server.prisma.session.deleteMany({
      where: {
        userId: user.id,
        expires: {
          lt: new Date(Date.now()),
        },
      },
    });

    // create new session
    await server.prisma.session.create({
      data: {
        id: req.sessionID,
        userId: user.id,
        token: token,
        lastAction: new Date(Date.now()),
        expires: new Date(Date.now() + 60 * 60 * 24 * 7),
      },
    });

    // set the session data
    req.session.userId = user.id;
    req.session.group = user.group;

    // send it back
    res.send({
      user: removeFromObject(user, ["password", "salt"]),
      sessionId: req.sessionID,
      token,
    });
  },
} as Route;

export type ReturnType = {
  user: User;
  sessionId: string;
  token: string;
};

export default login;
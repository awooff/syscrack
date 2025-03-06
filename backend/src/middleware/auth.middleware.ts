import { Route } from "@/lib/types/route.type";
import { server } from "../index";
import { Request, Response } from "express";
import { Groups } from "@/db/client";
import jwt from "jsonwebtoken";

export default async function authMiddleware(
  route: Route,
  req: Request,
  res: Response,
  next: any,
): Promise<void> {
  // if the current route group is set and is not only visible to guests
  if (route.settings?.groupOnly && route.settings?.groupOnly !== Groups.Guest) {
    let authToken = req.headers.authorization?.toString();
    authToken = authToken?.split(" ")[1];

    let result = await server.prisma.session.findFirst({
      where: {
        id: req.sessionID,
      },
    });

    if (!result) {
      res.status(401).send({
        message: "not logged in",
      });
      return;
    }

    //check JWT token
    if (result.token !== authToken) {
      res.status(401).send({
        message: "invalid current jwt token",
      });
      return;
    }

    // update last action
    await server.prisma.session.update({
      where: {
        id: req.sessionID,
      },
      data: {
        lastAction: new Date(Date.now()),
      },
    });

    // update last action on user table
    await server.prisma.user.update({
      where: {
        id: req.session.userId,
      },
      data: {
        lastAction: new Date(Date.now()),
      },
    });
  }

  next();
}

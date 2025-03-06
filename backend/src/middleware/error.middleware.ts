import ExpressError from "@/lib/exceptions/express.exception";
import GameException from "@/lib/exceptions/game.exception";
import type HttpException from "@/lib/exceptions/http.exception";
import { Request, Response } from "express";

export default function errorMiddleware(
  err: HttpException,
  req: Request,
  res: Response,
  next: any,
): void {
  if (typeof err === "string") {
    err = new ExpressError(err);
  }
  if (err instanceof GameException) {
    err = new ExpressError(err.message);
  }
  if (err instanceof ExpressError) {
    res.status(err.status).send({
      body: req.body || {},
      path: req.path,
      headers: req.headers,
      message: err.toString(),
    });
  } else {
    res.status(err.status || 500).send({
      error: err,
      body: req.body || {},
      path: req.path,
      headers: req.headers,
      message: err,
    });
  }
}

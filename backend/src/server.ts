import express, {
  type Application,
  type IRoute,
  Request,
  Response,
} from "express";
import path from "node:path";
import { glob } from "glob";
import { Route } from "./lib/types/route.type";
import { PrismaClient } from "~/db/client";
import helmet from "helmet";
import logger from "~/logger";
import compression from "compression";
import expressSession from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import errorMiddleware from "~/middleware/error.middleware";
import bodyparse from "body-parser";
import authMiddleware from "~/middleware/auth.middleware";

//to extend the express-session type
import "./lib/types/session.type";
import GameException from "./lib/exceptions/game.exception";

dotenv.config({
  override: true,
});

class Server {
  public server: Application;
  public routes: IRoute[];
  public prisma: PrismaClient;
  public request: Record<string, Request> = {};
  public response: Record<string, Response> = {};

  constructor() {
    this.server = express();
    this.prisma = new PrismaClient();
    this.routes = [];

    this.initialiseMiddleware();
    this.initialiseRoutes();
  }

  public start() {
    this.server.listen(process.env.PORT, () => {
      console.log("--------------------------------------------------");
      console.log(
        `(=￣ω￣=) online @ ${process.env.PUBLIC_URL}:${process.env.PORT} ♡ ╮(╯_╰)╭`,
      );
      console.log("--------------------------------------------------");
    });
  }

  /**
   * Initialise all the middlewares we want our server to use.
   * Should also ideally handle authentication checks as well!
   */
  private initialiseMiddleware(): void {
    this.server.use(helmet());
    this.server.use(logger);
    this.server.use(compression());
    this.server.use(
      cors({
        origin: [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://192.168.111.37:5174",
          "http://192.168.111.37:5173",
          "http://localhost:2700",
        ],
        optionsSuccessStatus: 200, // For legacy browser support
        credentials: true,
      }),
    );
    this.server.use(
      expressSession({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        cookie: {
          sameSite: false,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7 * 1000,
        },
      }),
    );
    this.server.use(bodyparse.json());
    this.server.use((req, res, next) => {
      this.request[req.sessionID] = req;
      this.response[req.sessionID] = res;
      next();
    });
  }

  /**
   * Add all our routes to the public `routes` array.
   */
  private async initialiseRoutes(): Promise<void> {
    let files = await glob(path.join(__dirname, "routes", "**/*.js"));

    await Promise.all(
      files.map(async (file) => {
        const normalizedFile = file.replace(/\\/g, "/");

        if (normalizedFile.endsWith(".d.ts") || normalizedFile.endsWith(".map"))
          return;

        const relativePath = path.relative(path.join(__dirname), file);
        let route = (await require(
          path.join(__dirname, relativePath),
        )) as Route;
        route = (route as any).default || (route as any).route;

        if (route?.settings == null) {
          route.settings = {};
        }

        if (route.settings?.route === undefined) {
          const parsedPath = path.parse(file);

          // Calculate route path relative to "routes" dir
          const relativeToRoutes = path.relative(
            path.join(__dirname, "routes"),
            file,
          );

          route.settings.route =
            "/" +
            relativeToRoutes
              .replace(parsedPath.ext, "")
              .split(path.sep)
              .join("/");
        }

        const newRoute = this.server.route(route.settings.route);
        (newRoute as any).settings = route.settings;
        (newRoute as any).source = route;

        if (route.get) {
          newRoute.get(
            (req: Request, res: Response, next: any) => next(route),
            authMiddleware,
            async (req: Request, res: Response, next: any) => {
              try {
                if (route.get) await route.get(req, res, next);
              } catch (error) {
                if (!(error instanceof GameException)) throw error;
                next(error, route);
              }
            },
            errorMiddleware,
          );
        }

        if (route.post) {
          newRoute.post(
            (req: Request, res: Response, next: any) => next(route),
            authMiddleware,
            async (req: Request, res: Response, next: any) => {
              try {
                if (route.post) await route.post(req, res, next);
              } catch (error) {
                if (!(error instanceof GameException)) throw error;
                next(error, route);
              }
            },
            errorMiddleware,
          );
        }

        this.routes.push(newRoute);
      }),
    );

    console.table(
      this.routes.map((route) => {
        const settings = { ...(route as any).settings };
        return {
          ...settings,
          get: !!(route as any).source?.get,
          post: !!(route as any).source?.post,
        };
      }),
    );
  }
}

export default Server;
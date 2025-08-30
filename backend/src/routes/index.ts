import { type Route } from "~/lib/types/route.type";
import { routes } from "~/index";
import { Groups } from "~/db/client";

const index = {
  settings: {
    route: ["/", "/index", "/home"],
    title: "List API Endpoints",
    description: "will list all the API endpoints",
  },

  async get(req, res, error) {
    const newRoutes = {} as any;

    routes.forEach((route) => {
      if (typeof route.path !== "string") {
        (route.path as string[]).forEach((path) => {
          newRoutes[path] = {
            get: (route as any)?.source?.get !== undefined,
            post: (route as any)?.source?.post !== undefined,
            settings: (route as any).settings,
          };
        });
      } else {
        newRoutes[route.path] = {
          get: route.get !== undefined,
          post: route.post !== undefined,
          settings: (route as any).settings,
        };
      }
    });
    res.send({
      title: process.env.WEBSITE_TITLE,
      currentGameId: process.env.CURRENT_GAME_ID,
      routes: newRoutes,
    });
  },
} as Route;

export default index;
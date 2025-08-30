import { Groups } from "~/db/client";
import type { RequestHandler } from "express";

export interface Route {
  settings?: {
    groupOnly?: Groups;
    route?: string | string[];
    title?: string;
    description?: string;
  };

  get?: RequestHandler;
  post?: RequestHandler;
}
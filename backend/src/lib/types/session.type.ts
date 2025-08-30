import { Computer, Groups } from "~/db/client";

// extend the session data object with our stuff
declare module "express-session" {
  export interface SessionData {
    userId: number;
    connections: Computer[];
    logins: Record<string, Computer[]>;
    group: Groups;
  }
}
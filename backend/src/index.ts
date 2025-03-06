import "module-alias/register";
import Server from "./server";

export const server = new Server();
export const { routes } = server;

server.start();

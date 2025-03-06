import test from "ava";
import request from "supertest";
import { server } from "../index";

const api = server.server;
test("check status", async (t) => {
  const response = await request(api)
    .get("/index");

  t.is(response.status, 304);
});

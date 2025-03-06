import { Route } from "../../lib/types/route.type";
import { server } from "../../index";
import { Groups } from "@/db/client";
import { homepageSchema } from "@/lib/schemas/homepage.schema";
import { paginationSchema } from "@/lib/schemas/pagination.schema";

const logout = {
  settings: {
    groupOnly: Groups.User,
    title: "Logout User",
    description: "will logout the user from syscrack",
  },

  async post(req, res, error) {
    if (!req.session) return error("no sussin");
    const body = await homepageSchema.safeParseAsync(req.body);

    if (!body.success) return error(body.error);

    const { domain } = body.data;

    const pagination = await paginationSchema.safeParseAsync(req.body);

    if (!pagination.success) return error(pagination.error);

    const { page } = pagination.data;

    if (!domain) return error("invalid query");

    let dns = await server.prisma.dNS.findMany({
      where: {
        OR: [
          {
            tags: { contains: domain },
          },
          {
            website: { contains: domain },
          },
          {
            description: { contains: domain },
          },
        ],
      },
      orderBy: {
        updated: "desc",
      },
      take: 32,
      skip: page * 32,
    });

    let count = dns.length !== 0
      ? await server.prisma.dNS.count({
        where: {
          OR: [
            {
              tags: { contains: domain },
            },
            {
              website: { contains: domain },
            },
            {
              description: { contains: domain },
            },
          ],
        },
      })
      : 0;

    return res.send({
      results: dns,
      pages: Math.round(count / 32),
      count,
    });
  },
} as Route;

export default logout;

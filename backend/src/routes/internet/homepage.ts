import { Route } from "~/lib/types/route.type";
import { Groups } from "~/db/client";
import { homepageSchema } from "~/lib/schemas/homepage.schema";
import { ComputerData, findComputer, getComputer } from "~/app/computer";
import { removeFromObject } from "~/lib/helpers";
import { AddressBook } from "~/app/addressbook";
import markdownit from "markdown-it";
import fs from "fs";
import { server } from "~/index";

const fetch = {
  settings: {
    groupOnly: Groups.User,
    title: "View Homepage",
    description:
      "Used in the internet browser, displays the computers homepage",
  },

  async post(req, res, error) {
    const body = await homepageSchema.safeParseAsync(req.body);

    if (!body.success) return error(body.error);
    const { ip, domain } = body.data;

    let computer;

    if (ip) computer = await findComputer(ip);
    else if (domain) {
      let dns = await server.prisma.dNS.findFirst({
        where: {
          website: domain,
          gameId: process.env.CURRENT_GAME_ID,
        },
      });

      if (dns === null) return error("invalid domain");
      computer = (await getComputer(dns.computerId))?.computer;
    } else return error("invalid query");

    const md = markdownit({
      html: true,
      linkify: true,
      typographer: true,
    });

    if (!computer) return error("computer not found");

    let data = (computer.data as any as ComputerData) || {};
    if (!req.session.userId) throw new Error("invalid session");

    let addressBook = new AddressBook(req.session.userId);
    await addressBook.check();

    res.send({
      computer: removeFromObject(computer, ["software", "hardware", "process"]),
      markdown: md.render(
        data?.homepage
          ? fs.readFileSync(
              process.cwd() +
                "/resources/homepages/" +
                data.homepage.replace(/\/\\\./g, "") +
                ".md",
              {
                encoding: "utf-8",
              },
            )
          : data?.markdown ||
              fs.readFileSync(
                process.cwd() + "/resources/homepages/default.md",
                {
                  encoding: "utf-8",
                },
              ),
        {
          computer: computer,
          access: (await addressBook.get(computer.ip)) || undefined,
        },
      ),
      access: (await addressBook.get(computer.ip)) || undefined,
      title: data.title || "Unknown Computer",
    });
  },
} as Route;

export default fetch;
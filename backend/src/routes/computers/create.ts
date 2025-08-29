import { Route } from "~/lib/types/route.type";
import { server } from "~/index";
import { Groups, HardwareTypes, Prisma } from "~/db/client";
import { ComputerData, generateIpAddress, getComputer } from "~/app/computer";
import settings from "../../settings";

const local = {
  settings: {
    groupOnly: Groups.User,
    title: "Create Computer",
    description: "Creates a new computer",
  },

  async post(req, res, error) {
    if (!req.session.userId) {
      return error("session is invalid");
    }

    const computerData = await server.prisma.computer.create({
      data: {
        userId: req.session.userId,
        ip: generateIpAddress(),
        gameId: process.env.CURRENT_GAME_ID,
        type: "vpc",
        data: {
          title: "New Computer",
          description: "A new computer",
          hardwareLimits: settings.defaultHardwareLimits,
        } satisfies ComputerData,
      },
    });
    const computer = await getComputer(computerData.id);

    if (computer === null) {
      return error("did not create computer");
    }

    // set computer
    await Promise.all(
      Object.values(settings.defaultSoftware).map(async (software) => {
        await computer?.addSoftware({
          game: {
            connect: {
              id: process.env.CURRENT_GAME_ID,
            },
          },
          user: {
            connect: {
              id: req.session.userId,
            },
          },
          computer: {
            connect: {
              id: computer.computerId,
            },
          },
          size: software.size,
          type: software.type,
          level: software.level,
          installed: software.installed,
          opacity: 0.0,
          data: {
            name: `Simple ${software.type}`,
            icon: software.type,
          },
        });
      }),
    );

    // set hardware
    await Promise.all(
      Object.keys(settings.defaultHardware).map(async (hardware: any) => {
        await computer?.setHardware(
          hardware,
          (settings.defaultHardware as any)[hardware],
        );
      }),
    );

    await computer.load();

    res.send({
      computer: computer.computer,
    });
  },
} as Route;

export type ReturnType = {
  computer: Prisma.ComputerGetPayload<{
    include: {
      Logs: true;
      process: true;
      software: true;
      hardware: true;
    };
  }>;
};

export default local;
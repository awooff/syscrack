import { HardwareTypes as HardwareType, Logs, Prisma } from "~/db/client";
import { server } from "../index";
import { Software } from "./software";
import { ComputerProcess } from "./process";
import { AddressBook } from "./addressbook";
import { removeFromObject } from "~/lib/helpers";

export interface ComputerData {
  title?: string;
  description?: string;
  markdown?: string;
  homepage?: string;
  hardwareLimits?: Record<HardwareType, number>;
}
export class Computer {
  public readonly computerId: string;
  public data?: ComputerData;
  public software: Software[] = [];
  public process: ComputerProcess[] = [];
  /**
   * The owner of this computers address book
   */
  public addressBook?: AddressBook;
  public computer?: Prisma.ComputerGetPayload<{
    include: {
      hardware: true;
      software: true;
      process: true;
    };
  }>;

  public constructor(
    computerId: string,
    computer?: Prisma.ComputerGetPayload<{
      include: {
        hardware: true;
        software: true;
        process: true;
      };
    }>,
  ) {
    this.computerId = computerId;
    this.computer = computer;
  }

  /**
   * Can be used to check if the comptuter exits
   * @param computerId
   * @returns
   */
  public static async exists(computerId: string) {
    return !(
      (await server.prisma.computer.findFirst({
        where: {
          id: computerId,
          gameId: process.env.CURRENT_GAME_ID,
        },
      })) == null
    );
  }

  public async addMemory(
    key: string,
    type: string,
    value?: number,
    data?: any,
  ) {
    if (!this.computer) throw new Error("comptuer not loaded");

    return await server.prisma.memory.create({
      data: {
        userId: this.computer.userId,
        gameId: process.env.CURRENT_GAME_ID,
        type,
        computerId: this.computerId,
        key,
        data,
        value,
      },
    });
  }

  public async getUserProfile() {
    if (!this.computer) throw new Error("comptuer not loaded");

    return await server.prisma.profile.findFirst({
      where: {
        userId: this.computer.userId,
        gameId: process.env.CURRENT_GAME_ID,
      },
    });
  }

  public async findMemory(type: string) {
    if (!this.computer) throw new Error("comptuer not loaded");

    return await server.prisma.memory.findFirst({
      where: {
        userId: this.computer.userId,
        gameId: process.env.CURRENT_GAME_ID,
        type,
      },
    });
  }

  public async getMemory(key: string) {
    if (!this.computer) throw new Error("comptuer not loaded");

    return await server.prisma.memory.findFirst({
      where: {
        userId: this.computer.userId,
        gameId: process.env.CURRENT_GAME_ID,
        key,
      },
    });
  }

  public async addUserMemory(
    key: string,
    type: string,
    userId: number,
    data?: any,
    value?: any,
  ) {
    return await server.prisma.memory.create({
      data: {
        userId,
        gameId: process.env.CURRENT_GAME_ID,
        type,
        computerId: this.computerId,
        key,
        data,
        value,
      },
    });
  }

  public async findUserMemory(type: string, userId: number) {
    return await server.prisma.memory.findFirst({
      where: {
        userId,
        gameId: process.env.CURRENT_GAME_ID,
        type,
      },
    });
  }

  public async getUserMemory(key: string, userId: number) {
    return await server.prisma.memory.findFirst({
      where: {
        userId,
        gameId: process.env.CURRENT_GAME_ID,
        key,
      },
    });
  }

  public async getLogs(take: number = 64, page: number = 0) {
    let result = server.prisma.logs.findMany({
      where: {
        gameId: process.env.CURRENT_GAME_ID,
        computerId: this.computerId,
      },
      include: {
        computer: false,
      },
      orderBy: {
        id: "desc",
      },
      take: take,
      skip: page * take,
    });

    return result;
  }

  public async deleteLogs(indexes: Logs[] | Logs) {
    await server.prisma.logs.deleteMany({
      where: (indexes as Logs)?.id
        ? {
            id: (indexes as Logs)?.id,
          }
        : (indexes as any).reduce((prev: Logs, current: Logs) => {
            return {
              id: current.id,
              AND: prev,
            };
          }),
    });
  }

  public async getLogCount() {
    return await server.prisma.logs.count({
      where: {
        gameId: process.env.CURRENT_GAME_ID,
        computerId: this.computerId,
      },
    });
  }

  public async log(message: string, from?: Computer) {
    const computer = from || this;

    if (!computer?.computer) throw new Error("computer not loaded");

    await server.prisma.logs.create({
      data: {
        userId: computer.computer.userId,
        computerId: this.computerId,
        senderId: from?.computerId || computer.computerId,
        senderIp: from?.ip || computer.ip,
        gameId: process.env.CURRENT_GAME_ID,
        message: message,
      },
    });
  }

  public get ip() {
    if (!this.computer) throw new Error("comptuer not loaded");

    return this.computer.ip;
  }

  public async changeIp(ip: string) {
    await this.update({
      ip: ip || generateIpAddress(),
    });
  }

  public async update(data: Prisma.ComputerUpdateInput) {
    await server.prisma.computer.update({
      where: {
        id: this.computerId,
      },
      data,
    });
    await this.load();
  }

  public async load(
    data?: Prisma.ComputerGetPayload<{
      include: {
        hardware: true;
        software: true;
        process: true;
      };
    }>,
  ) {
    this.computer =
      data ||
      (await server.prisma.computer.findFirstOrThrow({
        where: {
          id: this.computerId,
          gameId: process.env.CURRENT_GAME_ID,
        },
        include: {
          hardware: true,
          software: true,
          process: true,
        },
      }));

    // software
    this.computer.software.forEach((software) => {
      this.software.push(new Software(software.id, software, this));
    });

    for (let i = 0; i < this.software.length; i++) {
      await this.software[i].load(this.software[i].software);
    }
    // processes
    this.computer.process.forEach((process) => {
      this.process.push(new ComputerProcess(process.id, process, this));
    });

    for (let i = 0; i < this.process.length; i++) {
      await this.process[i].load(this.process[i].process);
    }
    // the owners address book
    this.addressBook = new AddressBook(this.computer.userId);
    //this will throw if the user for some reason is bad, but it won't be
    await this.addressBook.check();

    return this.computer;
  }

  public getSoftware(softwareId: string) {
    return this.software.filter(
      (software) => software.softwareId === softwareId,
    )[0];
  }

  public getFirstTypeInstalled(type: string) {
    return this.software.filter(
      (software) => software?.software?.type === type && software.installed,
    )[0];
  }

  public getInstalled(type: string) {
    return this.software.filter((software) => software.installed);
  }

  public async cloneSoftware(
    computer: Computer,
    software: Software | string,
    installed: boolean = false,
  ) {
    software =
      typeof software === "string" ? this.getSoftware(software) : software;

    if (!software.software) throw new Error("software class is not loaded");

    return await computer.addSoftware({
      ...removeFromObject(software.software, [
        "userId",
        "computerId",
        "gameId",
        "id",
      ]),
      installed: installed,
      data: {
        ...(typeof software.software.data === "string"
          ? JSON.parse(software.software.data)
          : software.software.data),
      },
      game: {
        connect: {
          id: process.env.CURRENT_GAME_ID,
        },
      },
      user: {
        connect: {
          id: computer.computer?.userId,
        },
      },
      computer: {
        connect: {
          id: computer.computerId,
        },
      },
    });
  }

  public async addSoftware(data: Prisma.SoftwareCreateInput) {
    const id = await server.prisma.software.create({
      data,
    });

    const software = new Software(id.id, id, this);
    this.software.push(software);
    return software;
  }

  public async setHardware(type: HardwareType, strength: number) {
    const previousHardware = this.getFirstHardwareType(type);

    if (previousHardware) {
      await server.prisma.hardware.delete({
        where: {
          id: previousHardware.id,
          gameId: process.env.CURRENT_GAME_ID,
        },
      });
    }

    await server.prisma.hardware.create({
      data: {
        gameId: process.env.CURRENT_GAME_ID,
        type,
        strength,
        computerId: this.computerId,
      },
    });
  }

  public getCombinedHardwareStrength(type: HardwareType) {
    if (!this.computer) throw new Error("comptuer not loaded");

    const result = this.computer.hardware.filter(
      (hardware) => hardware.type === type,
    );
    let combinedStrength = 0;
    result.forEach((hardware) => (combinedStrength += hardware.strength));
    return combinedStrength;
  }

  public getHardware(type: HardwareType) {
    if (!this.computer) throw new Error("comptuer not loaded");

    return this.computer.hardware.filter((hardware) => hardware.type === type);
  }

  public getFirstHardwareType(type: HardwareType) {
    if (!this.computer) throw new Error("comptuer not loaded");

    return this.computer.hardware.filter(
      (hardware) => hardware.type === type,
    )?.[0];
  }
}

export const findComputer = async (ip: string) => {
  const potentialComputer = await server.prisma.computer.findFirst({
    where: {
      ip: ip,
      gameId: process.env.CURRENT_GAME_ID,
    },
    include: {
      hardware: true,
      software: true,
      process: true,
    },
  });

  return potentialComputer;
};

export const getComputer = async (
  computerId: string,
  data?: Prisma.ComputerGetPayload<{
    include: {
      hardware: true;
      software: true;
      process: true;
    };
  }>,
) => {
  if (!(await Computer.exists(computerId))) {
    return null;
  }

  const computer = new Computer(computerId, data);
  await computer.load(data);

  return computer;
};

export const generateIpAddress = () => {
  const numbers = [];

  for (let i = 0; i < 4; i++) {
    numbers.push(Math.floor(Math.random() * 256));
  }

  if (numbers[0] <= 10 || numbers[0] === 192) {
    numbers[0] = 64;
  }

  return numbers.join(".");
};
import { AccessLevel, User } from "@/db/client";
import { server } from "../index";
import { Computer } from "./computer";
import { Software } from "./software";

export class AddressBook {
  public userId;
  public user?: User;

  constructor(userId: number) {
    this.userId = userId;
  }

  /**
   * @throws
   */
  public async check() {
    // catches out bugs by forcing userId to be attached to valid address book
    this.user = await server.prisma.user.findFirstOrThrow({
      where: {
        id: this.userId,
      },
    });
  }

  public async removeVirus(computer: Computer, virus: Software) {
    let address = await server.prisma.addressBook.findFirst({
      where: {
        userId: this.userId,
        gameId: process.env.CURRENT_GAME_ID,
        computerId: computer.computerId,
      },
    });

    if (!address) throw new Error("computer not in address book");

    let data = address.data as {
      viruses?: any[];
    };

    data.viruses = data.viruses || [];

    if (data.viruses.length === 0) return;

    data.viruses = data.viruses.filter((elm) => elm.id !== virus.softwareId);

    return await server.prisma.addressBook.update({
      where: {
        id: address.id,
      },
      data: {
        data: data,
      },
    });
  }

  public async addVirus(computer: Computer, virus: Software) {
    let address = await server.prisma.addressBook.findFirst({
      where: {
        userId: this.userId,
        gameId: process.env.CURRENT_GAME_ID,
        computerId: computer.computerId,
      },
    });

    if (!address) throw new Error("computer not in address book");

    let data = address.data as {
      viruses?: any[];
    };

    data.viruses = data.viruses || [];

    if (data.viruses.find((elm) => elm.id === virus.softwareId)) {
      throw new Error("virus already present");
    }

    data.viruses.push(virus);

    return await server.prisma.addressBook.update({
      where: {
        id: address.id,
      },
      data: {
        data: data,
      },
    });
  }

  public async viruses(types: string[] = ["spammer"]) {
    let addresses = await server.prisma.addressBook.findMany({
      where: {
        userId: this.userId,
        gameId: process.env.CURRENT_GAME_ID,
      },
    });

    let viruses = [];

    for (let i = 0; i < addresses.length; i++) {
      let result = await server.prisma.software.findFirst({
        where: {
          userId: this.userId,
          computerId: addresses[i].computerId,
          OR: types.map((val) => {
            return { type: val };
          }),
        },
      });
      viruses.push({ virus: result, address: addresses[i] });
    }

    return viruses;
  }

  public async fetch(take?: number, page?: number) {
    return await server.prisma.addressBook.findMany({
      where: {
        userId: this.userId,
        gameId: process.env.CURRENT_GAME_ID,
      },
      include: {
        computer: true,
      },
      take: take || 64,
      skip: take && page ? take * page : 0,
    });
  }

  public async count() {
    return await server.prisma.addressBook.count({
      where: {
        userId: this.userId,
        gameId: process.env.CURRENT_GAME_ID,
      },
    });
  }

  public async removeFromAddressBook(computer: Computer) {
    await server.prisma.addressBook.deleteMany({
      where: {
        computerId: computer.computerId,
        userId: this.userId,
        gameId: process.env.CURRENT_GAME_ID,
      },
    });
  }

  /**
   * @param ip
   * @returns
   */
  public async get(ip: string) {
    return await server.prisma.addressBook.findFirst({
      where: {
        userId: this.userId,
        gameId: process.env.CURRENT_GAME_ID,
        ip: ip,
      },
    });
  }

  public async addToAddressBook(computer: Computer, access: AccessLevel) {
    if (!computer.computer) throw new Error("computer not loaded");

    return await server.prisma.addressBook.create({
      data: {
        computerId: computer.computerId,
        userId: computer.computer.userId,
        access: access,
        gameId: process.env.CURRENT_GAME_ID,
        ip: computer.ip,
      },
    });
  }

  public async findInAddressBook(ipAddress: string) {
    let result = await server.prisma.addressBook.findFirst({
      where: {
        userId: this.userId,
        ip: ipAddress,
        gameId: process.env.CURRENT_GAME_ID,
      },
    });

    return result;
  }
}

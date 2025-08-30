import { Memory, User } from "~/db/client";
import { server } from "~/index";
import { Computer } from "./computer";

export class AccountBook {
  public userId;
  public user?: User;

  constructor(userId: number) {
    this.userId = userId;
  }

  /**
   * @param ip
   * @returns
   */
  public async get(memoryId: string) {
    return await server.prisma.accountBook.findFirst({
      where: {
        userId: this.userId,
        gameId: process.env.CURRENT_GAME_ID,
        memoryId: memoryId,
      },
    });
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

  public async fetch(take?: number, page?: number) {
    return await server.prisma.accountBook.findMany({
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
    return await server.prisma.accountBook.count({
      where: {
        userId: this.userId,
        gameId: process.env.CURRENT_GAME_ID,
      },
    });
  }

  public async removeComputerFromAccountBook(computer: Computer) {
    await server.prisma.accountBook.deleteMany({
      where: {
        computerId: computer.computerId,
        userId: this.userId,
        gameId: process.env.CURRENT_GAME_ID,
      },
    });
  }

  public async addToAccountBook(
    computer: Computer,
    memory: Memory,
    data?: any,
  ) {
    if (!computer.computer) throw new Error("computer not loaded");

    return await server.prisma.accountBook.create({
      data: {
        computerId: computer.computerId,
        userId: computer.computer.userId,
        memoryId: memory.id,
        gameId: process.env.CURRENT_GAME_ID,
        data: data,
      },
    });
  }
}
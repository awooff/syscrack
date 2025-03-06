import { Memory, Prisma } from "@/db/client";
import { server } from "../index";

export const canAfford = async (bankAccount: string | Memory, cost: number) => {
  const account = typeof bankAccount === "string"
    ? await getBankAccount(bankAccount)
    : bankAccount;

  if (account === null) {
    throw new Error("bank account is ivnalid");
  }

  if (account.type !== "bank_account") {
    throw new Error("computer memory must be of type bank");
  }

  return (account?.value || 0) - cost > 0;
};

export const deposit = async (bankAccount: string | Memory, value: number) => {
  const account = typeof bankAccount === "string"
    ? await getBankAccount(bankAccount)
    : bankAccount;

  if (account === null) {
    throw new Error("bank account is ivnalid");
  }

  account.value = (account?.value || 0) + value;

  return await server.prisma.memory.update({
    where: {
      id: account.id,
      gameId: process.env.CURRENT_GAME_ID,
      type: "bank_account",
    },
    data: {
      value: account.value,
    },
  });
};

export const withdraw = async (bankAccount: string | Memory, value: number) => {
  const account = typeof bankAccount === "string"
    ? await getBankAccount(bankAccount)
    : bankAccount;

  if (account === null) {
    throw new Error("bank account is ivnalid");
  }

  account.value = (account?.value || 0) - value;

  if (account.value < 0) {
    account.value = 0;
  }

  return await server.prisma.memory.update({
    where: {
      id: account.id,
      gameId: process.env.CURRENT_GAME_ID,
      type: "bank_account",
    },
    data: {
      value: account.value,
    },
  });
};

export const getBankAccount = async (bankAccount: string) => {
  return await server.prisma.memory.findFirst({
    where: {
      key: bankAccount,
      gameId: process.env.CURRENT_GAME_ID,
      type: "bank_account",
    },
  });
};

export const getUserBankAccount = async (userId: number) => {
  return await server.prisma.memory.findFirst({
    where: {
      userId,
      gameId: process.env.CURRENT_GAME_ID,
      type: "bank_account",
    },
  });
};

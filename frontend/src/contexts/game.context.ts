import { createContext } from "react";
import { User, Prisma } from "backend/src/generated/client";

export type Computer = Prisma.ComputerGetPayload<{
  include: { hardware: true; software: false; process: false };
}>;

export type PersonalComputer = Prisma.ComputerGetPayload<{
  include: { hardware: true; software: false; process: true };
}>;

export type ConnectedComputer = Prisma.ComputerGetPayload<{
  include: { Logs: true; software: true; hardware: true };
}>;

export type GameType = {
  loaded: boolean;
  connections: ConnectedComputer[];
  computers: PersonalComputer[];
  user: User;
  gameId: string;
  title: string;
  preferences: object;
  load: () => Promise<unknown>;
  reload: () => unknown;
};

export const GameContextDefault = {
  loaded: false,
  connections: [],
  computers: [],
  title: "",
  preferences: {},
  gameId: "",
  user: {} as any,
  valid: false,
  load: async () => {},
  reload: () => {},
} as GameType;

const GameContext = createContext<GameType>(GameContextDefault);

export default GameContext;

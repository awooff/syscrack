import React, { ReactNode, useContext } from "react";
import GameContext, { GameType } from "../contexts/game.context";
import ComputerThumbnail from "./Computer";
import { Computer } from "../lib/types/computer.type";
import { SessionType } from "../contexts/session.context";

export default function Computers({
  thumbnail,
  children,
  render,
  className,
  onlyConnected,
  onlyDisconnected,
}: {
  thumbnail?: boolean;
  children?: ReactNode[];
  className?: string;
  render?: (
    game: GameType,
    session: SessionType,
    computer: Computer,
    connections?: Computer[]
  ) => ReactNode | ReactNode[];
  onlyConnected?: boolean;
  onlyDisconnected?: boolean;
}) {
  const game = useContext(GameContext);
  return (
    <>
      {thumbnail &&
        game.computers.map((computer, index) => {
          if (
            onlyDisconnected &&
            game.connections.find((val) => val.id === computer.id)
          )
            return <></>;
          else if (
            onlyConnected &&
            !game.connections.find((val) => val.id === computer.id)
          )
            return <></>;

          return (
            <ComputerThumbnail
              key={index}
              computer={computer}
              connections={game.connections}
              render={render}
              className={className}
            >
              {children}
            </ComputerThumbnail>
          );
        })}
    </>
  );
}

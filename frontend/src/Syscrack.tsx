import React from "react";
import { Toaster } from "react-hot-toast";
import router from "./routes";
import { RouterProvider } from "react-router-dom";
import SessionProvider from "./providers/session.provider";
import GameProvider from "./providers/game.provider";

function Syscrack() {
  return (
    <SessionProvider>
      <GameProvider>
        <RouterProvider router={router} />
        <Toaster />
      </GameProvider>
    </SessionProvider>
  );
}

export default Syscrack;

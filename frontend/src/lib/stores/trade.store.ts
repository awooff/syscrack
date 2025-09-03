import { create } from "zustand";
import { Trade } from "backend/src/generated/client";
import { createJSONStorage, persist } from "zustand/middleware";

type State = {
  processes: Record<string, Trade[]>;
};

type Action = {
  addTrade: (process: Trade) => void;
  removeTrade: (process: Trade) => void;
  setTradees: (processes: Trade[]) => void;
};

export const useTradeStore = create<State & Action>()(
  persist(
    (set, get) => ({
      processes: {},
      addTrade(process: Trade) {
        if (!process) return;

        if (!get().processes?.[process.computerId])
          set({
            processes: {
              ...get().processes,
              [process.computerId]: [],
            },
          });

        if (
          get()?.processes?.[process.computerId]?.find(
            (that) => that.id === process.id
          )
        )
          return;
        set({
          processes: {
            [process.computerId]: [
              ...get().processes[process.computerId],
              process,
            ],
          },
        });
      },
      removeTrade(process: Trade) {
        if (get().processes?.[process.computerId]?.length === 1)
          set({
            processes: {
              [process.computerId]: [],
            },
          });
        else
          set({
            processes: {
              [process.computerId]: get().processes[process.computerId].filter(
                (that) => that.id !== process.id
              ),
            },
          });
      },
      setTradees(processes: Trade[]) {
        if (processes.length === 0) return;
        if (!get().processes[processes[0].computerId])
          set({
            processes: {
              ...get().processes,
              [processes[0].computerId]: [],
            },
          });

        set({
          processes: {
            ...get().processes,
            [processes[0].computerId]: processes,
          },
        });
      },
    }),
    {
      name: "syscrack__process-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

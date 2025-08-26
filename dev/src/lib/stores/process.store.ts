import { create } from "zustand";
import { Process } from "backend/src/generated/client";
import { createJSONStorage, persist } from "zustand/middleware";

type State = {
  processes: Record<string, Process[]>;
};

type Action = {
  addProcess: (process: Process) => void;
  removeProcess: (process: Process) => void;
  setProcesses: (processes: Process[]) => void;
};

export const useProcessStore = create<State & Action>()(
  persist(
    (set, get) => ({
      processes: {},
      addProcess(process: Process) {
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
      removeProcess(process: Process) {
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
      setProcesses(processes: Process[]) {
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
);

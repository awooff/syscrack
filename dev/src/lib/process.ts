import { postRequestHandler } from "./submit";
import toast from "react-hot-toast";
import { Process } from "./types/process.type";
import { AxiosResponse } from "axios";
import WebEvents from "./events";

export const createProcess = async <T>(
  type: string,
  data?: object,
  autoComplete?: boolean,
  onCreation?: (process: Process) => void,
  setError?: (error: Error) => unknown
) => {
  const result = await postRequestHandler<{
    process: Process;
  }>(
    "/processes/create",
    {
      ...(data || {}),
      type: type,
    },
    undefined,
    setError
  );

  if (onCreation) onCreation(result.data.process);

  const promise = new Promise<
    AxiosResponse<
      | T
      | {
        process: Process;
      },
      any
    >
  >((resolve, reject) => {
    setTimeout(
      async () => {
        if (autoComplete) {
          const process = await postRequestHandler<T>(
            "/processes/complete",
            {
              ...(data || {}),
              processId: result.data.process.id,
            },
            undefined,
            reject
          );
          WebEvents.emit("processCompleted", result.data.process);
          resolve(process);
        } else resolve(result);
      },
      new Date(result.data.process.completion).getTime() - Date.now()
    );
  });

  toast.promise(promise, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loading:
      "Executing " +
      ((data as any).action || result.data.process.type) +
      " on " +
      result.data.process.ip +
      " completed in " +
      (new Date(result.data.process.completion).getTime() - Date.now()) / 1000 +
      " seconds",
    success:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      autoComplete
        ? "Successfully executed " +
        ((data as any).action || result.data.process.type) +
        " on " +
        result.data.process.ip
        : "Awaiting completion...",
    error:
      "Error executing " +
      result.data.process.type +
      " on " +
      result.data.process.ip,
  });

  return promise as Promise<AxiosResponse<T, any>>;
};

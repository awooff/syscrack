import React, { useContext, useEffect, useState } from "react";
import { Computer } from "backend/src/generated/client";
import { Process } from "backend/src/generated/client";
import SessionContext from "../../../contexts/session.context";
import LogComponent from "../../LogComponent";
import BrowserLayout from "../BrowserLayout";
import { useProcessStore } from "../../../lib/stores/process.store";

function Logs({
  connectionId,
  ip,
  computer,
  markdown,
  valid,
  access,
  setTab,
}: {
  connectionId: string;
  ip: string;
  computer: Computer;
  markdown: string;
  valid: boolean;
  access: object | null;
  setTab: (tab: string) => void;
}) {
  const session = useContext(SessionContext);
  const [process, setProcess] = useState<Process | null>(null);
  const processStore = useProcessStore();
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!computer || ip || connectionId || !session.loaded) return;
    if (
      !session.data.logins[connectionId]?.find(
        (that) => that.ip === ip || that.id === computer.id
      )
    )
      setTab("homepage");
  }, [session, connectionId, ip, computer]);

  useEffect(() => {
    if (process === null && processStore.processes[connectionId])
      setProcess(processStore.processes[connectionId][0]);
  }, [process, connectionId]);

  return (
    <BrowserLayout
      setTab={setTab}
      variant="info"
      computer={computer}
      connectionId={connectionId}
      error={error}
      access={access}
      process={process}
    >
      <LogComponent
        ip={computer.ip}
        connectionId={connectionId}
        setProcess={setProcess}
      />
    </BrowserLayout>
  );
}

Logs.propTypes = {};

export default Logs;

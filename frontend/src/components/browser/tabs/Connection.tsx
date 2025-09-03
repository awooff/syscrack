import React, { useContext, useEffect, useState } from "react";
import { Alert, Button, Card, Col, Row } from "react-bootstrap";
import { Computer } from "backend/src/generated/client";
import { Process } from "backend/src/generated/client";
import { createProcess } from "../../../lib/process";
import SessionContext from "../../../contexts/session.context";
import BrowserLayout from "../BrowserLayout";
import { useProcessStore } from "../../../lib/stores/process.store";

function Connection({
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
    if (process === null && processStore.processes[connectionId])
      setProcess(processStore.processes[connectionId][0]);
  }, [process, connectionId]);

  return (
    <BrowserLayout
      setTab={setTab}
      computer={computer}
      connectionId={connectionId}
      error={error}
      variant="primary"
      access={access}
      process={process}
    >
      <Row>
        <Col>
          <Card
            body
            className={
              "bg-transparent rounded-0 " +
              (session.data.logins?.[connectionId]?.find(
                (login) => login.id === computer.id
              ) !== undefined
                ? "border-secondary"
                : "border-success")
            }
            style={{
              filter:
                session.data.logins?.[connectionId]?.find(
                  (login) => login.id === computer.id
                ) !== undefined
                  ? "blur(12px)"
                  : "",
            }}
          >
            <div className="d-grid gap-2">
              <img className="img-fluid mx-auto" src="/icons/connect.png"></img>
              <Card
                body
                className="mb-3 bg-transparent border-secondary rounded-0 text-white text-center"
              >
                $ connect {computer.ip}
              </Card>
              <Button
                variant={
                  session.data.logins?.[connectionId]?.find(
                    (login) => login.id === computer.id
                  ) !== undefined
                    ? "secondary"
                    : "success"
                }
                disabled={
                  session.data.logins?.[connectionId]?.find(
                    (login) => login.id === computer.id
                  ) !== undefined
                }
                onClick={async () => {
                  setError(null);
                  try {
                    await createProcess(
                      "login",
                      {
                        ip: computer.ip,
                        connectionId: connectionId,
                      },
                      true,
                      (process) => {
                        setProcess(process);
                      }
                    ).finally(() => {
                      setProcess(null);
                    });
                    await session.load();
                    setTab("logs");
                  } catch (err: any) {
                    setError(new Error(err));
                    setTimeout(() => {
                      setError(null);
                    }, 3000);
                  }
                }}
              >
                Connect
              </Button>
            </div>
          </Card>
        </Col>
        <Col>
          <Card
            body
            className={
              "bg-transparent rounded-0 " +
              (session.data.logins?.[connectionId]?.find(
                (login) => login.id === computer.id
              ) === undefined
                ? "border-secondary"
                : "border-danger")
            }
            style={{
              height: "100%",
              filter:
                session.data.logins?.[connectionId]?.find(
                  (login) => login.id === computer.id
                ) === undefined
                  ? "blur(12px)"
                  : "",
            }}
          >
            <div className="d-grid gap-2">
              <img
                className="img-fluid mx-auto"
                src="/icons/disconnect.png"
              ></img>
              <Card
                body
                className="mb-3 bg-transparent border-secondary rounded-0 text-white text-center"
              >
                $ disconnect {computer.ip}
              </Card>
              <Button
                variant={
                  session.data.logins?.[connectionId]?.find(
                    (login) => login.id === computer.id
                  ) === undefined
                    ? "secondary"
                    : "danger"
                }
                disabled={
                  session.data.logins?.[connectionId]?.find(
                    (login) => login.id === computer.id
                  ) === undefined
                }
                onClick={async () => {
                  setError(null);
                  try {
                    await createProcess(
                      "logout",
                      {
                        ip: computer.ip,
                        connectionId: connectionId,
                      },
                      true,
                      (process) => {
                        setProcess(process);
                      }
                    ).finally(() => {
                      setProcess(null);
                    });
                    await session.load();
                    setTab("homepage");
                  } catch (err: any) {
                    setError(new Error(err));
                    setTimeout(() => {
                      setError(null);
                    }, 3000);
                  }
                }}
              >
                Disconnect
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </BrowserLayout>
  );
}

Connection.propTypes = {};

export default Connection;

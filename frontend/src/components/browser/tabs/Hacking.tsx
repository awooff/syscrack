import { useCallback, useContext, useEffect, useState } from "react";
import GameContext, { ConnectedComputer } from "../../../contexts/game.context";
import { Computer } from "backend/src/generated/client";
import { Alert, Button, Card, ListGroup, Row } from "react-bootstrap";
import { Col } from "react-bootstrap";
import { Process } from "backend/src/generated/client";
import { createProcess } from "../../../lib/process";
import { HomepageRequest } from "../../../pages/internet/Browser";
import SessionContext from "../../../contexts/session.context";
import { useProcessStore } from "../../../lib/stores/process.store";
import BrowserLayout from "../BrowserLayout";
import { postRequestHandler } from "../../../lib/submit";
import { Software } from "backend/src/generated/client";
import { ReturnType } from "backend/dist/routes/computers/view";

function Hacking({
  connectionId,
  ip,
  computer,
  markdown,
  valid,
  access,
  setTab,
  fetchHomepage,
}: {
  connectionId: string;
  ip: string;
  computer: Computer;
  markdown: string;
  valid: boolean;
  access: object | null;
  setTab: (tab: string) => void;
  fetchHomepage: (ip: string, connectionId: string) => Promise<HomepageRequest>;
}) {
  const session = useContext(SessionContext);
  const processStore = useProcessStore();
  const [process, setProcess] = useState<Process | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [executor, setExecutor] = useState<ConnectedComputer | null>(null);
  const [cracker, setCracker] = useState<Software | null>(null);
  const [exploiter, setExploiter] = useState<Software | null>(null);

  useEffect(() => {
    if (!computer || ip || connectionId || !session.loaded) return;
    if (
      session.data.logins[connectionId]?.find(
        (that) => that.ip === ip || that.id === computer.id
      ) ||
      access
    )
      setTab("logs");
  }, [session, connectionId, ip, computer]);

  const fetchExecutor = useCallback(async (connectionId: string) => {
    let result = await postRequestHandler<ReturnType>("/computers/view", {
      computerId: connectionId,
    });
    return result.data;
  }, []);

  useEffect(() => {
    if (process === null && processStore.processes[connectionId])
      setProcess(processStore.processes[connectionId][0]);
  }, [process, connectionId]);

  useEffect(() => {
    fetchExecutor(connectionId).then((result) => {
      let cracker = result.computer.software.find(
        (software) => software.type === "cracker" && software.installed
      );
      let exploiter = result.computer.software.find(
        (software) => software.type === "exploiter" && software.installed
      );

      setExecutor(result.computer as any);
      setCracker(cracker || null);
      setExploiter(exploiter || null);
    });
  }, [connectionId]);

  return (
    <BrowserLayout
      setTab={setTab}
      computer={computer}
      variant="danger"
      connectionId={connectionId}
      error={error}
      access={access}
      process={process}
    >
      <Alert
        variant="danger"
        className="bg-transparent border-success border rounded-0 text-center"
      >
        <p className="display-4 mt-2 mb-5">
          {(computer.data as any).title}
          <br />
          <b
            style={{
              fontSize: "50%",
            }}
          >
            {computer.ip}
          </b>
        </p>
        <span className="badge bg-success mb-3">AVAILABLE TO HACK</span>
      </Alert>
      <Row>
        <Col>
          <Card
            body
            className={
              "bg-transparent rounded-0 " +
              (cracker ? "border-primary" : "border-secondary")
            }
            style={{
              height: "100%",
            }}
          >
            <p
              className={
                "display-5 mt-4 mb-4 text-center " +
                (cracker ? "text-white" : "")
              }
            >
              Exploit Shell
            </p>
            <div className="d-grid gap-2">
              <Card
                body
                className="mb-3 bg-transparent border-secondary rounded-0 text-white text-center"
              >
                {!cracker ? (
                  <>You need to install a cracker</>
                ) : (
                  <ListGroup className="rounded-0">
                    <ListGroup.Item variant="light">
                      Your cracker level is <u>{cracker.level}</u>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Your CPU level is{" "}
                      <u>
                        {
                          executor?.hardware?.reduce((prev, cur) => {
                            if (cur.type !== "CPU")
                              return {
                                ...prev,
                              };

                            return {
                              ...prev,
                              strength: cur.strength + prev.strength,
                            };
                          }).strength
                        }
                      </u>
                    </ListGroup.Item>
                  </ListGroup>
                )}
              </Card>
              <Button
                disabled={!cracker || process?.type === "hack"}
                onClick={async () => {
                  setError(null);
                  try {
                    let result = await createProcess<{
                      process: Process;
                    }>(
                      "hack",
                      {
                        ip: computer.ip,
                        connectionId: connectionId,
                      },
                      true,
                      (process) => {
                        processStore.addProcess(process);
                        setProcess(process);
                      }
                    ).finally(() => {
                      setProcess(null);
                    });
                    processStore.removeProcess(result.data.process);
                    fetchHomepage(ip, connectionId).then(() => {
                      setTab("connection");
                    });
                  } catch (err: any) {
                    setError(new Error(err));
                    setTimeout(() => {
                      setError(null);
                    }, 3000);
                  }
                }}
                variant={!cracker ? "secondary" : "primary"}
              >
                Hack
              </Button>
            </div>
          </Card>
        </Col>
        <Col>
          <Card
            body
            className={
              "bg-transparent rounded-0 " +
              (exploiter ? "border-primary" : "border-secondary")
            }
            style={{
              height: "100%",
            }}
          >
            <p
              className={
                "display-5 text-center mt-4 mb-4 " +
                (exploiter ? "text-white" : "")
              }
            >
              Exploit FTP
            </p>
            <div className="d-grid gap-2">
              <Card
                body
                className="mb-3 bg-transparent border-secondary rounded-0 text-white text-center"
              >
                {!exploiter ? (
                  <span>You need to install an exploiter</span>
                ) : (
                  <ListGroup className="rounded-0">
                    <ListGroup.Item variant="light">
                      Your exploiter level is <u>{exploiter.level}</u>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Your CPU level is{" "}
                      <u>
                        {
                          executor?.hardware?.reduce((prev, cur) => {
                            if (cur.type !== "CPU")
                              return {
                                ...prev,
                              };

                            return {
                              ...prev,
                              strength: cur.strength + prev.strength,
                            };
                          }).strength
                        }
                      </u>
                    </ListGroup.Item>
                  </ListGroup>
                )}
              </Card>
              <Button
                variant={!exploiter ? "secondary" : "primary"}
                onClick={async () => {
                  setError(null);
                  try {
                    let result = await createProcess<{
                      process: Process;
                    }>(
                      "exploit",
                      {
                        ip: computer.ip,
                        connectionId: connectionId,
                      },
                      true,
                      (process) => {
                        processStore.addProcess(process);
                        setProcess(process);
                      }
                    ).finally(() => {
                      setProcess(null);
                    });
                    processStore.removeProcess(result.data.process);
                    fetchHomepage(ip, connectionId).then(() => {
                      setTab("connection");
                    });
                  } catch (err: any) {
                    setError(new Error(err));
                    setTimeout(() => {
                      setError(null);
                    }, 3000);
                  }
                }}
                disabled={
                  !exploiter || (process !== null && process.type === "exploit")
                }
              >
                Exploit
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </BrowserLayout>
  );
}

export default Hacking;

import React, { useContext } from "react";
import Layout from "../../components/Layout";
import { Alert, ButtonGroup, Card, Col, Row } from "react-bootstrap";
import Connections from "../../components/Connections";
import { Button } from "react-bootstrap";
import { postRequestHandler } from "../../lib/submit";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GameContext from "../../contexts/game.context";

export default function Network() {
  const game = useContext(GameContext);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout fluid>
      <Row>
        <Col>
          <h3 className="border-bottom pb-3 border-success">
            ~/<Link to="/computers/">computers</Link>/network.json
          </h3>
        </Col>
      </Row>
      {location?.state?.return ? (
        <Row>
          <Col>
            <Alert
              variant="primary"
              className="bg-transparent border border-primary"
            >
              <p>Would you like to return to the previous page?</p>
              <Button
                variant="primary"
                onClick={() => {
                  navigate(location.state.return);
                }}
              >
                Return
              </Button>
            </Alert>
          </Col>
        </Row>
      ) : (
        <></>
      )}
      <Row>
        <Col lg={2}>
          <Row lg={1} className="gy-4">
            <Col>
              <Card body className="bg-transparent border border-secondary">
                <div className="d-grid gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigate("/processes");
                    }}
                  >
                    <img
                      src="/icons/hack.png"
                      className="mx-auto img-fluid w-50"
                    />
                    <br />
                    View Processes
                    <br />
                    <span className="badge bg-black">
                      {(() => {
                        let count = 0;
                        game.computers.forEach(
                          (val) => (count = count + val.process.length)
                        );
                        return count;
                      })()}{" "}
                      ACTIVE GLOBALLY
                    </span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigate("/computers/");
                    }}
                  >
                    <img
                      src="/icons/query.png"
                      className="mx-auto img-fluid w-50"
                    />
                    <br />
                    View Computers
                    <br />
                    <span className={"badge bg-black"}>
                      {game?.computers?.length || 0} OWNED
                    </span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigate("/internet/browser");
                    }}
                  >
                    <img
                      src="/icons/cash.png"
                      className="mx-auto img-fluid w-50"
                    />
                    <br />
                    Internet Browser
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col>
          <Row>
            <Col>
              <Alert
                variant="info"
                className="bg-transparent border border-danger"
              >
                <h4 className="border-bottom border-danger pb-2">
                  {game.connections.length} connected computers
                </h4>
              </Alert>
            </Col>
          </Row>
          {game.connections.length === 0 ? (
            <Alert
              variant="primary"
              className="bg-transparent border border-primary mb-4"
            >
              <u>You are not connected to any computers!</u>
            </Alert>
          ) : (
            <></>
          )}
          <Row lg={4} sm={1} className="gy-4">
            <Connections
              thumbnail
              onlyConnected={true}
              render={(game, _session, computer, connections) => {
                const connected =
                  connections &&
                  connections?.filter((that) => computer.id === that.id)
                    .length !== 0;
                return (
                  <Row>
                    <Col>
                      <div className="d-grid mt-2 gap-2">
                        <ButtonGroup>
                          <Button
                            size="sm"
                            variant="secondary"
                            href={
                              "#navigate:/computers/files/" + computer.id + "/"
                            }
                          >
                            📁
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            href={
                              "#navigate:/computers/processes/" + computer.id
                            }
                          >
                            ⚙️
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            href={
                              "#navigate:/computers/hardware/" + computer.id
                            }
                          >
                            🛠️
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            href={"#navigate:/computers/logs/" + computer.id}
                          >
                            📄
                          </Button>
                        </ButtonGroup>
                        {connected ? (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={async () => {
                              await postRequestHandler(
                                "/computers/disconnect",
                                {
                                  computerId: computer.id,
                                },
                                () => {
                                  game.load();
                                }
                              );
                            }}
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={async () => {
                              await postRequestHandler(
                                "/computers/connect",
                                {
                                  computerId: computer.id,
                                },
                                () => {
                                  game.load();
                                }
                              );
                            }}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </Col>
                  </Row>
                );
              }}
            />
          </Row>
          <Row className="mt-3">
            <Col>
              <Alert
                variant="info"
                className={"bg-transparent border border-success"}
              >
                <h4 className="border-bottom border-success pb-2">
                  {game.computers.length - game.connections.length} disconnected
                  computers
                </h4>
              </Alert>
            </Col>
          </Row>
          {game.computers.length - game.connections.length <= 0 ? (
            <Alert
              variant="primary"
              className="bg-transparent border border-primary mb-4"
            >
              <u>You have no computers to connect to!</u>
            </Alert>
          ) : (
            <></>
          )}
          <Row lg={4} sm={1} className="gy-3">
            <Connections
              thumbnail
              onlyDisconnected={true}
              render={(game, _session, computer, connections) => {
                const connected =
                  connections &&
                  connections?.filter((that) => computer.id === that.id)
                    .length !== 0;
                return (
                  <Row>
                    <Col>
                      <div className="d-grid mt-2">
                        {connected ? (
                          <Button
                            variant="danger"
                            onClick={async () => {
                              await postRequestHandler(
                                "/computers/disconnect",
                                {
                                  computerId: computer.id,
                                },
                                () => {
                                  game.load();
                                }
                              );
                            }}
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            onClick={async () => {
                              await postRequestHandler(
                                "/computers/connect",
                                {
                                  computerId: computer.id,
                                },
                                () => {
                                  game.load();
                                }
                              );
                            }}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </Col>
                  </Row>
                );
              }}
            />
          </Row>
        </Col>
      </Row>
    </Layout>
  );
}

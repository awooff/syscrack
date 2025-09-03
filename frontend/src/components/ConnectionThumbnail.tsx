import React, { ReactNode, useContext } from "react";
import { Col, Card, ListGroup, Row } from "react-bootstrap";
import { Hardware, HardwareTypes } from "backend/src/generated/client";
import GameContext, {
  ConnectedComputer,
  GameType,
} from "../contexts/game.context";
import SessionContext, { SessionType } from "../contexts/session.context";
import { Link, useNavigate } from "react-router-dom";
import { PersonalComputer } from "../contexts/game.context";

export default function ConnectionThumbnail({
  computer,
  connections,
  children,
  render,
  className,
}: {
  computer: PersonalComputer;
  connections?: ConnectedComputer[];
  className?: string;
  render?: (
    game: GameType,
    session: SessionType,
    computer: PersonalComputer,
    connections?: ConnectedComputer[]
  ) => ReactNode | ReactNode[];
  children?: ReactNode[];
}) {
  const game = useContext(GameContext);
  const session = useContext(SessionContext);
  const navigate = useNavigate();
  const connected =
    connections &&
    connections?.filter((that) => that.id === computer.id).length !== 0;
  const rendered = render ? (
    render(game, session, computer, connections)
  ) : (
    <></>
  );
  return (
    <Col>
      <Card
        body
        className={
          !className
            ? !connected
              ? "bg-transparent border border-success"
              : "bg-transparent border border-danger"
            : className
        }
      >
        <p
          style={{
            fontSize: 10,
          }}
        >
          <span className="badge bg-secondary me-2">{computer.type}</span>
          {(computer.data as any).title}
          {session.user.id === computer.userId ? (
            <>
              <span className="ms-2">✏️</span>
              {connected ? (
                <span
                  className="ms-2"
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigate("/internet/browser", {
                      state: {
                        connectionId: computer.id,
                      },
                    });
                  }}
                >
                  🌎
                </span>
              ) : (
                <></>
              )}
            </>
          ) : (
            ""
          )}
          <span
            className="badge bg-secondary"
            style={{
              float: "right",
            }}
          >
            🛠️{" "}
            {Math.floor(
              computer.hardware.reduce((prev, cur) => {
                return {
                  ...prev,
                  strength: Math.round(cur.strength + prev.strength),
                };
              }).strength /
                computer.hardware.length /
                24
            )}
          </span>
        </p>
        <Row>
          <Col>
            <Card
              body
              className="bg-transparent border border-primary text-center text-white"
            >
              {connected ? (
                <img
                  src="/icons/connect.png"
                  className="img-fluid mx-auto w-50"
                ></img>
              ) : (
                <img
                  src="/icons/disconnect.png"
                  className="img-fluid mx-auto w-50"
                ></img>
              )}
              <br />
              <hr />
              <Link
                className="text-white"
                to={connected ? "/computers/files/" + computer.id : ""}
              >
                {computer.ip}
              </Link>
              <br />
              <span
                style={{
                  fontSize: 12,
                }}
              >
                <span
                  className={
                    !computer.process || computer.process.length === 0
                      ? "text-danger"
                      : "text-success"
                  }
                >
                  <Link to={"/computers/processes/" + computer.id}>
                    {computer.process ? computer.process.length : 0} Active
                    Processes
                  </Link>
                </span>
                <br />
              </span>
              <span
                style={{
                  fontSize: 8,
                }}
              >
                {connected ? (
                  <span className="text-success">CONNECTED</span>
                ) : (
                  <span className="text-danger">DISCONNECTED</span>
                )}
              </span>
            </Card>
          </Col>
        </Row>
        <ListGroup
          className="mb-2 mt-3"
          style={{
            fontSize: 12,
          }}
        >
          {(() => {
            const hardwares = {} as Record<HardwareTypes, Hardware>;
            const counts = {} as Record<HardwareTypes, number>;

            computer.hardware.forEach((hardware) => {
              counts[hardware.type] = counts[hardware.type] || 0;
              if (hardwares[hardware.type]) {
                hardwares[hardware.type].strength += hardware.strength;
              } else hardwares[hardware.type] = hardware;

              counts[hardware.type] += 1;
            });

            return Object.values(hardwares).map((hardware, index) => {
              return (
                <ListGroup.Item key={index}>
                  <span className="badge bg-secondary me-4">
                    {counts[hardware.type]} /{" "}
                    {(computer.data as any)?.hardwareLimits?.[hardware.type] ||
                      -1}
                  </span>
                  {hardware.type}{" "}
                  <span
                    className="badge bg-dark"
                    style={{
                      float: "right",
                    }}
                  >
                    {hardware.strength}
                  </span>
                </ListGroup.Item>
              );
            });
          })()}
        </ListGroup>
        {children}
        {rendered}
      </Card>
    </Col>
  );
}

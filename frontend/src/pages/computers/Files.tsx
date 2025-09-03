import React, { useContext } from "react";
import Layout from "../../components/Layout";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import GameContext from "../../contexts/game.context";
import { Card, Col, Row, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import FileTreeComponent from "../../components/FileTreeComponent";
import { useProcessStore } from "../../lib/stores/process.store";

export default function Files() {
  const game = useContext(GameContext);
  const { computerId } = useParams();
  const navigate = useNavigate();
  const processStore = useProcessStore();
  const location = useLocation();
  const computer = game.computers.find((val) => val.id === computerId);
  const connected =
    game.connections.find((val) => val.id === computerId) !== undefined;

  //if no computer or not connected
  if (!computer)
    return (
      <Layout>
        <Row>
          <Col>
            <Card
              body
              className="bg-transparent border border-danger text-center text-white"
            >
              This computer is invalid. Have you tried connecting to it?
            </Card>
          </Col>
        </Row>
      </Layout>
    );

  //if no computer or not connected
  if (!connected)
    return (
      <Layout>
        <Row>
          <Col>
            <Card
              body
              className="bg-transparent border border-danger text-center text-white"
            >
              You are not connected to this computer!
            </Card>
          </Col>
        </Row>
      </Layout>
    );

  return (
    <Layout fluid>
      <Row>
        <Col>
          <h3 className="border-bottom pb-3 border-success">
            ~/<Link to="/computers/">computers</Link>/home/
            {computer.ip.replace(/\./g, "_")}/
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
              Would you like to return to the previous page?
              <br />
              <Button
                variant="primary"
                className="mt-2"
                onClick={() => {
                  navigate(location.state.return, {
                    state: {
                      connectionId: computer.id,
                    },
                  });
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
        <Col>
          <div className="hstack gap-2 mb-2">
            <Button
              variant="warning"
              onClick={() => {
                navigate("/computers/files/" + computer.id);
              }}
            >
              View Files
            </Button>
            <Button
              variant="info"
              onClick={() => {
                navigate("/computers/logs/" + computer.id);
              }}
            >
              View Logs
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                navigate("/computers/processes/" + computer.id);
              }}
            >
              View Processes{" "}
              <span className="badge bg-danger">
                {processStore.processes?.[computer.id]?.length || 0}
              </span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                navigate("/computers/logs/" + computer.id);
              }}
            >
              View/Modify Hardware{" "}
              <span className="badge bg-black">
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
            </Button>
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={2}>
          <Card body className="bg-transparent border border-warning">
            <div className="d-grid gap-2">
              <Button
                variant="warning"
                onClick={() => {
                  navigate("/computers/network");
                }}
              >
                <img
                  src="/icons/network.png"
                  className="mx-auto img-fluid w-50"
                ></img>
                <br />
                View Network
              </Button>
              <Button
                variant="warning"
                onClick={() => {
                  navigate("/computers/");
                }}
              >
                <img
                  src="/icons/query.png"
                  className="mx-auto img-fluid w-50"
                ></img>
                <br />
                View Computers
              </Button>
              <Button
                variant="warning"
                onClick={() => {
                  navigate("/internet/browser", {
                    state: {
                      connectionId: computer.id,
                    },
                  });
                }}
              >
                <img src="/icons/cash.png" className="mx-auto img-fluid w-50" />
                <br />
                Internet Browser
              </Button>
            </div>
          </Card>
        </Col>
        <Col>
          <div className="d-grid border border-warning p-2">
            <FileTreeComponent
              connectionId={computer.id}
              ip={computer.ip}
              computerId={computer.id}
              local={true}
              uploadTargetIp={location?.state?.uploadTargetIp}
              onCreation={(process) => {
                processStore.addProcess(process);
              }}
              onCompletion={(process) => {
                processStore.removeProcess(process);
              }}
            ></FileTreeComponent>
          </div>
        </Col>
      </Row>
    </Layout>
  );
}

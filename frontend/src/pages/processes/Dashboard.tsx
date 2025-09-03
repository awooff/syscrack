import { Button, Card, Col, Row, Stack } from "react-bootstrap";
import Layout from "../../components/Layout";
import { useProcessStore } from "../../lib/stores/process.store";
import { useContext } from "react";
import GameContext from "../../contexts/game.context";
import ProcessListComponent from "../../components/ProcessesComponent";
import { useNavigate } from "react-router-dom";
import SessionContext from "../../contexts/session.context";

function Dashboard() {
  const processStore = useProcessStore();
  const game = useContext(GameContext);
  const session = useContext(SessionContext);
  const navigate = useNavigate();

  return (
    <Layout fluid>
      <Row>
        <Col>
          <h3 className="border-bottom pb-3 border-success">~/processes/</h3>
        </Col>
      </Row>
      <Row>
        <Col lg={2}>
          <Row lg={1} className="gy-4">
            <Col>
              <Card body className="bg-transparent border border-secondary">
                <div className="d-grid gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigate("/computers/network");
                    }}
                  >
                    <img
                      src="/icons/network.png"
                      className="mx-auto img-fluid w-50"
                    />
                    <br />
                    View Network
                    <br />
                    <span
                      className={
                        "badge " +
                        (game?.connections?.length !== 0
                          ? "bg-success"
                          : "bg-secondary")
                      }
                    >
                      {game?.connections?.length || 0} ACTIVE CONNECTIONS
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
                    <span className="badge bg-black">
                      {game.computers.length} OWNED
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
                    <br />
                    <span className="badge bg-black">
                      {Object.values(session.data.logins).length || 0} ACTIVE
                      LOGINS
                    </span>
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col>
          <Row className="text-center">
            <Col>
              <Card body>
                <p className="display-5 mt-2">
                  {(() => {
                    let count = 0;
                    Object.values(processStore.processes).forEach(
                      (val) => (count += val.length)
                    );
                    return <span>{count}</span>;
                  })()}{" "}
                </p>
                <span className="badge bg-success">Total Processes</span>
              </Card>
            </Col>
            <Col>
              <Card body>
                <p className="display-5 mt-2">{game.computers.length}</p>
                <span className="badge bg-success">Computers</span>
              </Card>
            </Col>
          </Row>
          <Stack gap={3} className="mt-3">
            {game.connections.map((computer) => (
              <>
                <Row>
                  <Col>
                    <p className="pb-3 border-bottom border-success display-5">
                      {computer.ip}
                    </p>
                    <ProcessListComponent computer={computer} />
                  </Col>
                </Row>
              </>
            ))}
          </Stack>
        </Col>
      </Row>
    </Layout>
  );
}

export default Dashboard;

import React, { useContext } from "react";
import Layout from "../components/Layout";
import { Card, Carousel, Col, Row } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import GameContext from "../contexts/game.context";

export default function Game() {
  const navigate = useNavigate();
  const game = useContext(GameContext);

  return (
    <Layout>
      <Row>
        <Col>
          <Carousel>
            <Carousel.Item
              style={{
                maxHeight: 400,
              }}
            >
              <img
                className="d-block w-full mx-auto"
                src="https://placecats.com/900/600"
                alt="First slide"
              />
              <Carousel.Caption
                style={{
                  backgroundColor: "black",
                }}
              >
                <h3>You own {game.computers?.length || 0} computers</h3>
                <a href="#navigate:/computers">View Your Computers</a>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item
              style={{
                maxHeight: 400,
              }}
            >
              <img
                className="d-block w-full mx-auto"
                src="https://placecats.com/900/500"
                alt="First slide"
              />
              <Carousel.Caption
                style={{
                  backgroundColor: "black",
                }}
              >
                <h3>
                  {(() => {
                    let count = 0;
                    game.computers.forEach(
                      (val) => (count = count + val.process.length)
                    );
                    return count;
                  })()}{" "}
                  Active Processes
                </h3>
                <a href="#navigate:/computers/processes">View Your Processes</a>
              </Carousel.Caption>
            </Carousel.Item>
          </Carousel>
        </Col>
      </Row>
      <Row lg={3} sm={1} className="gy-4">
        <Col>
          <Card>
            <Card.Img src="https://placecats.com/millie/800/600" />
            <Card.Body className="text-center">
              Browse The Internet
              <div className="d-grid mt-4">
                <Button
                  variant="success"
                  onClick={() => {
                    navigate("/internet/browser");
                  }}
                >
                  View Browser
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Img src="https://placecats.com/neo_2/800/600" />
            <Card.Body className="text-center">
              View Your Computer
              <div className="d-grid mt-4">
                <Button
                  variant="success"
                  onClick={() => {
                    navigate("/computers/");
                  }}
                >
                  View Computers
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Img src="https://placecats.com/bella/800/600" />
            <Card.Body className="text-center">
              View Your Finances
              <div className="d-grid mt-4">
                <Button
                  variant="success"
                  onClick={() => {
                    navigate("/browser");
                  }}
                >
                  Finances
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
}

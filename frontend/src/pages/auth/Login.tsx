import React, { useCallback, useContext, useState } from "react";
import Layout from "../../components/Layout";
import { Card, Col, Form, Row, Button, Alert } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { postRequestHandler } from "../../lib/submit";
import SessionContext from "../../contexts/session.context";
import GameContext from "../../contexts/game.context";

type Inputs = {
  username: string;
  password: string;
};

export default function Login() {
  const session = useContext(SessionContext);
  const game = useContext(GameContext);
  const { register, handleSubmit } = useForm<Inputs>();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<Error | null>(null);

  const onSubmit: SubmitHandler<Inputs> = useCallback(
    async (inputs) => {
      await postRequestHandler<{
        token: string;
      }>(
        "/auth/login",
        inputs,
        async (result) => {
          localStorage.setItem("jwt", result.data.token);

          await session.load();
          await game.load();

          if (location?.state.return) navigate(location.state.return);
          else navigate("/game");
        },
        setError
      );
    },
    [location]
  );

  return (
    <Layout>
      <Row>
        <Col>
          <Card body>
            <Card.Title>Login To Syscrack</Card.Title>
            <Card.Text>Please enter login information below!</Card.Text>
          </Card>
        </Col>
      </Row>
      {location?.state?.message ? (
        <Row>
          <Col>
            <Alert variant="primary">{location.state.message}</Alert>
          </Col>
        </Row>
      ) : null}
      {error !== null ? (
        <Row>
          <Col>
            <Alert variant="danger">
              {error
                ? (error as Error).message
                : "Failed to login.  Please try again later!"}
            </Alert>
          </Col>
        </Row>
      ) : null}
      <Row>
        <Col>
          <Card body>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Username"
                  {...register("username", {
                    required: true,
                  })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  {...register("password", {
                    required: true,
                  })}
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Login
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
}

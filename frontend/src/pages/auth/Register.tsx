import React, { useContext, useState } from "react";
import Layout from "../../components/Layout";
import { Card, Col, Form, Row, Button, Alert } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { postRequestHandler } from "../../lib/submit";
import SessionContext from "../../contexts/session.context";

type Inputs = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  betakey: string;
};

export default function Register() {
  const session = useContext(SessionContext);
  const { register, handleSubmit } = useForm<Inputs>();
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);
  const onSubmit: SubmitHandler<Inputs> = async (inputs) => {
    if (inputs.password !== inputs.confirmPassword) {
      setError(
        new Error("your password does not match your confirmed password")
      );
      return;
    }

    await postRequestHandler(
      "/auth/register",
      inputs,
      () => {
        navigate("/login", {
          state: {
            message: "Account creation successful!  You can now login.",
          },
        });
      },
      setError
    );
  };

  return (
    <Layout>
      <Row>
        <Col>
          <Card body>
            <Card.Title>Register An Account On Syscrack</Card.Title>
            <Card.Text>You will require a betakey</Card.Text>
          </Card>
        </Col>
      </Row>
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
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter Email"
                  {...register("email", {
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
              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm Password"
                  {...register("confirmPassword", {
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

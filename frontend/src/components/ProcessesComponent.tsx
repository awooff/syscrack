import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Col,
  Row,
  Button,
  Alert,
  Stack,
  ProgressBar,
} from "react-bootstrap";
import { postRequestHandler } from "../lib/submit";
import { Process, Prisma } from "backend/src/generated/client";
import { useProcessStore } from "../lib/stores/process.store";
import WebEvents from "../lib/events";
import { ReturnType } from "backend/dist/routes/computers/processes";

type Computer = Prisma.ComputerGetPayload<{
  include: { hardware: true; software: true; process: true };
}>;

function ProcessListComponent({
  computer,
  connectionId,
}: {
  computer: any;
  connectionId?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [time, setTime] = useState(Date.now());
  const [pageMax, setPageMax] = useState(0);
  const [loading, setLoading] = useState(false);
  const interval = useRef<number | any>();
  const processStore = useProcessStore();

  const fetchProcesses = useCallback(async () => {
    if (!computer.id) return;
    let result = await postRequestHandler<ReturnType>("/computers/processes", {
      computerId: computer.id,
      page: page,
    });

    return result.data;
  }, [computer]);

  useEffect(() => {
    interval.current = setInterval(() => {
      setTime(Date.now());
    }, 100);

    return () => {
      clearInterval(interval.current);
    };
  }, []);

  useEffect(() => {
    if (!computer.id) return;

    setLoading(true);
    fetchProcesses().then((result) => {
      processStore.setProcesses(
        result?.processes || processStore.processes[computer.id]
      );
      setCount(result?.processes.length || 0);
      setPageMax(result?.pageMax || 0);
      setLoading(false);
    });
  }, [computer]);

  return (
    <Row>
      <Col>
        <div className="d-grid border border-primary p-4">
          {loading &&
          ((processStore.processes?.[computer.id] &&
            processStore.processes[computer.id].length === 0) ||
            computer?.process?.length) === 0 ? (
            <Alert
              variant="danger"
              className="text-center bg-transparent border-secondary border mt-0 mb-0 rounded-0"
            >
              <Row className="justify-content-center mb-4">
                <Col lg={3}>
                  <img src="/icons/info.png" className="mx-auto img-fluid" />
                </Col>
              </Row>
              <p className="display-2">LOADING</p>
              <p>Please wait for your proceses to be loaded...</p>
            </Alert>
          ) : (
            <>
              {processStore.processes?.[computer.id] &&
              processStore.processes[computer.id].length !== 0 ? (
                <Stack gap={4}>
                  {processStore.processes[computer.id].map((process, index) => {
                    return (
                      <Row key={index}>
                        <Col>
                          <Card
                            body
                            className="bg-transparent border border-secondary"
                          >
                            <Row>
                              <Col lg={2}>
                                {(() => {
                                  switch (process.type) {
                                    case "hack":
                                      return (
                                        <img
                                          src="/icons/hack.png"
                                          className="img-fluid mx-auto"
                                        ></img>
                                      );
                                    default:
                                      return (
                                        <img
                                          src="/icons/message.png"
                                          className="img-fluid mx-auto"
                                        ></img>
                                      );
                                  }
                                })()}
                              </Col>
                              <Col>
                                <div className="d-grid">
                                  <h5 className="pb-2 border-bottom border-secondary">
                                    {process.type}@{process.ip}{" "}
                                    {process.type === "action" ? (
                                      <span className="badge bg-primary ms-2">
                                        {(process.data as any).action}
                                      </span>
                                    ) : (
                                      <></>
                                    )}
                                  </h5>
                                </div>
                                <Row className="mt-3">
                                  <Col>
                                    <div className="d-grid">
                                      <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={async (e) => {
                                          const target = e.currentTarget;
                                          target.setAttribute(
                                            "disabled",
                                            "true"
                                          );
                                          let result =
                                            await postRequestHandler<{
                                              process: Process;
                                            }>("/processes/cancel", {
                                              connectionId:
                                                connectionId || computer.id,
                                              processId: process.id,
                                            }).finally(() => {
                                              target.setAttribute(
                                                "disabled",
                                                "false"
                                              );
                                            });
                                          processStore.removeProcess(
                                            result.data.process
                                          );
                                        }}
                                        className="bg-transparent border-danger"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </Col>
                                  <Col>
                                    <div className="d-grid">
                                      <Button
                                        variant="success"
                                        size="sm"
                                        disabled={
                                          time <
                                          new Date(process.completion).getTime()
                                        }
                                        onClick={async (e) => {
                                          const target = e.currentTarget;
                                          target.setAttribute(
                                            "disabled",
                                            "true"
                                          );
                                          let result =
                                            await postRequestHandler<{
                                              process: Process;
                                            }>("/processes/complete", {
                                              connectionId:
                                                connectionId || computer.id,
                                              processId: process.id,
                                            }).finally(() => {
                                              target.setAttribute(
                                                "disabled",
                                                "false"
                                              );
                                            });
                                          WebEvents.emit(
                                            "processCompleted",
                                            result.data.process
                                          );
                                          processStore.removeProcess(
                                            result.data.process
                                          );
                                        }}
                                        className="bg-transparent border-success"
                                      >
                                        Complete
                                      </Button>
                                    </div>
                                  </Col>
                                </Row>
                                <Row className="mt-4">
                                  <Col>
                                    <ProgressBar
                                      variant={
                                        time >
                                        new Date(process.completion).getTime()
                                          ? "success"
                                          : "danger"
                                      }
                                      label={
                                        time >
                                        new Date(process.completion).getTime()
                                          ? "COMPLETE"
                                          : (
                                              (new Date(
                                                process.completion
                                              ).getTime() -
                                                time) /
                                              1000
                                            ).toFixed(2) + " seconds"
                                      }
                                      now={
                                        ((time -
                                          new Date(process.started).getTime()) /
                                          (new Date(
                                            process.completion
                                          ).getTime() -
                                            new Date(
                                              process.started
                                            ).getTime())) *
                                        100
                                      }
                                    />
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                          </Card>
                        </Col>
                      </Row>
                    );
                  })}
                </Stack>
              ) : (
                <Alert
                  variant="danger"
                  className="text-center bg-transparent border border-danger mb-0"
                >
                  <img src="/icons/hack.png"></img>
                  <p>No Processes Available</p>
                </Alert>
              )}
            </>
          )}
        </div>
      </Col>
    </Row>
  );
}

export default ProcessListComponent;

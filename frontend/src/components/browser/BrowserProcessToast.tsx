import { Alert, Row, Col, ProgressBar } from "react-bootstrap";
import { Process } from "backend/src/generated/client";
import { useEffect, useRef, useState } from "react";

function BrowserProcessToast({
  process,
  marginTop = 42,
}: {
  process: Process | null;
  marginTop?: number;
}) {
  const [time, setTime] = useState(Date.now());
  const interval = useRef<number | any>();

  useEffect(() => {
    interval.current = setInterval(() => {
      setTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval.current);
    };
  }, []);

  if (
    !process ||
    Math.round((new Date(process.completion).getTime() - time) / 1000) < 0
  )
    return <></>;

  return (
    <Alert
      variant="primary"
      className="border-primary border ms-2"
      style={{
        position: "absolute",
        width: 425,
        backgroundColor: "rgba(0,0,0,0.9)",
        pointerEvents: "none",
        touchAction: "none",
        zIndex: 2,
        marginTop,
      }}
    >
      <Row className="pe-3">
        <Col className="display-3 mb-2 text-center" lg={3}>
          ⚙️
        </Col>
        <Col>
          <Row>
            <Col className="pt-2">
              <h6 className="pt-2">
                Executing {process.type}{" "}
                {(process.data as any).action
                  ? `(${(process.data as any).action})`
                  : ""}
              </h6>
            </Col>
          </Row>
          <Row>
            <Col>
              <ProgressBar
                variant={
                  time > new Date(process.completion).getTime()
                    ? "success"
                    : "danger"
                }
                label={
                  time > new Date(process.completion).getTime()
                    ? "COMPLETE"
                    : (
                        (new Date(process.completion).getTime() - time) /
                        1000
                      ).toFixed(2) + " seconds"
                }
                now={
                  ((time - new Date(process.started).getTime()) /
                    (new Date(process.completion).getTime() -
                      new Date(process.started).getTime())) *
                  100
                }
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Alert>
  );
}

export default BrowserProcessToast;

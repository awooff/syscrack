import { Card, Spinner, Alert, Container, Row, Col } from "react-bootstrap";

export function LoadingFallback() {
  return (
    <div className="d-flex justify-content-center my-5">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}

export const ErrorBoundary: React.FC<{error?: unknown}> = ({ error }) => {
  return (
    <Container className="my-4">
      <Alert variant="danger">
        <Alert.Heading>Oh snap! Something went wrong here :(</Alert.Heading>
        <p>{error instanceof Error && error.message}</p>
      </Alert>
    </Container>
  );
}

export function TradeList({ trades }: { trades: any[] }) {
  return (
    <Container className="my-4">
      <Row xs={1} md={2} lg={3} className="g-4">
        {trades.map((trade) => (
          <Col key={trade.id}>
            <Card>
              <Card.Img
                variant="top"
                src={trade.imageUrl || "https://placecat.net/300"}
              />
              <Card.Body>
                <Card.Title>{trade.name}</Card.Title>
                <Card.Text>{trade.description}</Card.Text>
                <Card.Text className="fw-bold">£{trade.price}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}



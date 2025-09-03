import { Button, Card, Modal, Row, Col, Table } from "react-bootstrap";

function CollectionReportModal({
  show,
  onHide,
  data,
}: {
  show: boolean;
  onHide: () => void;
  data: object | null;
}) {
  return (
    <Modal show={show} onHide={onHide} centered size="xl">
      <Modal.Header closeButton>
        <Modal.Title>💸 Collection Report</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col lg={5}>
            <Card className="bg-black border border-success">
              <Card.Img variant="top" src="/nav_icons/address_book.jpg" />
              <Card.Body className="border-top border-success text-center">
                <Card.Title className="display-5">$0</Card.Title>
                <Card.Text>
                  Available In Account
                  <br />
                  <span className="badge bg-black rounded-0">
                    0000-0000-0000-0000
                  </span>
                </Card.Text>
                <div className="d-grid gap-2">
                  <Button
                    variant="info"
                    className="btn-outline-info bg-transparent"
                  >
                    View Bank Account
                  </Button>
                  <Button
                    variant="danger"
                    className="btn-outline-danger bg-transparent"
                  >
                    Clear Logs
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th></th>
                  <th>Computer</th>
                  <th>Level</th>
                  <th>Output</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🤢</td>
                  <td>90.28.20.24</td>
                  <td>1.0</td>
                  <td>5000 emails</td>
                  <td className="text-success">$500</td>
                </tr>
                <tr>
                  <td>💿</td>
                  <td>90.28.20.24</td>
                  <td>1.0</td>
                  <td>12.6gb</td>
                  <td className="text-success">$126</td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

export default CollectionReportModal;

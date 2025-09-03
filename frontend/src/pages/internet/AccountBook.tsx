import { useCallback, useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { Row, Col, Card } from "react-bootstrap";
import { postRequestHandler } from "../../lib/submit";

function AccountBook() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [pages, setPages] = useState(0);

  const fetchAddressBook = useCallback(() => {
    setLoading(true);
    postRequestHandler<{
      page: number;
      count: number;
      addresses: object[];
      pages: number;
    }>(
      "/internet/accountbook",
      {
        page: page,
      },
      (result) => {
        setPages(result.data.pages);
        setCount(result.data.count);
      }
    );
  }, []);

  useEffect(() => {
    fetchAddressBook();
  }, []);

  return (
    <Layout fluid>
      <Row>
        <Col>
          <h3 className="border-bottom pb-3 border-success">
            ~/archives/accounts
          </h3>
        </Col>
      </Row>
      <Row>
        <Row>
          <Col lg={2}>
            <Row className="row-cols-1 gap-2">
              <Col>
                <Card
                  body
                  className="text-center bg-transparent border-secondary border"
                >
                  <p className="display-4">{count}</p>
                  <p>Accounts Accessed</p>
                </Card>
              </Col>
            </Row>
          </Col>
          <Col>
            <Row className="row-cols-1 gy-2"></Row>
          </Col>
        </Row>
      </Row>
    </Layout>
  );
}

export default AccountBook;

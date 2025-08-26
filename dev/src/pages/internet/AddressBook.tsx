import { useCallback, useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { Row, Col, Card } from "react-bootstrap";
import { postRequestHandler } from "../../lib/submit";
import { Prisma } from "backend/src/generated/client";

type AddressBookRow = Prisma.AddressBookGetPayload<{
  include: {
    computer: true;
  };
}>;

function AddressBook() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [pages, setPages] = useState(0);
  const [addresses, setAddresses] = useState<AddressBookRow[]>([]);

  const fetchAddressBook = useCallback(() => {
    setLoading(true);
    postRequestHandler<{
      page: number;
      count: number;
      addresses: AddressBookRow[];
      pages: number;
    }>(
      "/internet/addressbook",
      {
        page: page,
      },
      (result) => {
        setPages(result.data.pages);
        setCount(result.data.count);
        setAddresses(result.data.addresses);
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
            ~/archives/computers
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
                  <p>Computers Backdoored</p>
                </Card>
              </Col>
              <Col>
                <Card
                  body
                  className="text-center bg-transparent border-secondary border"
                >
                  <p className="display-4">{count}</p>
                  <p>Viruses Installed</p>
                </Card>
              </Col>
            </Row>
          </Col>
          <Col>
            <Row className="row-cols-1 gy-2">
              {addresses.map((address) => {
                if (!address.computer) return <></>;

                return (
                  <Col>
                    <Card body className="bg-transparent border border-primary">
                      <Row>
                        <Col>
                          <h4 className="border-bottom border-primary pb-2">
                            {(address.computer.data as any).title}{" "}
                            <u className="border-start ps-2 border-primary">
                              {address.computer.ip}
                            </u>{" "}
                            <span
                              className="badge bg-secondary rounded-0"
                              style={{
                                float: "right",
                              }}
                            >
                              {address.computer?.type}
                            </span>
                          </h4>
                          <Row>
                            <Col>
                              {(address as any).viruses ? (
                                <Card
                                  body
                                  className="rounded-0 border-secondary text-center"
                                >
                                  <h4>Spammer</h4>
                                  <p>
                                    <span className="badge bg-danger rounded-0">
                                      {(address as any).viruses
                                        .filter((v) => v.type === "spammer")
                                        .pop()?.level || "0.0"}
                                    </span>
                                  </p>
                                </Card>
                              ) : (
                                <Card
                                  body
                                  className="rounded-0 border-secondary text-center"
                                >
                                  <h4>Spammer</h4>
                                  <p>
                                    <span className="badge bg-danger rounded-0">
                                      Not Installed
                                    </span>
                                  </p>
                                </Card>
                              )}
                            </Col>
                            <Col>
                              <Card
                                body
                                className="rounded-0 border-secondary text-center"
                              >
                                <h4 className="text-secondary">Warez</h4>
                                <p>
                                  <span className="badge bg-danger rounded-0">
                                    Not Installed
                                  </span>
                                </p>
                              </Card>
                            </Col>
                            <Col>
                              <Card
                                body
                                className="rounded-0 border-secondary text-center"
                              >
                                <h4 className="text-secondary">DDoS</h4>
                                <p>
                                  <span className="badge bg-danger rounded-0">
                                    Not Installed
                                  </span>
                                </p>
                              </Card>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Col>
        </Row>
      </Row>
    </Layout>
  );
}

export default AddressBook;

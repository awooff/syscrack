import { useCallback, useContext, useRef, useState } from "react";
import { Computer } from "backend/src/generated/client";
import {
  Alert,
  Button,
  Card,
  Form,
  InputGroup,
  Row,
  Container,
  Col,
  Stack,
} from "react-bootstrap";
import { DNS } from "backend/src/generated/client";
import { postRequestHandler } from "../../../lib/submit";
import toast from "react-hot-toast";
import BrowserLayout from "../BrowserLayout";

function SearchEngine({
  connectionId,
  ip,
  computer,
  markdown,
  valid,
  access,
  setCurrentIp,
  setTab,
}: {
  connectionId: string;
  ip: string;
  computer: Computer;
  markdown: string;
  valid: boolean;
  access: object | null;
  setCurrentIp: (tab: string) => void;
  setTab: (tab: string) => void;
}) {
  const searchQuery = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<DNS[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);

  const fetchResults = useCallback((query: string, page = 0) => {
    return postRequestHandler<{
      results: DNS[];
      count: number;
      pages: number;
    }>("/internet/search", {
      domain: query,
      page,
    }).then((result) => {
      setResults(result.data.results);
      setCount(result.data.count);
    });
  }, []);

  return (
    <BrowserLayout
      setTab={setTab}
      variant="success"
      computer={computer}
      access={access}
      connectionId={connectionId}
    >
      {results.length === 0 ? (
        <Card body className="bg-white">
          <Row>
            <Col>
              <div className="d-grid">
                <iframe
                  srcDoc={markdown}
                  className="mx-auto"
                  seamless
                  width="720px"
                  scrolling="no"
                  height="400px"
                ></iframe>
              </div>
              <Row className="mt-4 justify-content-center">
                <Col lg={4}>
                  <Alert variant="primary" className="text-center">
                    Search for things on the internet!
                  </Alert>
                  <InputGroup className="border">
                    <InputGroup.Text>🔍</InputGroup.Text>
                    <Form.Control
                      type="text"
                      className="rounded-0"
                      placeholder={"Enter anything..."}
                      ref={searchQuery}
                      name="addressbar"
                      onKeyUp={(e) => {
                        if (e.key === "Enter" && searchQuery.current?.value) {
                          let promise = fetchResults(
                            searchQuery.current.value,
                            page
                          );
                          toast.promise(promise, {
                            loading: "Fetching search results",
                            error: "Failed to fetch search results",
                            success: "Success!",
                          });
                        }
                      }}
                      aria-label="Input group example"
                      aria-describedby="btnGroupAddon"
                    />
                    <Button
                      onClick={() => {
                        if (!searchQuery.current?.value) return;

                        let promise = fetchResults(
                          searchQuery.current?.value,
                          page
                        );
                        toast.promise(promise, {
                          loading: "Fetching search results",
                          error: "Failed to fetch search results",
                          success: "Success!",
                        });
                      }}
                      size="sm"
                      variant="success"
                    >
                      Search
                    </Button>
                  </InputGroup>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      ) : (
        <Card body className="bg-white">
          <Container>
            <Row>
              <Col className="text-black">
                <p className="display-4 mt-2">
                  {(computer.data as any as any).title}
                </p>
              </Col>
              <Col>
                <Row className="mt-4 justify-content-center">
                  <Col>
                    <InputGroup className="border">
                      <InputGroup.Text>🔍</InputGroup.Text>
                      <Form.Control
                        type="text"
                        className="rounded-0"
                        placeholder={"Enter anything..."}
                        ref={searchQuery}
                        name="addressbar"
                        onKeyUp={(e) => {
                          if (e.key === "Enter" && searchQuery.current?.value) {
                            let promise = fetchResults(
                              searchQuery.current.value,
                              page
                            );
                            toast.promise(promise, {
                              loading: "Fetching search results",
                              error: "Failed to fetch search results",
                              success: "Success!",
                            });
                          }
                        }}
                        aria-label="Input group example"
                        aria-describedby="btnGroupAddon"
                      />
                      <Button
                        onClick={() => {
                          if (!searchQuery.current?.value) return;

                          let promise = fetchResults(
                            searchQuery.current?.value,
                            page
                          );
                          toast.promise(promise, {
                            loading: "Fetching search results",
                            error: "Failed to fetch search results",
                            success: "Success!",
                          });
                        }}
                        size="sm"
                        variant="success"
                      >
                        Search
                      </Button>
                    </InputGroup>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Stack gap={1} className="pt-4 border-top ">
              <p>
                Displaying {results.length} results out of {count}
              </p>
              {results.map((result, index) => {
                return (
                  <Row key={index}>
                    <Col>
                      <div
                        className={"d-grid p-2"}
                        style={{
                          backgroundColor: index % 2 === 0 ? "whitesmoke" : "",
                        }}
                      >
                        <a
                          className="display-5 text-primary border-bottom border-primarys"
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setCurrentIp(result.website);
                          }}
                        >
                          {result.website}{" "}
                        </a>
                        <p className="mt-2">{result.description}</p>
                        <p>
                          {result.tags && result.tags.length !== 0
                            ? result.tags
                                .split(",")
                                .map((tag) => (
                                  <span className="badge bg-secondary me-2">
                                    {tag}
                                  </span>
                                ))
                            : "no tags"}
                        </p>
                      </div>
                    </Col>
                  </Row>
                );
              })}
              <p>
                End of {results.length} results out of {count}
              </p>
            </Stack>
          </Container>
        </Card>
      )}
    </BrowserLayout>
  );
}

export default SearchEngine;

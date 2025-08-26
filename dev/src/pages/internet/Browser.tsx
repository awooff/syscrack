import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Layout from "../../components/Layout";
import {
  Button,
  ButtonToolbar,
  Alert,
  Col,
  Container,
  Form,
  InputGroup,
  Nav,
  NavDropdown,
  Navbar,
  Row,
  Card,
} from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Computer } from "backend/src/generated/client";
import GameContext from "../../contexts/game.context";
import { postRequestHandler } from "../../lib/submit";
import toast from "react-hot-toast";
import { useBrowserStore } from "../../lib/stores/brower.store";

// Tabs
import Homepage from "../../components/browser/tabs/Homepage";
import SearchEngine from "../../components/browser/tabs/SearchEngine";
import Hacking from "../../components/browser/tabs/Hacking";
import Connection from "../../components/browser/tabs/Connection";
import SessionContext from "../../contexts/session.context";
import Logs from "../../components/browser/tabs/Logs";
import Files from "../../components/browser/tabs/Files";

export type HomepageRequest = {
  computer: Computer;
  markdown: string;
  title: string;
  access?: object;
};

export default function Browser() {
  const game = useContext(GameContext);
  const session = useContext(SessionContext);
  const { ip: target } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const browserStore = useBrowserStore();
  const [computer, setComputer] = useState<Computer | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentIp, setCurrentIp] = useState<string | null>("0.0.0.0");
  const [access, setAccess] = useState<object | null>(null);
  const currentAddress = useRef<HTMLInputElement>(null);
  const searchBar = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState("homepage");
  const [browserSession, setBrowserSession] = useState<
    Record<string, string[]>
  >({});

  const fetchComputer = useCallback(
    async (ip: string) => {
      if (!browserStore.connectionId || ip === "0.0.0.0") return;

      setLoading(true);
      setValid(false);

      let data = await fetchHomepage(ip, browserStore.connectionId);
      if (!data) setValid(false);
      else {
        let tab =
          browserStore.history?.[browserStore.connectionId]?.[0]?.tab ||
          "homepage";

        setAccess(data.access || null);
        setTab(tab || "homepage");
        setComputer(data.computer);
        setMarkdown(data.markdown);
        setBrowserSession((prev) => {
          if (!browserStore.connectionId) return prev;

          if (!prev[browserStore.connectionId])
            prev[browserStore.connectionId] = [];
          if (!prev[browserStore.connectionId].includes(ip))
            prev[browserStore.connectionId].push(ip);

          return prev;
        });

        browserStore.addHistory(
          browserStore.connectionId,
          tab,
          data.computer,
          ip.startsWith("www") ? ip : undefined
        );

        if (currentAddress.current && currentAddress?.current?.value !== ip)
          currentAddress.current.value = ip;

        setValid(true);

        return data;
      }
    },
    [browserStore.connectionId]
  );

  const fetchHomepage = useCallback(
    async (ip: string, connectionId: string) => {
      let query = ip.trim();
      let isDomain = false;
      if (
        query.startsWith("www.") ||
        query.endsWith(".com") ||
        query.endsWith(".net") ||
        query.endsWith(".co.uk") ||
        query.endsWith(".gov")
      )
        isDomain = true;

      const result = await postRequestHandler<HomepageRequest>(
        "/internet/homepage",
        {
          domain: isDomain ? query : undefined,
          ip: !isDomain ? query : undefined,
          connectionId,
        },
        undefined
      );

      return result.data;
    },
    []
  );

  useEffect(() => {
    if (!location.state) return;
    if (
      location.state.connectionId &&
      browserStore.connectionId !== location.state.connectionId
    )
      browserStore.setConnectionId(location.state.connectionId);
  }, [location]);

  useEffect(() => {
    if (!target) return;
    if (!currentIp) return;

    if (currentIp === "0.0.0.0" && currentIp !== target) {
      setValid(false);
      setCurrentIp(target);
    }
  }, [target, currentIp]);

  useEffect(() => {
    if (!browserStore.connectionId) return;

    if (
      !currentIp ||
      (currentIp === "0.0.0.0" &&
        browserStore.history?.[browserStore.connectionId] &&
        currentIp !==
          browserStore.history?.[browserStore.connectionId]?.[0]?.ip)
    ) {
      setCurrentIp(
        browserStore.history?.[browserStore.connectionId]?.[0]?.domain ||
          browserStore.history?.[browserStore.connectionId]?.[0]?.ip
      );
      setTab(
        browserStore.history?.[browserStore.connectionId]?.[0]?.tab ||
          "homepage"
      );
      return;
    }

    if (currentIp)
      toast.promise(
        fetchComputer(currentIp).finally(() => {
          setLoading(false);
        }),
        {
          loading: 'Fetching "' + currentIp + '"',
          success: 'Success fetching "' + currentIp + '"',
          error: 'Failure fetching "' + currentIp + '"',
        }
      );
  }, [currentIp, browserStore.connectionId]);

  return (
    <Layout fluid={true} gap={0}>
      <Row>
        <Col>
          <div className="hstack">
            {game.connections.map((connection, index) => (
              <div
                className="hstack"
                style={{
                  cursor: "pointer",
                }}
                onClick={() => {
                  browserStore.setConnectionId(connection.id);
                  setCurrentIp("0.0.0.0");
                  setValid(false);
                }}
              >
                <img
                  width="36px"
                  src="/icons/connect.png"
                  className={
                    (browserStore.connectionId === connection.id
                      ? "bg-success"
                      : "bg-dark") + " mx-auto p-2 img-fluid"
                  }
                />
                <div className="d-grid" key={index}>
                  <Card
                    style={{
                      fontSize: 8,
                    }}
                    className={
                      (browserStore.connectionId === connection.id
                        ? "bg-success"
                        : "") + " rounded-0 text-white"
                    }
                  >
                    <Card.Body className="p-1 me-5">
                      <span className={"me-2 badge rounded-0 bg-transparent"}>
                        #{index}
                      </span>
                      <b className="border-bottom border-white me-2">
                        {connection.ip}{" "}
                      </b>{" "}
                      <span className={"badge rounded-0 bg-black"}>
                        {(connection.data as any)?.title}
                      </span>
                      {browserStore?.history?.[connection.id] &&
                      browserStore.history[connection.id].length !== 0 ? (
                        <>
                          <br />
                          <span
                            className={
                              "mt-1 badge rounded-0 " +
                              (browserStore.connectionId === connection.id
                                ? "bg-transparent"
                                : "bg-transparent")
                            }
                          >
                            📄 On tab{" "}
                            {browserStore.history?.[connection.id][0].tab} @{" "}
                            {browserStore.history?.[connection.id][0].domain ||
                              browserStore.history?.[connection.id][0].ip}
                          </span>
                        </>
                      ) : (
                        <></>
                      )}
                    </Card.Body>
                  </Card>
                  <div
                    style={{
                      position: "absolute",
                      marginTop: "-34px",
                      fontSize: "0.7rem",
                    }}
                  >
                    {session.data.logins?.[connection.id]?.map((connection) => (
                      <>
                        <br />
                        <span
                          className={
                            "mt-1 badge bg-warning text-black rounded-0 "
                          }
                        >
                          ✅ Active Connection @{" "}
                          <a
                            className="text-black"
                            href={
                              "#navigate:/internet/browser/" + connection.ip
                            }
                          >
                            <u>{connection.ip}</u>
                          </a>
                        </span>
                      </>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <Navbar bg="dark" data-bs-theme="dark">
            <Container fluid className="p-0">
              <Nav className="me-auto mx-auto">
                <NavDropdown title={"📖 HISTORY"}>
                  {browserStore.connectionId ? (
                    browserSession?.[browserStore.connectionId]?.map(
                      (session, index) => (
                        <NavDropdown.Item
                          key={index}
                          onClick={() => {
                            if (currentIp !== session) {
                              setCurrentIp(session);
                              setValid(false);
                            }
                          }}
                        >
                          <span className="badge bg-secondary me-2">
                            {index}
                          </span>
                          {session}
                        </NavDropdown.Item>
                      )
                    )
                  ) : (
                    <></>
                  )}
                </NavDropdown>
              </Nav>
              <Nav className="me-auto w-75 mx-auto">
                <InputGroup size="sm">
                  <InputGroup.Text id="btnGroupAddon" className="rounded-0">
                    🌎
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    className="rounded-0"
                    placeholder={computer?.ip || ""}
                    name="addressbar"
                    onKeyUp={(e) => {
                      if (e.key === "Enter" && currentAddress.current) {
                        if (
                          currentAddress.current.value.trim() ===
                          currentIp?.trim()
                        )
                          return;

                        setValid(false);
                        setCurrentIp(currentAddress.current.value);
                      }
                    }}
                    ref={currentAddress}
                    size="sm"
                    aria-label="Input group example"
                    aria-describedby="btnGroupAddon"
                  />
                  <Button
                    onClick={() => {
                      if (
                        !currentAddress.current?.value ||
                        currentAddress.current.value.trim() ===
                          currentIp?.trim()
                      )
                        return;

                      setValid(false);
                      setCurrentIp(currentAddress?.current?.value);
                    }}
                    size="sm"
                    variant="success"
                    className="rounded-0 border-0"
                  >
                    Visit
                  </Button>
                </InputGroup>
              </Nav>
              <Nav className="ms-auto">
                <InputGroup>
                  <Button
                    size="sm"
                    disabled={
                      browserStore.connectionId
                        ? browserSession?.[browserStore.connectionId]
                            ?.length === 1 || currentIp
                          ? browserSession?.[
                              browserStore.connectionId
                            ]?.indexOf(
                              currentIp !== null ? currentIp : "0.0.0.0"
                            ) === 0
                          : false
                        : false
                    }
                    onClick={() => {
                      if (!browserStore.connectionId) return;

                      let newIp =
                        browserSession?.[browserStore.connectionId]?.[
                          browserSession?.[browserStore.connectionId]?.indexOf(
                            currentIp !== null ? currentIp : "0.0.0.0"
                          ) - 1
                        ] ||
                        browserSession?.[browserStore.connectionId]?.[
                          browserSession?.[browserStore.connectionId].length - 1
                        ];

                      if (currentIp !== newIp) {
                        setCurrentIp(newIp);
                        setValid(false);
                      }
                    }}
                    className="rounded-0 bg-transparent border-0"
                  >
                    Back
                  </Button>
                  <Button
                    disabled={
                      browserStore.connectionId
                        ? browserSession?.[browserStore.connectionId]
                            ?.length === 1 || currentIp
                          ? browserSession?.[
                              browserStore.connectionId
                            ]?.indexOf(
                              currentIp !== null ? currentIp : "0.0.0.0"
                            ) ===
                            browserSession?.[browserStore.connectionId]
                              ?.length -
                              1
                          : false
                        : false
                    }
                    size="sm"
                    onClick={() => {
                      if (!browserStore.connectionId) return;

                      let newIp =
                        browserSession?.[browserStore.connectionId]?.[
                          browserSession?.[browserStore.connectionId]?.indexOf(
                            currentIp !== null ? currentIp : "0.0.0.0"
                          ) + 1
                        ] ||
                        browserSession?.[browserStore.connectionId]?.[
                          browserSession?.[browserStore.connectionId].length - 1
                        ];

                      if (newIp !== currentIp) {
                        setCurrentIp(newIp);
                        setValid(false);
                      }
                    }}
                    className="rounded-0 bg-transparent border-0"
                  >
                    Foward
                  </Button>
                </InputGroup>
              </Nav>
            </Container>
          </Navbar>
          {game.connections.length === 0 || !browserStore.connectionId ? (
            <Row>
              <Col>
                <Alert
                  variant="danger"
                  className="text-center bg-transparent border-danger border mt-0 mb-0 rounded-0"
                  style={{ fontFamily: "initial" }}
                >
                  <p className="display-2">403</p>
                  <p>
                    You need to select which computer you would like to surf the
                    internet with!
                  </p>
                  {game.connections.length !== 0 ? (
                    game.connections.map((connection) => (
                      <>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            browserStore.setConnectionId(connection.id);
                          }}
                        >
                          Connect to {connection.ip} (
                          {(connection.data as any).title})
                        </a>
                        <br />
                      </>
                    ))
                  ) : (
                    <></>
                  )}
                  <br />
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/computers/network", {
                        state: {
                          return: "/internet/browser/" + currentIp,
                        },
                      });
                    }}
                  >
                    View your connections
                  </a>
                </Alert>
              </Col>
            </Row>
          ) : (
            <>
              {!loading && computer && valid ? (
                <Row>
                  <Col>
                    {computer.type === "search_engine" && tab === "homepage" ? (
                      <SearchEngine
                        computer={computer}
                        connectionId={browserStore.connectionId}
                        valid={valid}
                        access={access}
                        setCurrentIp={setCurrentIp}
                        ip={currentIp || "0.0.0.0"}
                        markdown={markdown}
                        setTab={(tab: string) => {
                          if (!browserStore.connectionId) return;
                          browserStore.updateTab(
                            browserStore.connectionId,
                            0,
                            tab
                          );
                          setTab(tab);
                        }}
                      />
                    ) : (
                      <>
                        {(() => {
                          if (tab === "homepage")
                            return (
                              <Homepage
                                computer={
                                  session.data?.logins?.[
                                    browserStore.connectionId
                                  ]?.find((that) => that.id === computer.id) ||
                                  computer
                                }
                                connectionId={browserStore.connectionId}
                                valid={valid}
                                access={access}
                                ip={currentIp || "0.0.0.0"}
                                markdown={markdown}
                                setTab={(tab: string) => {
                                  if (!browserStore.connectionId) return;
                                  browserStore.updateTab(
                                    browserStore.connectionId,
                                    0,
                                    tab
                                  );
                                  setTab(tab);
                                }}
                              />
                            );
                          else if (tab === "connection")
                            return (
                              <Connection
                                computer={
                                  session.data?.logins?.[
                                    browserStore.connectionId
                                  ]?.find((that) => that.id === computer.id) ||
                                  computer
                                }
                                connectionId={browserStore.connectionId}
                                valid={valid}
                                access={access}
                                ip={currentIp || "0.0.0.0"}
                                markdown={markdown}
                                setTab={(tab: string) => {
                                  if (!browserStore.connectionId) return;
                                  browserStore.updateTab(
                                    browserStore.connectionId,
                                    0,
                                    tab
                                  );
                                  setTab(tab);
                                }}
                              />
                            );
                          else if (tab === "hack")
                            return (
                              <Hacking
                                computer={
                                  session.data?.logins?.[
                                    browserStore.connectionId
                                  ]?.find((that) => that.id === computer.id) ||
                                  computer
                                }
                                connectionId={browserStore.connectionId}
                                valid={valid}
                                access={access}
                                fetchHomepage={async (ip, connectionId) => {
                                  browserStore.setConnectionId(connectionId);
                                  let result = await fetchComputer(ip);
                                  if (!result) throw new Error("invalid fetch");

                                  return result;
                                }}
                                ip={currentIp || "0.0.0.0"}
                                markdown={markdown}
                                setTab={(tab: string) => {
                                  if (!browserStore.connectionId) return;
                                  browserStore.updateTab(
                                    browserStore.connectionId,
                                    0,
                                    tab
                                  );
                                  setTab(tab);
                                }}
                              />
                            );
                          else if (tab === "logs")
                            return (
                              <Logs
                                computer={
                                  session.data?.logins?.[
                                    browserStore.connectionId
                                  ]?.find((that) => that.id === computer.id) ||
                                  computer
                                }
                                connectionId={browserStore.connectionId}
                                valid={valid}
                                access={access}
                                ip={currentIp || "0.0.0.0"}
                                markdown={markdown}
                                setTab={(tab: string) => {
                                  if (!browserStore.connectionId) return;
                                  browserStore.updateTab(
                                    browserStore.connectionId,
                                    0,
                                    tab
                                  );
                                  setTab(tab);
                                }}
                              />
                            );
                          else if (tab === "files")
                            return (
                              <Files
                                computer={
                                  session.data?.logins?.[
                                    browserStore.connectionId
                                  ]?.find((that) => that.id === computer.id) ||
                                  computer
                                }
                                connectionId={browserStore.connectionId}
                                valid={valid}
                                access={access}
                                ip={currentIp || "0.0.0.0"}
                                markdown={markdown}
                                setTab={(tab: string) => {
                                  if (!browserStore.connectionId) return;
                                  browserStore.updateTab(
                                    browserStore.connectionId,
                                    0,
                                    tab
                                  );
                                  setTab(tab);
                                }}
                              />
                            );
                          else
                            return (
                              <>
                                <Alert
                                  variant="danger"
                                  className="bg-transparent border-danger border"
                                >
                                  Invalid tab
                                  <br />
                                  <Button
                                    className="mt-2"
                                    variant="danger"
                                    onClick={() => {
                                      if (!browserStore.connectionId) return;
                                      browserStore.updateTab(
                                        browserStore.connectionId,
                                        0,
                                        tab
                                      );
                                      setTab("homepage");
                                    }}
                                  >
                                    Go back to homepage
                                  </Button>
                                </Alert>
                              </>
                            );
                        })()}
                      </>
                    )}
                    {valid && computer ? (
                      <p className="text-white bg-secondary pb-1 ps-1">
                        <span className="badge bg-danger rounded-0">THEM</span>
                        <span className="badge bg-black rounded-0">
                          {computer.type}
                        </span>
                        <span className="badge bg-danger rounded-0">
                          🌎 {computer.ip}
                        </span>
                        {access ? (
                          <span className="me-1 badge bg-success rounded-0">
                            Hacked (
                            {
                              (
                                access as {
                                  access: "GOD" | "FTP";
                                }
                              )?.access
                            }
                            )
                          </span>
                        ) : (
                          <span className="me-1 badge bg-danger rounded-0">
                            Unhacked
                          </span>
                        )}

                        {session.data.logins?.[browserStore.connectionId]
                          ?.length !== 0 ? (
                          session.data.logins?.[browserStore.connectionId]?.map(
                            (login) => (
                              <>
                                <span className="ms-1 badge bg-primary rounded-0">
                                  YOU
                                </span>
                                <span className="badge bg-black rounded-0">
                                  {(login.data as any).title || "Unknown"}
                                </span>
                                <span
                                  className="badge bg-secondary rounded-0"
                                  style={{
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    setCurrentIp(login.ip);
                                  }}
                                >
                                  🌎{" "}
                                  {game.computers.find(
                                    (that) =>
                                      that.id === browserStore.connectionId
                                  )?.ip || "0.0.0.0"}{" "}
                                </span>
                                <span
                                  className="badge bg-primary rounded-0"
                                  style={{
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    navigate(
                                      "/computers/files/" +
                                        browserStore.connectionId,
                                      {
                                        state: {
                                          return:
                                            "/internet/browser/" + currentIp,
                                          uploadTargetIp: access
                                            ? currentIp
                                            : undefined,
                                        },
                                      }
                                    );
                                  }}
                                >
                                  <u>View HDD</u>
                                </span>
                                <span
                                  className="badge bg-primary rounded-0"
                                  style={{
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    navigate(
                                      "/computers/logs/" +
                                        browserStore.connectionId,
                                      {
                                        state: {
                                          return:
                                            "/internet/browser/" + currentIp,
                                        },
                                      }
                                    );
                                  }}
                                >
                                  <u>View Logs</u>
                                </span>
                                <span
                                  className="badge bg-primary rounded-0"
                                  style={{
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    navigate(
                                      "/computers/processes/" +
                                        browserStore.connectionId,
                                      {
                                        state: {
                                          return:
                                            "/internet/browser/" + currentIp,
                                        },
                                      }
                                    );
                                  }}
                                >
                                  <u>View Processes</u>
                                </span>
                              </>
                            )
                          )
                        ) : (
                          <></>
                        )}
                      </p>
                    ) : (
                      <></>
                    )}
                  </Col>
                </Row>
              ) : (
                <>
                  {!valid && !loading ? (
                    <Alert
                      variant="danger"
                      className="text-center bg-transparent border-danger border mt-0 mb-0 rounded-0"
                    >
                      <Row className="justify-content-center mb-4">
                        <Col lg={3}>
                          <img
                            src="/icons/error.png"
                            className="mx-auto img-fluid"
                          />
                        </Col>
                      </Row>
                      <p className="display-2">404</p>
                      <p>
                        Could not find "{currentIp}". Did you try adding www.?
                      </p>
                    </Alert>
                  ) : (
                    <>
                      {currentIp !== "0.0.0.0" ? (
                        <Alert
                          variant="danger"
                          className="text-center bg-transparent border-info border mt-0 mb-0 rounded-0"
                        >
                          <Row className="justify-content-center mb-4">
                            <Col lg={3}>
                              <img
                                src="/icons/query.png"
                                className="mx-auto img-fluid"
                              />
                            </Col>
                          </Row>
                          <p className="display-2">Fetching {currentIp}</p>
                          <p>
                            Please wait for the index.html to be downloaded...
                          </p>
                        </Alert>
                      ) : (
                        <Alert
                          variant="danger"
                          className="text-center bg-transparent border-warning border mt-0 mb-0 rounded-0"
                        >
                          <Row className="justify-content-center mb-4">
                            <Col lg={3}>
                              <img
                                src="/icons/query.png"
                                className="mx-auto img-fluid"
                              />
                            </Col>
                          </Row>
                          <Row className="justify-content-center">
                            <Col lg={4}>
                              <InputGroup>
                                <InputGroup.Text>Search</InputGroup.Text>
                                <Form.Control
                                  type="text"
                                  className="rounded-0"
                                  placeholder={computer?.ip || ""}
                                  name="addressbar"
                                  onKeyUp={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      searchBar.current
                                    ) {
                                      if (
                                        searchBar.current.value.trim() ===
                                        currentIp?.trim()
                                      )
                                        return;

                                      setValid(false);
                                      setCurrentIp(searchBar.current.value);
                                    }
                                  }}
                                  ref={searchBar}
                                  aria-label="Input group example"
                                  aria-describedby="btnGroupAddon"
                                />

                                <Button
                                  onClick={() => {
                                    if (
                                      !searchBar.current?.value ||
                                      searchBar.current.value.trim() ===
                                        currentIp?.trim()
                                    )
                                      return;

                                    setValid(false);
                                    setCurrentIp(searchBar?.current?.value);
                                  }}
                                  size="sm"
                                  variant="success"
                                >
                                  Visit
                                </Button>
                              </InputGroup>
                            </Col>
                          </Row>
                        </Alert>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </Col>
      </Row>
    </Layout>
  );
}

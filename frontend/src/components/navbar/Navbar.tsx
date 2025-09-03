import React, { useContext, useState } from "react";
import { Navbar, Container, Nav, Card, Stack } from "react-bootstrap";
import SessionContext from "../../contexts/session.context";
import NavbarAuthenticated from "./NavbarAuthenticated";
import { createLinks } from "../../lib/links";
import { Link } from "react-router-dom";
import menu from "../../lib/menus/navbar.json";

function NavbarComponent() {
  const session = useContext(SessionContext);

  const [tab, setTab] = useState<string | null>(null);

  return (
    <>
      <Navbar expand="lg" bg="black" data-bs-theme="dark" className="fixed-top">
        <Container fluid className="border-bottom border-success pb-2">
          <Navbar.Brand>
            <Link to={session.valid ? "/game" : "/"} className="text-success">
              ~/syscrack{" "}
              <span className="text-secondary">
                {session.valid ? session.user.name : "guest"}
              </span>
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            {session.valid ? (
              <NavbarAuthenticated
                setTab={(string) => {
                  if (tab === string) setTab(null);
                  else setTab(string);
                }}
              />
            ) : (
              <>
                <Nav className="me-auto">
                  {createLinks({
                    login: {
                      element: Nav.Link,
                      capitalize: true,
                      className: "text-white",
                    },
                    register: {
                      element: Nav.Link,
                      capitalize: true,
                      className: "text-white",
                    },
                  })}
                </Nav>
              </>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {/** Tabs.  These are automatically created by reading libs/menus/navbar.json */}
      <Navbar
        expand="lg"
        data-bs-theme="dark"
        className="fixed-top"
        style={{
          marginTop: 48,
        }}
      >
        <Container fluid className="p-0 mb-2">
          {(() => {
            let keys = Object.keys(menu);
            let children = [] as React.ReactNode[];
            keys.forEach((key) => {
              children.push(
                <Card
                  hidden={tab !== key}
                  body
                  className="rounded-0 border-success"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.5)",
                  }}
                >
                  <Stack direction="horizontal" gap={2} className="pb-2">
                    {menu[key as keyof typeof menu].map((obj) => (
                      <div
                        className="border border-primary"
                        style={{
                          width: 248,
                          height: "auto",
                        }}
                      >
                        <a
                          href={"#navigate:" + obj.url}
                          onClick={() => {
                            setTab(null);
                          }}
                        >
                          <p
                            style={{
                              position: "absolute",
                              fontSize: "24px",
                              zIndex: 2,
                              touchAction: "none",
                              pointerEvents: "none",
                              backgroundColor: "rgba(0,1.0,0,0.6)",
                            }}
                            className="text-white text-center p-2"
                          >
                            {obj.text}
                          </p>
                          <img
                            style={{
                              width: 248,
                              height: 142,
                            }}
                            src={obj.image}
                            className="mx-auto img-fluid nav-icon"
                          />
                        </a>
                      </div>
                    ))}
                  </Stack>
                </Card>
              );
            });

            return children;
          })()}
        </Container>
      </Navbar>
    </>
  );
}

export default NavbarComponent;

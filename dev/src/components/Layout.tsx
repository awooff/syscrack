import React, { ReactNode, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Container, Stack, Row, Col } from "react-bootstrap";
import NavbarComponent from "./navbar/Navbar";
import { useNavigate } from "react-router-dom";
import WebEvents from "../lib/events";
import CollectionReportModal from "./modals/CollectionReportModal";

function Layout({
  children,
  fluid,
  gap,
}: {
  children: ReactNode;
  fluid?: boolean;
  gap?: number;
}) {
  const navigate = useNavigate();
  const [hasInit, setHasInit] = useState(false);
  const eventRef = useRef<(modal: string, data: object) => void>();
  const [currentModal, setCurrentModal] = useState<string | null>(null);
  const [currentModalData, setCurrentModalData] = useState<object | null>({});

  useEffect(() => {
    if (eventRef.current) WebEvents.off("showModal", eventRef.current);

    eventRef.current = (modal: string, data: object) => {
      setCurrentModal(modal);
      setCurrentModalData(data);
    };
    WebEvents.on("showModal", eventRef.current);

    return () => {
      if (eventRef.current) WebEvents.off("showModal", eventRef.current);
    };
  }, []);

  //allows for hash code to redirect so we can do react router dom things with hrefs
  useEffect(() => {
    if (hasInit) return;

    window.addEventListener("hashchange", () => {
      if (location.hash.includes("navigate:"))
        navigate(location.hash.split("navigate:")[1]);
    });
    setHasInit(true);
  }, [hasInit, navigate]);

  return (
    <>
      <NavbarComponent />
      <Container fluid={fluid}>
        <Stack gap={gap !== undefined ? gap : 2} className="pt-2">
          {children as ReactNode[]}
        </Stack>
        <Row className="mt-2">
          <Col></Col>
        </Row>
      </Container>
      <CollectionReportModal
        show={currentModal === "collectionReport"}
        data={currentModalData}
        onHide={() => {
          setCurrentModal(null);
        }}
      />
    </>
  );
}

Layout.propTypes = {
  children: PropTypes.any,
};

export default Layout;

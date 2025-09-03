import { useContext, useEffect, useState } from "react";
import SessionContext from "../contexts/session.context";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { Alert } from "react-bootstrap";

function ProtectedLayout({ children }: { children: any }) {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useContext(SessionContext);
  const [valid, setValid] = useState(true);

  useEffect(() => {
    setValid(false);
    if (!session.loaded) return;

    setValid(session.valid);
  }, [session]);

  if (!valid) {
    navigate("/login", {
      state: {
        message: "Please login!",
        return: location.pathname,
      },
    });
    return (
      <Layout>
        <Alert variant="danger" className="text-center">
          Please login!
        </Alert>
      </Layout>
    );
  }

  return <>{children}</>;
}

export default ProtectedLayout;

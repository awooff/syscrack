import React, { ReactNode, useCallback, useEffect, useState } from "react";
import SessionContext, {
  SessionContextDefault,
  SessionType,
} from "../contexts/session.context";
import PropTypes from "prop-types";
import axios from "axios";

function SessionProvider({ children }: { children: unknown }) {
  const [session, setSession] = useState<SessionType>(SessionContextDefault);

  const load = useCallback(async () => {
    let newSession = { ...SessionContextDefault };

    if (session.loaded) {
      setSession(newSession);
      return;
    }

    try {
      const result = await axios.get("http://localhost:1337/auth/valid", {
        withCredentials: true,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
      });

      newSession = {
        loaded: true,
        data: result.data.session,
        valid: true,
        user: result.data.user,
        load: load,
      };
      setSession(newSession);
    } catch (error) {
      newSession = {
        ...SessionContextDefault,
        loaded: true,
        load: load,
      };
      setSession(newSession);
    }
  }, [setSession, session.loaded]);

  useEffect(() => {
    if (session.loaded) return;

    load();
  }, [load, session]);

  return (
    <SessionContext.Provider value={session}>
      {!session.loaded ? <></> : (children as ReactNode)}
    </SessionContext.Provider>
  );
}

SessionProvider.propTypes = {
  children: PropTypes.any,
};

export default SessionProvider;

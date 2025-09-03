import React, { useContext } from "react";
import { Computer } from "backend/src/generated/client";
import BrowserLayout from "../BrowserLayout";

function Homepage({
  connectionId,
  ip,
  computer,
  markdown,
  valid,
  access,
  setTab,
}: {
  connectionId: string;
  ip: string;
  computer: Computer;
  markdown: string;
  valid: boolean;
  access: object | null;
  setTab: (tab: string) => void;
}) {
  return (
    <BrowserLayout
      variant="success"
      setTab={setTab}
      access={access}
      computer={computer}
      connectionId={connectionId}
    >
      {!markdown || markdown.length === 0 ? (
        <>
          <p>Missing document...</p>
        </>
      ) : (
        <iframe
          sandbox="allow-scripts"
          srcDoc={`
                  <script>
                    window.computer = ${JSON.stringify(computer)}
                  </script>
                  ${markdown}
                  <script>                   
                      let elements = document.getElementsByTagName('span');
                      
                      for(let i = 0; i < elements.length; i++){
                        let elm = elements[i];   
                        if(elm.getAttribute('data-computer'))
                          elm.innerHTML = window.computer[elm.getAttribute('data-computer')]
                      }
                  </script>
                  `}
          style={{
            width: "100%",
            height: "100%",
            background: "white",
            overflowX: "hidden",
            overflowY: "scroll",
          }}
        ></iframe>
      )}
    </BrowserLayout>
  );
}

Homepage.propTypes = {};

export default Homepage;

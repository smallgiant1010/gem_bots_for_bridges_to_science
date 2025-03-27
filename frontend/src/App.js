import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Stack from "react-bootstrap/Stack";
import Header from "./Components/Header";
import { useEffect, useState } from "react";
import Chat from "./Components/Chat";
function App() {
  const [chatSessions, setChatSessions] = useState([]);

  useEffect(() => {
    const getChatSessions = async() => {
      try {
        const response = await fetch("/api/v1/get_chat_names");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if(data.function_call_success) {
          setChatSessions(prev => [...prev, data["chat_names"]])
        }
      }
      catch(err) {
        console.log(err);
      }
    }
    getChatSessions();
  }, []);

  useEffect(() => {
    console.log(chatSessions);
  }, [chatSessions]);

  return (
    <Container fluid>
      <Header />
      <Row>
        <Col style={{"backgroundColor": "rgb(52, 58, 64)"}} className="min-vh-100">
          <h2 className="text-light text-center mt-2">Chat History</h2>
          <Stack gap={3}>
            {chatSessions?.map((item, index) => {
              return <Chat key={index} name={item} />
            })}
          </Stack>
        </Col>
        <Col xs={7} className="bg-success">
          Message History
          <Stack gap={3}></Stack>
        </Col>
        <Col className="bg-danger">
          File Management
          <Stack gap={3}></Stack>
        </Col>
      </Row>
    </Container>
  );
}

export default App;

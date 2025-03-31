import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Header from "./Components/Header";
import ChatManager from "./Components/ChatManager";
import Stack from "react-bootstrap/Stack";
import FileManager from "./Components/FileManager";


function App() {

  return (
    <Container fluid>
      <Header />
      <Row>
        <ChatManager />
        <Col xs={8} className="bg-success">
          Message History
          <Stack gap={3}></Stack>
        </Col>
        <FileManager />
      </Row>
    </Container>
  );
}

export default App;

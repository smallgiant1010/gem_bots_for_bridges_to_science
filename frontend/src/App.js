import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import ChatManager from "./Components/ChatManager";
import FileManager from "./Components/FileManager";
import MessageManager from "./Components/MessageManager";


function App() {
  return (
    <Container fluid>
      <Row>
        <ChatManager />
        <MessageManager />
        <FileManager />
      </Row>
    </Container>
  );
}

export default App;

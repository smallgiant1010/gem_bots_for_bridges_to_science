import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Header from "./Components/Header";
import ChatManager from "./Components/ChatManager";
import FileManager from "./Components/FileManager";
import MessageManager from "./Components/MessageManager";


function App() {
  return (
    <Container fluid>
      <Header />
      <Row>
        <ChatManager />
        <MessageManager />
        <FileManager />
      </Row>
    </Container>
  );
}

export default App;

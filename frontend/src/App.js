import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import ChatManager from "./Components/ChatManager";
import FileManager from "./Components/FileManager";
import MessageManager from "./Components/MessageManager";
import ToastStack from "./Components/ToastStack";
import { ToastContextProvider } from "./Context/ToastContext";

function App() {
  return (
    <ToastContextProvider>
      <Container fluid>
        <Row>
          <ChatManager />
          <MessageManager />
          <FileManager />
        </Row>
      </Container>
      <ToastStack />
    </ToastContextProvider>
  );
}

export default App;

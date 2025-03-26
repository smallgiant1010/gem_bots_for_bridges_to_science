import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Stack from "react-bootstrap/Stack";

function App() {
  return (
    <Container fluid>
      <Row>
        <Col className="text-center">BridgesWriter</Col>
      </Row>
      <Row>
        <Col className="bg-primary">
        Chat History
          <Stack gap={3}></Stack>
        </Col>
        <Col xs={7}className="bg-success">
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

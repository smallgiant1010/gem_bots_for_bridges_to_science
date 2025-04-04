import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import ChatManager from "../Components/ChatManager";
import FileManager from "../Components/FileManager";
import MessageManager from "../Components/MessageManager";
import withAuth from "../HOC/withAuth";

const ContentPage = () => {
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

export default withAuth(ContentPage)
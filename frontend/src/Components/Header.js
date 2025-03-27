import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { IoInformationCircleSharp } from "react-icons/io5";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Stack from "react-bootstrap/Stack";

const Header = () => {
  const renderTooltip = (props) => (
    <Tooltip id="icon-tooltip" {...props}>
      Custom AI Tool
    </Tooltip>
  );
  return (
    <Row>
      <Col className="d-flex justify-content-center bg-dark-subtle">
        <Stack direction="horizontal" gap={3} className="p-3">
          <h1 id="brand" className="fw-light text-center text-secondary mb-0">
            BridgesWriter
          </h1>
          <OverlayTrigger
            placement="bottom"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip}
          >
            <IoInformationCircleSharp size={30} color="gray" />
          </OverlayTrigger>
        </Stack>
      </Col>
    </Row>
  );
};

export default Header;

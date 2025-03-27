import { FaTrashAlt } from "react-icons/fa";
import Button from "react-bootstrap/Button";

const Chat = (props) => {
  return (
    <>
      <Button
        variant="secondary"
        className="border border-3 border-dark-subtle p-2 m-2 d-flex justify-content-between align-items-center"
      >
        <h6 className="m-0">{props.name}</h6>
        <FaTrashAlt color="gray" />
      </Button>
    </>
  );
};

export default Chat;

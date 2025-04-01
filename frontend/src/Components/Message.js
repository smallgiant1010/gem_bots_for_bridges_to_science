import { ListGroup, Stack } from "react-bootstrap";
import { AiOutlineRobot } from "react-icons/ai";
import { FaCircleUser } from "react-icons/fa6";

const Message = ({ messageInfo }) => {
  const { type, message, timestamp } = messageInfo;
  const formmatedDate = timestamp.split("T")[0];

  return (
    <ListGroup.Item
      className={`d-flex ${type === "ai" ? "" : "justify-content-end"}`}
      style={{"border" : "0px solid black", "backgroundColor": "#202020"}}
    >
      <div
        className={`${
          type === "ai" ? "bg-secondary" : "bg-info"
        } p-2 rounded d-flex`}
      >
        {type === "ai" && <AiOutlineRobot size={32} color="cyan" className="pe-2 flex-shrink-0"/>}
        <Stack gap={2}>
          <span className={`fw-light d-flex ${type === 'human' ? "justify-content-end pe-2" : "justify-content-start"} `}>{formmatedDate}</span>
          <p className="text-break m-0 pe-2 pb-2">{message}</p>
        </Stack>
        {type !== "ai" && <FaCircleUser size={32} color="gray"className="flex-shrink-0" />}
      </div>
    </ListGroup.Item>
  );
};

export default Message;

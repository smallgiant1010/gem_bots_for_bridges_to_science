import { FaTrashAlt } from "react-icons/fa";
import Button from "react-bootstrap/Button";
import { useChatContext } from "../Context/ChatContext";

const Chat = (props) => {
  const {current_chat, dispatch} = useChatContext();
  const handleRemoval = async(e) => {
    e.preventDefault();
    const apiCall = await fetch(`/api/v1/delete_session/${props.name}`, {
      "method": "DELETE"
    }).then(async(response) => await response.json()).catch(err => console.log(err))
    if (!apiCall["function_call_success"]) {
      throw new Error("ERROR: ", apiCall["error"]);
    }
    dispatch({
      "type": "REMOVE_CHAT",
      "payload": {
        "chat_name": props.name
      }
    });
  }

  const handleSelection = async(e) => {
    e.preventDefault();
    if(current_chat === props.name) {
      return;
    }
    const apiCall = await fetch(`/api/v1/switch_chat_session/${props.name}`)
    .then(async(response) => response.json())
    .catch(err => console.log(err));
    if (!apiCall["function_call_success"]) {
      throw new Error("ERROR: ", apiCall["error"]);
    }
    dispatch({
      "type": "CHANGE_CHAT",
      "payload": {
        "chat_name": apiCall["chat_name"],
        "messages": apiCall["messages"],
      }
    })
  }
  return (
    <>
      <Button
        variant="secondary"
        className="border border-3 border-dark-subtle p-2 m-2 d-flex justify-content-between align-items-center"
        onClick={handleSelection}
      >
        <h6 className="m-0">{props.name}</h6>
        <FaTrashAlt color="gray" onClick={handleRemoval}/>
      </Button>
    </>
  );
};

export default Chat;

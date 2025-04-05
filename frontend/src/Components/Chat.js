import { FaTrashAlt } from "react-icons/fa";
import Button from "react-bootstrap/Button";
import { useChatContext } from "../Context/ChatContext";
import { Form } from "react-bootstrap";
import { useState } from "react";
import { useToastContext } from "../Context/ToastContext";
import { baseAPIUrl } from "../Constants/constants";
import { useEffect } from "react";

const Chat = (props) => {
  const {current_chat, dispatch} = useChatContext();
  const [oldChatName, setOldChatName] = useState(props.name);
  const [chatName, setChatName] = useState(oldChatName);
  const {addToast} = useToastContext();

  useEffect(() => {
    setOldChatName(props.name);
    setChatName(props.name);
  }, [props.name]);

  const handleRemoval = async(e) => {
    e.preventDefault();
    const response = await fetch(baseAPIUrl + `/api/v1/delete_session/${props.name}`, {
      "method": "DELETE"
    });
    if(!response.ok) {
      addToast({
        id: new Date().toISOString(),
        "message": "ERROR: Server Down. Please Contact Developer."
      });
      return;
    }
    const apiCall = await response.json();
    if (!apiCall["function_call_success"]) {
      addToast({
        "id": new Date().toISOString(),
        "message": `ERROR: ${apiCall["error"]}`
      });
      return;
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
    const response = await fetch(baseAPIUrl + `/api/v1/switch_chat_session/${props.name}`)
    if(!response.ok) {
      addToast({
        id: new Date().toISOString(),
        "message": "ERROR: Server Down. Please Contact Developer."
      });
      return;
    }
    const apiCall = await response.json();
    if (!apiCall["function_call_success"]) {
      addToast({
        id: new Date().toISOString(),
        message: `ERROR: ${apiCall["error"]}`
      });
      return;
    }
    dispatch({
      "type": "CHANGE_CHAT",
      "payload": {
        "chat_name": apiCall["chat_name"],
        "messages": apiCall["messages"],
      }
    })
  }

  const handleRename = async(e) => {
    e.preventDefault();
    if(chatName.trim() === oldChatName.trim()) {
      return;
    }
    try {
      const response = await fetch(baseAPIUrl + "/api/v1/rename_chat", {
        "method": "PATCH",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": JSON.stringify({
          "old_name": oldChatName,
          "new_name": chatName
        })
      });
      if(!response.ok) {
        throw new Error("ERROR: Server Down. Please Contact Developer.");
      }
      const data = await response.json();
      if(!data["function_call_success"]) {
        throw new Error(`ERROR: ${data["error"]}`);
      }
      dispatch({
        "type": "RENAME_CHAT",
        "payload": {
          "old_name": oldChatName,
          "new_name": chatName
        }
      });
      setOldChatName(prev => chatName);
    }
    catch(err) {
      addToast({
        "id": new Date().toISOString(),
        "message": err
      })
    }
  }
  return (
    <>
      <Button
        variant={current_chat === props.name ? "success" : "secondary"}
        className="border border-3 border-dark-subtle p-2 m-2 d-flex justify-content-between align-items-center"
        style={{"width": "calc(100% - 16px)"}}
        onClick={handleSelection}
      >
        <Form.Control
          type="text"
          value={chatName}
          onChange={e => setChatName(prev => e.target.value)}
          onBlur={handleRename}
          aria-describedby="renameChat"
          className="m-0 border-0"
          style={{"backgroundColor": "transparent"}}/>
        <FaTrashAlt color="gray" onClick={handleRemoval}/>
      </Button>
    </>
  );
};

export default Chat;

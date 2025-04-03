import { useEffect, useRef, useCallback } from "react";
import { useChatContext } from "../Context/ChatContext";
import { Col, ListGroup } from "react-bootstrap";
import Message from "./Message";
import Searchbar from "./Searchbar";
import { useToastContext } from "../Context/ToastContext";

const MessageManager = () => {
  const { messages, dispatch } = useChatContext();
  const { addToast } = useToastContext();
  const listRef = useRef(null);

  const getLatestMessages = useCallback(async() => {
    try {
      const response = await fetch("/api/v1/get_latest_chat_session");
      if(!response.ok) {
        throw new Error("ERROR: Server Down. Please Contact developer.");
      }
      const latest_messages = await response.json();
      if (!latest_messages["function_call_success"]) {
        throw new Error(`ERROR: ${latest_messages["error"]}`);
      }
      dispatch({
        type: "CHANGE_CHAT",
        payload: {
          chat_name: latest_messages["chat_name"],
          messages: latest_messages["messages"],
        },
      });
    }
    catch (err) {
      addToast({
        "id": new Date().toISOString(),
        "message": err
      });
    }
  }, [dispatch, addToast]);

  useEffect(() => {
    getLatestMessages();
  }, [getLatestMessages]);

  useEffect(() => {
    listRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Col xs={8} style={{ "backgroundColor": "#202020", "height": "100vh" }} className="d-flex flex-column position-relative">
      <ListGroup className="pt-2 overflow-y-scroll" style={{ "maxHeight": "calc(100vh - 75px)" }}>
        {messages?.length > 0 && messages?.map((info, index) => {
          return <Message messageInfo={info} key={index} />
        })}
        <div id="dummy-div" ref={listRef}></div>
      </ListGroup>
      <div className="d-flex align-items-center justify-content-center">
        <Searchbar />
      </div>
    </Col>
  );
};

export default MessageManager;

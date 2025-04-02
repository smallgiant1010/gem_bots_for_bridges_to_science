import { useEffect, useRef } from "react";
import { useChatContext } from "../Context/ChatContext";
import { Col, ListGroup } from "react-bootstrap";
import Message from "./Message";
import Searchbar from "./Searchbar";

const MessageManager = () => {
  const { messages, dispatch } = useChatContext();
  const listRef = useRef(null);

  const scrollToBottom = () => {
    listRef.current.scrollIntoView({behavior: "smooth", block: "end"});
  }

  useEffect(() => {
    const getLatestMessages = async () => {
      const latest_messages = await fetch("/api/v1/get_latest_chat_session")
        .then(async (response) => response.json())
        .catch((err) => console.log(err));
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
    };
    getLatestMessages();
  }, [dispatch]);

  // useEffect(() => {
  //   console.log(current_chat);
  //   console.log(messages);
  // }, [current_chat, messages]);

  return (
    <Col xs={8} style={{ "backgroundColor": "#202020", "height": "100vh" }} className="d-flex flex-column position-relative">
      <ListGroup className="pt-2 overflow-y-scroll" style={{ "maxHeight": "calc(100vh - 75px)" }} ref={listRef}>
        {messages?.length > 0 && messages?.map((info, index) => {
          return <Message messageInfo={info} key={index} />
        })}
      </ListGroup>
      <div className="d-flex align-items-center justify-content-center">
        <Searchbar scrollMethod={scrollToBottom}/>
      </div>
    </Col>
  );
};

export default MessageManager;

import { Suspense, useEffect, useCallback } from "react";
import Chat from "./Chat";
import Button from "react-bootstrap/Button";
import { FaPlus } from "react-icons/fa";
import Stack from "react-bootstrap/Stack";
import Col from "react-bootstrap/Col";
import { useChatContext } from "../Context/ChatContext";
import Loading from "./Loading";
import { useToastContext } from "../Context/ToastContext";
import { baseAPIUrl } from "../Constants/constants";

const ChatManager = () => {
  const { chats, dispatch } = useChatContext();
  const { addToast } = useToastContext();

  const getChatSessions = useCallback(async () => {
    try {
      const response = await fetch(baseAPIUrl + "/api/v1/get_chat_names");
      if (!response.ok) {
        throw new Error("ERROR: Server Down. Please Contact Developer.");
      }
      const data = await response.json();
      if (data.function_call_success) {
        dispatch({
          type: "UPDATE_CHATS",
          payload: {
            chat_names: [...data["chat_names"]],
          },
        });
      }
    } catch (err) {
      addToast({
        id: new Date().toISOString(),
        message: err,
      });
    }
  }, [dispatch, addToast]);

  useEffect(() => {
    getChatSessions();
  }, [getChatSessions]);

  // Debugging
  useEffect(() => {
    console.log(chats);
  }, [chats]);

  const handleCreation = async (e) => {
    e.preventDefault();
    const response = await fetch(baseAPIUrl + "/api/v1/create_new_session", {
      "method": "POST",
    })
    if (!response.ok) {
      addToast({
        id: new Date().toISOString(),
        message: "ERROR: Server Down. Please Contact Developer."
      });
      return;
    }
    const apiCall = await response.json();
    if (!apiCall["function_call_success"]) {
      addToast({
        "id": new Date().toISOString(),
        message: `ERROR: ${apiCall["error"]}`
      });
      return;
    }
    dispatch({
      "type": "ADD_CHAT",
      "payload": {
        "chat_name": apiCall["new_chat_name"]["chat_name"]
      }
    });
  };


  return (
    <Col style={{ backgroundColor: "rgb(52, 58, 64)" }} className="min-vh-100 w-100 d-none d-md-block">
      <h2 className="text-light text-center mt-2">Chat History</h2>
      <Stack gap={2}>
        <Button
          variant="dark"
          size="md"
          className="border border-3 border-dark-subtle p-2 m-2 d-flex justify-content-between align-items-center"
          onClick={handleCreation}
        >
          <h6 className="m-0">Create New Chat</h6>
          <FaPlus color="gray" />
        </Button>
        <Suspense fallback={<Loading />} >
          <div className="overflow-y-auto" style={{ maxHeight: "100vh" }}>
            {chats?.map((item, index) => (
              <Chat key={index} name={item} />
            ))}
          </div>
        </Suspense>
      </Stack>
    </Col>
  );
};

export default ChatManager;

import { useState } from "react";
import { InputGroup, Button, Form } from "react-bootstrap";
import { useChatContext } from "../Context/ChatContext";
import Loading from "./Loading";

const Searchbar = ({ scrollMethod }) => {
    const [message, setMessage] = useState("");
    const { dispatch } = useChatContext();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message) {
            return;
        }
        scrollMethod();
        dispatch({
            "type": "ADD_MESSAGE",
            "payload": {
                "message": {
                    "type": "human",
                    "message": message,
                    "timestamp": new Date().toISOString().split("T")[0]
                }
            }
        });
        setIsLoading(true);
        try {
            const queryParam = encodeURIComponent(message)
            const response = await fetch(`/api/v1/message_llm?query=${queryParam}`, {
                "method": "POST",
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }
            const messageCall = await response.json();
            dispatch({
                "type": "ADD_MESSAGE",
                "payload": {
                    "message": {
                        "type": messageCall["type"],
                        "message": messageCall["message"],
                        "timestamp": messageCall["timestamp"].split("T")[0]
                    }
                }
            });
        }
        catch(err) {
            console.log(err);
        }
        finally {
            setIsLoading(false);
            setMessage("");
        }
    }

    return (
        <InputGroup className="mb-3 position-fixed bottom-0 w-50">
            <Form.Control
                as="textarea"
                rows={1}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Message BridgesWriter"
                aria-label="message-bar"
                aria-describedby="message-bar"
                className="text-break"
            />
            <Button variant="secondary" id="submit-button" onClick={handleSubmit}>
                {!isLoading ? "Send" : <Loading />}
            </Button>
        </InputGroup>
    );
};



export default Searchbar;

import { useState } from "react";
import { Button, Card, Container, Row, Form, InputGroup } from "react-bootstrap";
import { useToastContext } from "../Context/ToastContext";
import { useNavigate } from "react-router-dom";
import Loading from "../Components/Loading";

const AccessPage = () => {
    const [enteredPassword, setEnteredPassword] = useState("");
    const [wrongPassword, setWrongPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const {addToast} = useToastContext();
    const navigate = useNavigate();

    const handleClick = async(e) => {
        e.preventDefault();
        setLoading(true);
        console.log(process.env.REACT_APP_ACCESS_CODE);
        console.log(enteredPassword);
        try {
            if(enteredPassword !== process.env.REACT_APP_ACCESS_CODE) {
                setWrongPassword(true);
            }
            else{
                sessionStorage.setItem("access-token", process.env.REACT_APP_TOKEN_HASH);
                navigate("/main");
            }
        }
        catch(err) {
            addToast({
                "id": new Date().toISOString(),
                "message": err
            });
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <Container fluid className="d-flex justify-content-center align-items-center vh-100">
            <Row>
                <Card style={{ "width": "18rem" }}>
                    <Card.Body>
                        <Card.Title>Enter Access Code</Card.Title>
                        <InputGroup className="p-1">
                            <Form.Control
                                type="password"
                                aria-label="Enter Access Code"
                                aria-describedby="basic-input"
                                value={enteredPassword}
                                onChange={e => setEnteredPassword(e.target.value)}
                            />
                            <Button variant="danger" onClick={handleClick}>
                                {loading ? <Loading /> : "Enter"}
                            </Button>
                        </InputGroup>
                        {wrongPassword && <p className="text-danger">Access Denied.</p>}
                    </Card.Body>
                </Card>
            </Row>
        </Container>
    )
}

export default AccessPage;
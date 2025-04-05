import { useState } from "react";
import { Button, Card, Container, Row, Form, InputGroup } from "react-bootstrap";
import { useToastContext } from "../Context/ToastContext";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import Loading from "../Components/Loading";
import { baseAPIUrl } from "../Constants/constants";

const AccessPage = () => {
    const [enteredPassword, setEnteredPassword] = useState("");
    const [wrongPassword, setWrongPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const {addToast} = useToastContext();
    const navigate = useNavigate();

    const handleClick = async(e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(baseAPIUrl + `/api/v1/compare_password?password=${enteredPassword}`, {
                "method": "POST"
            });
            if(!response.ok) {
                throw new Error("ERROR: Server Down. Please Contact Developer.");
            }
            const data = await response.json();
            if(!data["check"]) {
                setWrongPassword(true);
            }
            else{
                const accessToken = CryptoJS.SHA256(process.env.REACT_APP_FRONTEND_ACCESS_CODE).toString(CryptoJS.enc.Base64);
                sessionStorage.setItem("access-token", accessToken);
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
                        {wrongPassword && <p color="danger">Access Denied.</p>}
                    </Card.Body>
                </Card>
            </Row>
        </Container>
    )
}

export default AccessPage;
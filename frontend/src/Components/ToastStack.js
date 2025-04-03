import { Toast, ToastContainer } from "react-bootstrap";
import { useToastContext } from "../Context/ToastContext";
import { AiOutlineRobot } from "react-icons/ai";

const ToastStack = () => {
    const { toasts, removeToast } = useToastContext();

    return (
        <ToastContainer position="top-end" style={{"zIndex": "1"}}>
            {toasts?.map((item, index) => {
                return <Toast key={index} onClose={() => removeToast(item.id)} delay={3000} autohide>
                    <Toast.Header>
                        <AiOutlineRobot className="rounded me-2" size={24} color="cyan"/>
                        <strong className="me-auto">BridgesWriter</strong>
                        <small className="text-muted">{item.id}</small>
                    </Toast.Header>
                    <Toast.Body>{item.message}</Toast.Body>
                </Toast>
            })}
        </ToastContainer>
    );
}

export default ToastStack;
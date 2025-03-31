import { useEffect, useState } from "react";
import { Form, ListGroup, Toast, ToastContainer } from "react-bootstrap";
import { useChatContext } from "../Context/ChatContext";
import { FaTrashAlt } from "react-icons/fa";
import { AiOutlineRobot } from "react-icons/ai";
import { IoIosRemoveCircle } from "react-icons/io";

const FileContainer = ({ file_name, start_selected, removeAFile }) => {
  const { selected_files, dispatch } = useChatContext();
  const [checkBoxState, setCheckBoxState] = useState(
    selected_files.has(file_name)
  );
  const [showToast, setShowToast] = useState(false);
  const [toastInfo, setToastInfo] = useState({
    timestamp: "",
    message: "",
    file_name: "",
  });

  useEffect(() => {
    if(!selected_files.has(file_name)) {
        setCheckBoxState(prev => false);
    }
  }, [selected_files, file_name])

  const handleCheck = async (e) => {
    // e.preventDefault();
    if (start_selected) {
      return;
    }
    const checked = e.target.checked;
    setCheckBoxState((prev) => checked);
    if (checked) {
      const apiCall = await fetch("/api/v1/add_to_vector_store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_names: [file_name],
        }),
      })
        .then(async (response) => response.json())
        .catch((err) => console.log(err));
      if (apiCall["function_call_success"]) {
        setToastInfo((prev) => ({
          timestamp: new Date().toISOString(),
          message: `${file_name} Successfully Added To My Memory ☺️`,
          file_name: file_name,
        }));
        dispatch({
          type: "ADD_SELECTED_FILE",
          payload: {
            file_name: file_name,
          },
        });
      } else {
        setToastInfo((prev) => ({
          timestamp: new Date().toISOString(),
          message: `I Don't Recognize ${file_name}. Something went Wrong! 😠`,
          file_name: file_name,
        }));
      }
    }
    setShowToast(true);
  };

  const handleRemoval = async (e) => {
    e.preventDefault();
    const apiCall = await fetch("/api/v1/remove_files", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_names: [file_name],
      }),
    })
      .then(async (response) => response.json())
      .catch((err) => console.log(err));
    if (!apiCall["function_call_success"]) {
      setToastInfo((prev) => ({
        timestamp: new Date().toISOString(),
        message: `I Still Remember ${file_name}. Something Went Wrong! 😠`,
        file_name: file_name,
      }));
    } else {
      setToastInfo((prev) => ({
        timestamp: new Date().toISOString(),
        message: `${file_name} Successfully Forgotten ☺️`,
        file_name: file_name,
      }));
      dispatch({
        type: "REMOVE_FILE",
        payload: {
          file_name: file_name,
        },
      });
    }
    setShowToast(true);
  };

  const handleDeletion = async(e) => {
    e.preventDefault();
    const apiCall = await fetch(`/api/v1/delete_file/${file_name}`, {
        method: "DELETE",
      })
        .then(async (response) => response.json())
        .catch((err) => console.log(err));
      if (!apiCall["function_call_success"]) {
        setToastInfo((prev) => ({
          timestamp: new Date().toISOString(),
          message: `I Still Remember ${file_name}. Something Went Wrong! 😠`,
          file_name: file_name,
        }));
      } else {
        setToastInfo((prev) => ({
          timestamp: new Date().toISOString(),
          message: `${file_name} Successfully Forgotten ☺️`,
          file_name: file_name,
        }));
        dispatch({
            type: "REMOVE_FILE",
            payload: {
              file_name: file_name,
            },
          });
          removeAFile(file_name);
      }
      setShowToast(true);
  };

  return (
    <>
      <ListGroup.Item
        className="d-flex align-items-center justify-content-between"
        variant="light"
      >
        <Form.Label className="d-flex m-0">
          <span
            className="text-truncate"
            style={{ flexGrow: 1, maxWidth: "200px" }}
          >
            {file_name}
          </span>
          {!start_selected && (!checkBoxState ?
            <Form.Check
              inline
              type="checkbox"
              checked={checkBoxState}
              onChange={handleCheck}
            />
            : <Form.Check
            inline
            disabled
            type="checkbox"
            checked={checkBoxState}
            onChange={handleCheck}
          />
          )}
        </Form.Label>
        {start_selected ? (
          <IoIosRemoveCircle className="removal-icon" color="gray" size={16} onClick={handleRemoval} />
        ) : (
          <FaTrashAlt className="removal-icon" color="gray" size={16} onClick={handleDeletion}/>
        )}
      </ListGroup.Item>
      <ToastContainer className="p-3" position="top-end" style={{ zIndex: 1 }}>
        <Toast autohide delay={2000} show={showToast} onClose={() => setShowToast(false)}>
          <Toast.Header>
            <AiOutlineRobot color="cyan" className="rounded me-2" />
            <strong className="me-auto">BridgesWriter</strong>
            <small>{toastInfo.timestamp}</small>
          </Toast.Header>
          <Toast.Body>
            <p>{toastInfo.message}</p>
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default FileContainer;

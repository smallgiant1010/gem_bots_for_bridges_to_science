import { useEffect, useState } from "react";
import { Form, ListGroup } from "react-bootstrap";
import { useChatContext } from "../Context/ChatContext";
import { FaTrashAlt } from "react-icons/fa";
import { IoIosRemoveCircle } from "react-icons/io";
import { useToastContext } from "../Context/ToastContext";

const FileContainer = ({ file_name, start_selected, removeAFile }) => {
  const { selected_files, dispatch } = useChatContext();
  const [checkBoxState, setCheckBoxState] = useState(
    selected_files.has(file_name)
  );
  const { addToast } = useToastContext();

  useEffect(() => {
    if (!selected_files.has(file_name)) {
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
      const response = await fetch("/api/v1/add_to_vector_store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_names: [file_name],
        }),
      })
      if (!response.ok) {
        addToast({
          "id": new Date().toISOString(),
          "message": "ERROR: Server Down. Please Contact Developer."
        });
        return;
      }
      const apiCall = await response.json();
      if (apiCall["function_call_success"]) {
        addToast({
          id: new Date().toISOString(),
          message: `${file_name} Successfully Added To My Memory ☺️`,
        });
        dispatch({
          type: "ADD_SELECTED_FILE",
          payload: {
            file_name: file_name,
          },
        });
      } else {
        addToast({
          id: new Date().toISOString(),
          message: `I Don't Recognize ${file_name}. Something went Wrong! 😠`,
        });
      }
    }

  };

  const handleRemoval = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/v1/remove_files", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_names: [file_name],
      }),
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
        id: new Date().toISOString(),
        message: `I Still Remember ${file_name}. Something Went Wrong! 😠`,
      });
    } else {
      addToast({
        id: new Date().toISOString(),
        message: `${file_name} Successfully Forgotten ☺️`,
      });
      dispatch({
        type: "REMOVE_FILE",
        payload: {
          file_name: file_name,
        },
      });
    }

  };

  const handleDeletion = async (e) => {
    e.preventDefault();
    const response = await fetch(`/api/v1/delete_file/${file_name}`, {
      method: "DELETE",
    });
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
        id: new Date().toISOString(),
        message: `I Still Remember ${file_name}. Something Went Wrong! 😠`,
      });
    } else {
      addToast({
        id: new Date().toISOString(),
        message: `${file_name} Successfully Forgotten ☺️`,
      });
      dispatch({
        type: "REMOVE_FILE",
        payload: {
          file_name: file_name,
        },
      });
      removeAFile(file_name);
    }
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
          <FaTrashAlt className="removal-icon" color="gray" size={16} onClick={handleDeletion} />
        )}
      </ListGroup.Item>
    </>
  );
};

export default FileContainer;

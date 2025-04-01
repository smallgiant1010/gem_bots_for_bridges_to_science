import Form from "react-bootstrap/Form";
import { IoCloudUploadOutline } from "react-icons/io5";
import Button from "react-bootstrap/esm/Button";
import { useEffect, useState } from "react";
import { useChatContext } from "../Context/ChatContext";
import { AiOutlineRobot } from "react-icons/ai";
import { Accordion, ListGroup, Toast, ToastContainer } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import FileContainer from "./FileContainer";

const FileManager = () => {
  const { selected_files, dispatch } = useChatContext();
  const [showToast, setShowToast] = useState(false);
  const [allFiles, setAllFiles] = useState([]);
  const [toastInfo, setToastInfo] = useState({
    timestamp: "",
    message: "",
    file_name: "",
  });

  useEffect(() => {
    const get_all_files = async() => {
        const all_files_api_call = await fetch("/api/v1/get_files").then(async(response) => response.json()).catch(err => console.log(err));
        if(!all_files_api_call["function_call_success"]) {
            throw new Error(`ERROR: ${all_files_api_call["error"]}`);
        }
        const all_selected_files = await fetch("/api/v1/get_current_files_in_store").then(async(response) => response.json()).catch(err => console.log(err));
        setAllFiles(prev => all_files_api_call["files"]);
        dispatch({
            "type": "ADD_MULTIPLE_FILES",
            "payload": {
                "file_names": all_selected_files["results"]
            }
        });
    };
    get_all_files();
  }, [dispatch]);

  const removeFile = (file_name) => {
    setAllFiles(prev => prev.filter(name => name !== file_name));
  }

//   useEffect(() => {
//     console.log(selected_files);
//   }, [selected_files]);

  const handleFile = async (e) => {
    e.preventDefault();
    const selectedFile = e.target.files[0];
    const formData = new FormData();
    formData.append("file", selectedFile);
    const apiCall = await fetch("/api/v1/upload_file", {
      method: "POST",
      body: formData,
    })
      .then(async (response) => await response.json())
      .catch((err) => console.log(err));
    if (apiCall["function_call_success"]) {
      setToastInfo((prev) => ({
        timestamp: apiCall["timestamp"],
        message: `I Got Your File! ☺️`,
        file_name: selectedFile.name,
      }));
      dispatch({
        type: "ADD_SELECTED_FILE",
        payload: {
          file_name: selectedFile.name,
        },
      });
      setAllFiles(prev => [...prev, selectedFile.name]);
    } else {
      setToastInfo((prev) => ({
        timestamp: new Date().toISOString(),
        message: `I Already Have this File! 😠`,
        file_name: selectedFile.name,
      }));
    }
    setShowToast(true);
  };

  return (
    <Col style={{ backgroundColor: "#404040" }}>
      <h2 className="text-light text-center mt-2">File Management</h2>
      <Form.Label className="d-flex align-items-center">
        <Form.Control
          type="file"
          id="fileUpload"
          style={{ display: "none" }}
          onChange={handleFile}
        />
        <Button
          variant="primary"
          className="d-flex justify-content-evenly align-items-center w-100"
          onClick={() => document.getElementById("fileUpload").click()}
          size="sm"
        >
          <IoCloudUploadOutline color="white" size={32} />
          <h5 className="m-0">Upload A File</h5>
        </Button>
      </Form.Label>
      <ToastContainer className="p-3" position="top-end" style={{ zIndex: 1 }}>
        <Toast autohide delay={2000} show={showToast} onClose={() => setShowToast(false)}>
          <Toast.Header>
            <AiOutlineRobot color="cyan" className="rounded me-2" />
            <strong className="me-auto">BridgesWriter</strong>
            <small>{toastInfo.timestamp}</small>
          </Toast.Header>
          <Toast.Body>
            <p>Uploaded File: {toastInfo.file_name}</p>
            <p>{toastInfo.message}</p>
          </Toast.Body>
        </Toast>
      </ToastContainer>
      <Accordion defaultActiveKey={['0', '1']} alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Selected Files</Accordion.Header>
          <Accordion.Body>
            <ListGroup>
                {[...selected_files]?.map((item, index) => {
                    return <FileContainer key={index} file_name={item} start_selected={true} removeAFile={removeFile}/>
                })}
            </ListGroup>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
            <Accordion.Header>All Files Uploaded</Accordion.Header>
            <Accordion.Body>
                <ListGroup>
                    {allFiles?.map((item, index) => {
                        return <FileContainer key={index} file_name={item} start_selected={false} removeAFile={removeFile}/>
                    })}
                </ListGroup>
            </Accordion.Body>
          </Accordion.Item>
      </Accordion>
    </Col>
  );
};

export default FileManager;

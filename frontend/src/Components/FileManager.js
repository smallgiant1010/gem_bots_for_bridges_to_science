import Form from "react-bootstrap/Form";
import { IoCloudUploadOutline } from "react-icons/io5";
import Button from "react-bootstrap/esm/Button";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useChatContext } from "../Context/ChatContext";
import { Accordion, ListGroup } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import FileContainer from "./FileContainer";
import Loading from "./Loading";
import { useToastContext } from "../Context/ToastContext";
import { baseAPIUrl } from "../Constants/constants";

const FileManager = () => {
  const { selected_files, dispatch } = useChatContext();
  const [allFiles, setAllFiles] = useState([]);
  const { addToast } = useToastContext();

  const get_all_files = useCallback(async() => {
    try {
      let response = await fetch(baseAPIUrl + "/api/v1/get_files");
      if(!response.ok) {
        throw new Error("ERROR: Server Down. Please Contact Developer.");
      }
      const all_files_api_call = await response.json();

      response = await fetch(baseAPIUrl + "/api/v1/get_current_files_in_store");
      if(!response.ok) {
        throw new Error("ERROR: Server Down. Please Contact Developer.");
      }
      const all_selected_files = await response.json();

      setAllFiles(prev => all_files_api_call["files"]);
      dispatch({
          "type": "ADD_MULTIPLE_FILES",
          "payload": {
              "file_names": all_selected_files["results"]
          }
      });
    }
    catch(err) {
      addToast({
        "id": new Date().toISOString(),
        "message": err
      });
    }
  }, [dispatch, addToast]);

  useEffect(() => {
    get_all_files();
  }, [get_all_files]);

  const removeFile = useCallback((file_name) => {
    setAllFiles(prev => prev.filter(name => name !== file_name));
  }, []);

  const handleFile = async (e) => {
    e.preventDefault();
    const selectedFile = e.target.files[0];
    const formData = new FormData();
    formData.append("file", selectedFile);
    const response = await fetch(baseAPIUrl + "/api/v1/upload_file", {
      method: "POST",
      body: formData,
    });
    if(!response.ok) {
      addToast({
        id: new Date().toISOString(),
        message: "ERROR: Cannot Interpret File."
      });
      return;
    }
    const apiCall = await response.json();
    if (apiCall["function_call_success"]) {
      addToast({
        id: apiCall["timestamp"],
        message: `I Got ${selectedFile.name}! ☺️`,
      });
      dispatch({
        type: "ADD_SELECTED_FILE",
        payload: {
          file_name: selectedFile.name,
        },
      });
      setAllFiles(prev => [...prev, selectedFile.name]);
    } else {
      addToast({
        id: new Date().toISOString(),
        message: `I Already Have this File! 😠`,
      });
    }
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
      <Accordion defaultActiveKey={['0', '1']} alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Selected Files</Accordion.Header>
          <Accordion.Body>
            <ListGroup>
              <Suspense fallback={<Loading />}>
                {[...selected_files]?.map((item, index) => {
                      return <FileContainer key={index} file_name={item} start_selected={true} removeAFile={removeFile}/>
                  })}
              </Suspense>
            </ListGroup>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
            <Accordion.Header>All Files Uploaded</Accordion.Header>
            <Accordion.Body>
                <ListGroup>
                  <Suspense fallback={<Loading />}>
                    {allFiles?.map((item, index) => {
                          return <FileContainer key={index} file_name={item} start_selected={false} removeAFile={removeFile}/>
                      })}
                  </Suspense>
                </ListGroup>
            </Accordion.Body>
          </Accordion.Item>
      </Accordion>
    </Col>
  );
};

export default FileManager;

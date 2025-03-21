from fastapi import FastAPI, UploadFile
from pydantic import BaseModel
from chat_model import ChatBot
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

chatbot = ChatBot(
    connection_string=str(os.environ.get("MONGODB_URI")), 
    db_name="langchain_testing", 
    document_collection_name="all_documents",
    vector_store_collection_name="vector_store",
    vector_search_index_name="langchain-test-vector-store-index",
    embedding_length=1024
    )

class Files_To_Be_Removed(BaseModel):
    file_names: list[str] = []

# Upload A file
@app.post("/api/v1/upload_file")
async def post_upload_file(file: UploadFile):
    file_extension = os.path.splitext(str(file.filename))[1].lower()
    match file_extension:
        case ".pdf":
            content = chatbot.pdf_handler(file)
        case ".docx":
            content = await chatbot.docx_handler(file)
        case ".txt":
            content = await chatbot.plain_text_handler(file)
        case _:
            return {
                "message": f"File does not exist: {file.filename}"
            }
    return chatbot.upload_file_llm(content)
    # return chatbot.pdf_handler(file)

# Delete A File
@app.delete("/api/v1/delete_file{file_name}")
async def delete_files(file_name: str):
    return chatbot.delete_document(file_name=file_name)

# Remove From Vector Store
@app.delete("/api/v1/remove_files")
async def remove_files(file_names: Files_To_Be_Removed):
    return chatbot.remove_from_vector_store(file_names=file_names.file_names)

# Retrieve All Files From Mongo
@app.get("/api/v1/get_files")
async def get_files():
    return chatbot.retrieve_mongo_files()

# Send LLM Message

# Create New Chat Session

# Delete New Chat Session

# Switch New Chat Session




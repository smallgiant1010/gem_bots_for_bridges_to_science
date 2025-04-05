import bcrypt
from fastapi import FastAPI, UploadFile
from pydantic import BaseModel
from chat_model import ChatBot
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost",
    os.environ.get("PRODUCTION_URL")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


chatbot = ChatBot(
    connection_string=str(os.environ.get("PRODUCTION_MONGODB_URI")), 
    db_name="bridges_writer_db", 
    document_collection_name="all_documents",
    vector_store_collection_name="vector_store",
    vector_search_index_name="gemini-vector-store-index",
    embedding_length=768
    )

class Files_To_Be_Removed(BaseModel):
    file_names: list[str] = []

class Chat_Rename(BaseModel):
    old_name: str
    new_name: str

# @app.post("/api/v1/hash_password")
# async def hash_password(password):
#     salt = bcrypt.gensalt()
#     hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt=salt)

#     return {
#         "password": password,
#         "hashed_password": hashed_password
#     }

@app.post("/api/v1/compare_password")
async def post_password(password):
    input_password = password.encode('utf-8')
    hashed_password = str(os.environ.get("ACCESS_CODE_HASHED")).encode("utf-8")
    check = bcrypt.checkpw(input_password, hashed_password)
    return {
        "check": check
    }

# Upload A file
@app.post("/api/v1/upload_file")
async def post_upload_file(file: UploadFile):
    file_extension = os.path.splitext(str(file.filename))[1].lower()
    match file_extension:
        case ".pdf":
            content = chatbot.pdf_handler(file)
        case ".docx":
            content = await chatbot.docx_handler(file)
        case ".txt" | ".md":
            content = await chatbot.plain_text_handler(file)
        case ".odt":
            content = await chatbot.rtf_handler(file)
        case ".rtf":
            content = await chatbot.rtf_handler(file)
        case _:
            return {
                "message": f"File does not exist: {file.filename}"
            }
    return chatbot.upload_file_llm(content)

# Add To Vector Store
@app.post("/api/v1/add_to_vector_store")
async def add_files(file_names: Files_To_Be_Removed):
    return chatbot.add_documents_to_vector_store(file_names.file_names)

# Delete A File
@app.delete("/api/v1/delete_file/{file_name}")
async def delete_files(file_name: str):
    return chatbot.delete_document(file_name=file_name)

# Remove From Vector Store
@app.delete("/api/v1/remove_files")
async def remove_files(file_names: Files_To_Be_Removed):
    return chatbot.remove_from_vector_store(file_names.file_names)

# Retrieve From Vector Store
@app.get("/api/v1/get_current_files_in_store")
async def get_all_files_in_vector_store():
    return chatbot.get_all_files_in_vector_store()

# Retrieve All Files From Mongo
@app.get("/api/v1/get_files")
async def get_files():
    return chatbot.retrieve_mongo_files()

# Send LLM Message
@app.post("/api/v1/message_llm")
async def send_message(query: str):
    # print(query)
    return chatbot.message_llm(query)

# Rename LLM
@app.patch("/api/v1/rename_chat")
async def rename_chat(chat_changes: Chat_Rename):
    return chatbot.rename_chat_session(chat_changes.old_name, chat_changes.new_name)

# Create New Chat Session
@app.post("/api/v1/create_new_session")
async def create_new_session():
    return chatbot.create_new_chat_session()

# Delete New Chat Session
@app.delete("/api/v1/delete_session/{session_name}")
async def delete_chat_session(session_name: str):
    # print(session_name)
    return chatbot.delete_chat_session(session_name)

# Switch New Chat Session
@app.get("/api/v1/switch_chat_session/{session_name}")
async def switch_chat_session(session_name: str):
    # print(session_name)
    return chatbot.get_chat_session(session_name)

# Get Latest Chat Session
@app.get("/api/v1/get_latest_chat_session")
async def get_latest_chat_session():
    return chatbot.get_latest_chat_session()

# Get All Chat Names
@app.get("/api/v1/get_chat_names")
async def get_chat_names():
    return chatbot.get_all_chat_session_names()




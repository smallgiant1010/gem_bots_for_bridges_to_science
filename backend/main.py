import bcrypt
from fastapi import FastAPI, UploadFile
from pydantic import BaseModel
from chat_model import ChatBot
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

uptime_robot_ip_addresses = [
    "216.144.250.150", "69.162.124.226", "69.162.124.227", "69.162.124.228",
    "69.162.124.229", "69.162.124.230", "69.162.124.231", "69.162.124.232",
    "69.162.124.233", "69.162.124.234", "69.162.124.235", "69.162.124.236",
    "69.162.124.237", "69.162.124.238", "63.143.42.242", "63.143.42.243",
    "63.143.42.244", "63.143.42.245", "63.143.42.246", "63.143.42.247",
    "63.143.42.248", "63.143.42.249", "63.143.42.250", "63.143.42.251",
    "63.143.42.252", "63.143.42.253", "216.245.221.82", "216.245.221.83",
    "216.245.221.84", "216.245.221.85", "216.245.221.86", "216.245.221.87",
    "216.245.221.88", "216.245.221.89", "216.245.221.90", "216.245.221.91",
    "216.245.221.92", "216.245.221.93", "208.115.199.18", "208.115.199.19",
    "208.115.199.20", "208.115.199.21", "208.115.199.22", "208.115.199.23",
    "208.115.199.24", "208.115.199.25", "208.115.199.26", "208.115.199.27",
    "208.115.199.28", "208.115.199.29", "208.115.199.30", "216.144.248.18",
    "216.144.248.19", "216.144.248.20", "216.144.248.21", "216.144.248.22",
    "216.144.248.23", "216.144.248.24", "216.144.248.25", "216.144.248.26",
    "216.144.248.27", "216.144.248.28", "216.144.248.29", "216.144.248.30",
    "46.137.190.132", "122.248.234.23", "167.99.209.234", "178.62.52.237",
    "54.79.28.129", "54.94.142.218", "104.131.107.63", "54.67.10.127",
    "54.64.67.106", "159.203.30.41", "46.101.250.135", "18.221.56.27",
    "52.60.129.180", "159.89.8.111", "146.185.143.14", "139.59.173.249",
    "165.227.83.148", "128.199.195.156", "138.197.150.151", "34.233.66.117",
    "52.70.84.165", "54.225.82.45", "54.224.73.211", "3.79.92.117",
    "3.21.136.87", "35.170.215.196", "35.153.243.148", "18.116.158.121",
    "18.223.50.16", "54.241.175.147", "3.212.128.62", "52.22.236.30",
    "54.167.223.174", "3.12.251.153", "52.15.147.27", "18.116.205.62",
    "3.20.63.178", "13.56.33.4", "52.8.208.143", "34.198.201.66",
    "35.84.118.171", "44.227.38.253", "35.166.228.98", "99.80.173.191",
    "99.80.1.74", "3.111.88.158", "13.127.188.124", "18.180.208.214",
    "54.249.170.27", "3.105.190.221", "3.105.133.239", "78.47.98.55",
    "157.90.155.240", "49.13.24.81", "168.119.96.239", "157.90.156.63",
    "88.99.80.227", "49.13.134.145", "49.13.130.29", "168.119.53.160",
    "142.132.180.39", "49.13.164.148", "128.140.106.114", "78.47.173.76",
    "159.69.158.189", "128.140.41.193", "167.235.143.113", "49.13.167.123",
    "78.46.215.1", "78.46.190.63", "168.119.123.75", "135.181.154.9",
    "37.27.87.149", "37.27.34.49", "37.27.82.220", "65.109.129.165",
    "37.27.28.153", "37.27.29.68", "37.27.30.213", "65.109.142.78",
    "65.109.8.202", "5.161.75.7", "5.161.61.238", "5.78.87.38", "5.78.118.142"
]


origins = ["http://localhost", os.environ.get("PRODUCTION_URL")] + uptime_robot_ip_addresses

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

@app.get("/api/v1/")
def ping_network():
    return {
        "isAlive": True
    }

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




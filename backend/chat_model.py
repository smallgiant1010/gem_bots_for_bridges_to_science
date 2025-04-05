from datetime import datetime
import os
from uuid import uuid4
from langchain_core.documents import Document
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv
from pymongo import MongoClient
from langchain.chains.history_aware_retriever import create_history_aware_retriever 
from langchain.chains.retrieval import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
import pymongo.errors
from file_handler import CustomFileHandler
from chunkedPrompts import SystemPrompts

load_dotenv()

class ChatBot(CustomFileHandler):
    def __init__(self, connection_string: str, db_name, document_collection_name, vector_store_collection_name, vector_search_index_name, embedding_length):
        # self.model = ChatOllama(model="mistral")
        # self.embeddings_model = OllamaEmbeddings(model="bge-large")
        self.model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-lite")
        self.embeddings_model = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
        self.mongo_client = MongoClient(connection_string)
        self.mongo_current_db = self.mongo_client[db_name]
        self.mongo_all_documents_collection = self.mongo_current_db[document_collection_name]
        self.vector_store_collection = self.mongo_current_db[vector_store_collection_name]
        self.index_name = vector_search_index_name
        self.mongo_vector_store = MongoDBAtlasVectorSearch(
            collection=self.vector_store_collection,
            embedding=self.embeddings_model,
            index_name=self.index_name,
            relevance_score_fn="cosine"
        )
        self.mongo_current_chat_histories = self.mongo_current_db["chat_histories"]
        self.number_of_chats = self.mongo_current_chat_histories.count_documents({})
        self.current_chat_name = None
        self.retriever = self.mongo_vector_store.as_retriever()

        # Create Search Index
        self.create_search_index(embedding_length)

        # Initialize Chat
        self.get_latest_chat_session()

        # Initialize Basic Prompting
        history_retriever = self.initialize_history_aware_retriever()
        question_retriever = self.create_question_answer_chain()

        # Create Rag Chain
        self.rag_chain = create_retrieval_chain(history_retriever, question_retriever)

    # -----Vector Store------

    # Retrieve From Vector Store
    def set_current_file_names(self):
        result = self.vector_store_collection.distinct("file_name")

        if not result:
            return {
                "error": "No Files Currently Added",
                "function_call_success": False
            }
        
        update = self.mongo_current_chat_histories.update_one({ "chat_name" : self.current_chat_name }, { "$set": { "file_names": [result]}})
        
        return {
            "file_names": result,
            "function_call_success": update.acknowledged
        }
    
    # Create Vector Search Index
    def create_search_index(self, embedding_length):
        try:
            self.mongo_vector_store.create_vector_search_index(dimensions=embedding_length)
        except pymongo.errors.OperationFailure:
            return
        
     # Add To Vector Store
    def add_documents_to_vector_store(self, file_names):
        file_exists = list(self.vector_store_collection.find({ "file_name": { "$in": file_names}}))
        if file_exists:
            return {
                "error": "File is Already In the Vector Store",
                "function_call_success": False
            }
        documents = list(self.mongo_all_documents_collection.find({ "file_name": { "$in": file_names }}))
        if not documents:
            return {
                "error": "Can't Find Documents In the Database",
                "function_call_success": False
            }
        document_list = []
        for document in documents:
            for j, page in enumerate(document["page_contents"]):
                text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
                chunks = text_splitter.split_text(page)
                document_list.extend([Document(page_content=chunk, metadata={ "file_name": document["file_name"], "page_number" : j + 1 }) for chunk in chunks])

        ids = [str(uuid4()) for _ in range(len(document_list))]
        self.mongo_vector_store.add_documents(documents=document_list, ids=ids)
        self.retriever = self.mongo_vector_store.as_retriever()
        return {
            "Operation Status": f"{len(ids)} chunks added to Vector Store",
            "function_call_success": True
        }
    
    # Remove From Vector Store
    def remove_from_vector_store(self, file_names: list[str]):
        results = []
        for name in file_names:
            chunks_exists = self.mongo_vector_store.collection.find_one({ "file_name" : name})
            if not chunks_exists:
                results.append({
                    "error" : f"{name} chunks are not present in the vector store",
                    "function_call_success" : False
                })
                continue
            
            delete_result = self.mongo_vector_store.collection.delete_many({ "file_name" : name })
            results.append({
                "Operation Status": delete_result.acknowledged,
                "Number Of Chunks Deleted": delete_result.deleted_count
            })
        self.retriever = self.mongo_vector_store.as_retriever()
        return {
            "results" : results,
            "function_call_success" : True
        }
    
    def get_all_files_in_vector_store(self):
        results = self.vector_store_collection.distinct("file_name")
        return {
            "results": results,
            "function_call_success": True
        }
    
    # -----Document Collection-----

    # Uploading Files
    def upload_file_llm(self, extracted_content):
        file_name = extracted_content["file_name"]
        # Check For existence of File
        matches = self.mongo_all_documents_collection.find_one({ "file_name": file_name})
        if matches:
            return {
                "error": "Files already exist",
                "function_call_success": False
            }
        
        # Insert New File
        new_file = self.mongo_all_documents_collection.insert_one({
                "file_name": file_name,
                "page_count": len(extracted_content["pages"]),
                "page_contents": [],
                "timestamp": datetime.now().isoformat()
            })

        documents = []
        page_contents = []
        for page in extracted_content["pages"]:
            # Add to Page Content
            page_contents.append(page["page_content"])

            # Chunking Text
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
            chunks = text_splitter.split_text(page["page_content"])

            # Create Documents
            new_documents = [Document(page_content=chunk, metadata={ "file_name": file_name, "page_number" : page["page_number"] }) for chunk in chunks]
            print(new_documents)
            documents.extend(new_documents)

        result = self.mongo_all_documents_collection.update_one(
            { "file_name": file_name},
            { "$push": { "page_contents" : { "$each" : page_contents }}}
        )

        ids = [str(uuid4()) for _ in range(len(documents))]
        print("----Adding Documents----")
        self.mongo_vector_store.add_documents(documents=documents,ids=ids)
        print("----Finished Adding Documents----")
        self.retriever = self.mongo_vector_store.as_retriever()
        return {
            "results": [{
                "Operation Status": result.acknowledged,
                "Operation Id" : str(new_file.inserted_id)
            }],
            "timestamp": datetime.now().isoformat(),
            "function_call_success" : True
        }
    
    # Deleting Files
    def delete_document(self, file_name: str):
        file_exists = self.mongo_all_documents_collection.find_one({ "file_name" : file_name })
        if not file_exists:
            return {
                "error": f"{file_name} Does Not Exist",
                "function_call_success": False
            }
        delete_result_of_documents = self.mongo_all_documents_collection.delete_many({ "file_name": file_name})
        delete_result_of_embeddings = self.mongo_vector_store.collection.delete_many({ "file_name" : file_name })
        self.retriever = self.mongo_vector_store.as_retriever()
        return {
            "all_documents_collection": f"Operational Status: {delete_result_of_documents.deleted_count} documents were deleted from all_documents collection",
            "vector_store_collection" : f"Operational Status: {delete_result_of_embeddings.deleted_count} documents were deleted from vector_store collection",
            "function_call_success": True
        }
    

    # Retrieving All Files From Mongo
    def retrieve_mongo_files(self):
        all_files = list(self.mongo_all_documents_collection.find({}))
        if not all_files:
            return {
                "files": [],
                "function_call_success": True
            }
        
        file_names = [file["file_name"] for file in all_files]
        return {
            "files": file_names,
            "function_call_success": True
        }
    
    # -----RAG LLM-----

    # Create A History Aware Retriever
    def initialize_history_aware_retriever(self):
        contextualize_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", SystemPrompts.CONTEXTUALIZE),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}")
            ]
        )
        history_aware_retriever = create_history_aware_retriever(
            llm=self.model,
            retriever=self.retriever,
            prompt=contextualize_prompt
        )
        return history_aware_retriever
    
    # Feed Persona Into LLM
    def create_question_answer_chain(self):
        system_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", SystemPrompts.PERSONA),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}")
            ]
        )

        question_answer_chain = create_stuff_documents_chain(llm=self.model, prompt=system_prompt)

        return question_answer_chain
    
    # Create Langchain Chat_History
    def initialize_chat_history(self):
        chat_session = self.mongo_current_chat_histories.find_one({ "chat_name": self.current_chat_name})
        if chat_session:
            message_history = chat_session.get("messages", [])
            self.langchain_history = [
                (message["type"], message["message"]) for message in message_history]
        else:
            self.langchain_history = []
    
    # LLM Messaging
    def message_llm(self, human_message: str):
        result = self.rag_chain.invoke({ "input": human_message, "chat_history": self.langchain_history })
        ai_message = result["answer"]

        self.langchain_history.append(("human", human_message))
        self.langchain_history.append(("system", ai_message))
        file_names = self.vector_store_collection.distinct("file_name")

        self.mongo_current_chat_histories.update_one({ "chat_name": self.current_chat_name }, {
            "$push": { "messages" : { "$each" : [{
                "type": "human",
                "message": human_message,
                "file_names": file_names,
                "timestamp": datetime.now().isoformat()
            }, {
                "type": "ai",
                "message": ai_message,
                "file_names": file_names,
                "timestamp": datetime.now().isoformat()
            }] } }
        })

        self.set_current_file_names()
        return {
            "type": "ai",
            "message": ai_message,
            "file_names": [],
            "timestamp": datetime.now().isoformat()
        }

    # -----Chat Sessions-----

    # Get All Chat Session Names
    def get_all_chat_session_names(self):
        chats_exist = list(self.mongo_current_chat_histories.find({}, sort=[('_id', -1)]))
        if not chats_exist:
            return {
                "chat_names": [],
                "function_call_success": False
            }
        chat_names = [chat.get("chat_name", "") for chat in chats_exist]
        return {
            "chat_names": chat_names,
            "function_call_success": True
        }

    # Get Latest Chat Session
    def get_latest_chat_session(self):
        if not self.current_chat_name:
            new_latest = self.mongo_current_chat_histories.find_one({}, sort=[('_id', -1)])

            if new_latest:
                self.current_chat_name = new_latest["chat_name"]
            else:
                result = self.create_new_chat_session()
                self.current_chat_name = result["new_chat_name"]["chat_name"]
        self.initialize_chat_history()
        chat_exists = self.mongo_current_chat_histories.find_one({}, sort=[('_id', -1)])
        if not chat_exists:
            return {
                "error": "Can't retrieve latest chat session",
                "function_call_success": False
            }
        messages = chat_exists.get("messages", [])
        file_names = chat_exists.get("file_names", [])
        return {
            "chat_name": chat_exists["chat_name"],
            "messages": messages,
            "file_names": file_names,
            "function_call_success": True
        }

    # Get Chat Session
    def get_chat_session(self, chat_name):
        chat_exists = self.mongo_current_chat_histories.find_one({ "chat_name": chat_name })
        if not chat_exists:
            return {
                "error": "Chat Does Not Exist",
                "function_call_success": False
            }
        self.current_chat_name = chat_name
        self.initialize_chat_history()
        messages = chat_exists.get("messages", [])
        file_names = chat_exists.get("file_names", [])
        history_retriever = self.initialize_history_aware_retriever()
        question_retriever = self.create_question_answer_chain()
        self.rag_chain = create_retrieval_chain(history_retriever, question_retriever)
        return {
            "chat_name": chat_name,
            "messages": messages,
            "file_names": file_names,
            "function_call_success": True
        }

    # Create New Chat Session
    def create_new_chat_session(self):
        result = self.mongo_current_chat_histories.insert_one({
            "chat_name": f"new_chat_{str(uuid4())}",
            "messages": [{
                "type" : "ai",
                "message": "How can I help you?",
                "file_names": [],
                "timestamp": datetime.now().isoformat()
            }],
            "timestamp": datetime.now().isoformat()
        })
        if result.acknowledged:
            self.number_of_chats += 1
            self.current_chat_name = self.get_latest_chat_session()
            self.initialize_chat_history()
            history_retriever = self.initialize_history_aware_retriever()
            question_retriever = self.create_question_answer_chain()
            self.rag_chain = create_retrieval_chain(history_retriever, question_retriever)

        return {
            "new_chat_name": self.current_chat_name,
            "current_number_of_chats": self.number_of_chats,
            "function_call_success": result.acknowledged,
            "Operation Id": str(result.inserted_id)
        }
    
    # Rename Chat Session
    def rename_chat_session(self, chat_name, new_name):
        renamed_chat_exists = self.mongo_current_chat_histories.find_one({ "chat_name": new_name })
        if renamed_chat_exists:
            return {
                "error": "Cannot rename to new name",
                "function_call_success": False
            }
        chat_exists = self.mongo_current_chat_histories.find_one({ "chat_name": chat_name })
        if not chat_exists:
            return {
                "error": "Chat Does Not Exist",
                "function_call_success": False
            }
        result = self.mongo_current_chat_histories.update_one({ "chat_name": chat_name }, { "$set": {"chat_name": new_name} })
        self.current_chat_name = self.get_latest_chat_session()
        return {
            "Operation Status": f"{result.modified_count} were renamed to {new_name}",
            "function_call_success": True
        }

    # Delete Chat Session
    def delete_chat_session(self, chat_name):
        chat_exists = self.mongo_current_chat_histories.find_one({ "chat_name": chat_name })
        if not chat_exists:
            return {
                "error": "Chat Does Not Exist",
                "function_call_success": False
            }
        result = self.mongo_current_chat_histories.delete_one({ "chat_name": chat_name})
        self.number_of_chats -= 1 if result.acknowledged else 0
        self.current_chat_name = self.mongo_current_chat_histories.find_one({}, sort=[('_id', -1)])
        self.initialize_chat_history()
        return {
            "Operation Status": f"{chat_name} session has been successfully deleted",
            "function_call_success": True
        }

if __name__ == "__main__":
    chatbot = ChatBot(
    connection_string=str(os.environ.get("MONGODB_URI")), 
    db_name="langchain_testing", 
    document_collection_name="all_documents",
    vector_store_collection_name="vector_store",
    vector_search_index_name="gemini-vector-store-index",
    embedding_length=768
    )
    print(chatbot.get_all_chat_session_names())
    print(chatbot.current_chat_name)
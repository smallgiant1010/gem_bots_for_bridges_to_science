import { createContext, useReducer, useContext } from "react";

export const ChatContext = createContext();

const ChatContextReducer = (state, action) => {
    switch (action.type) {
        case "RENAME_CHAT":
            const index = state.chats.indexOf(action.payload.old_name);
            if(index === -1) return state;
            return {
                ...state,
                chats: state.chats.map((v, i) => (i === index ? action.payload.new_name : v)),
                current_chat: state.current_chat !== action.payload.old_name ? action.payload.new_name : action.payload.old_name
            } 
        case "CHANGE_CHAT":
            return {
                ...state,
                current_chat: action.payload.chat_name,
                messages: action.payload.messages,
            };
        case "UPDATE_CHATS":
            return { ...state, chats: [...action.payload.chat_names] };
        case "ADD_CHAT":
            return { ...state, chats: [action.payload.chat_name, ...state.chats] };
        case "REMOVE_CHAT":
            return {
                ...state,
                chats: state.chats.filter((chat) => chat !== action.payload.chat_name),
            };
        case "ADD_SELECTED_FILE":
            const addedSet = new Set(state.selected_files);
            addedSet.add(action.payload.file_name);
            return { ...state, selected_files: addedSet };
        case "ADD_MULTIPLE_FILES":
            const addedMultipleSet = new Set(state.selected_files);
            action.payload.file_names.forEach((file_name) =>
                addedMultipleSet.add(file_name)
            );
            return { ...state, selected_files: addedMultipleSet };
        case "ADD_MESSAGE":
            return {
                ...state,
                messages: [...state.messages, action.payload.message],
            };
        case "REMOVE_FILE":
            const removedSet = new Set(state.selected_files);
            removedSet.delete(action.payload.file_name);
            return { ...state, selected_files: removedSet };
        default:
            return state;
    }
};

export const ChatContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(ChatContextReducer, {
        current_chat: "",
        selected_files: new Set(),
        chats: [],
        messages: [],
    });
    return (
        <ChatContext.Provider value={{ ...state, dispatch }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("ChatContext must be used within a ChatContextProvider");
    }
    return context;
};

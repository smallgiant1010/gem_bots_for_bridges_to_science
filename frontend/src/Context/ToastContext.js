import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export const ToastContextProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (toast) => {
        setToasts(prev => [...prev, toast]);
    }

    const removeToast = (toastID) => {
        setToasts(prev => prev.filter(t => t.id !== toastID));
    }

    return (<ToastContext.Provider value={{ toasts, addToast, removeToast }}>
        {children}
    </ToastContext.Provider>);
}

export const useToastContext = () => {
    const toastContext = useContext(ToastContext);
    if(!toastContext) {
        throw new Error("ToastContext Must be used within a ToastContextProvider");
    }

    return toastContext;
}
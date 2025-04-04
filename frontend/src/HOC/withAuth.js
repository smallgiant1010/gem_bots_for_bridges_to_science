import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

const withAuth = (WrappedComponent) => {
    return (props) => {
        const navigate = useNavigate();
        const isAuthenticated = sessionStorage.getItem("access-token");

        useEffect(() => {
            if(isAuthenticated !== process.env.REACT_APP_FRONTEND_HASHED_ACCESS_CODE) {
                navigate("/");
            }
        }, [isAuthenticated, navigate]);

        return isAuthenticated ? <WrappedComponent {...props} /> : null;
    }
}

export default withAuth
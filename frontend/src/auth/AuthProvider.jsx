import { createContext, useEffect, useState } from "react";
import Loader from "../components/Loader";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 🔑 AuthProvider sirf check karega, refresh nahi
        const refreshToken = localStorage.getItem("refreshToken");
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <Loader
                label="Checking session..."
                containerClassName="min-h-screen bg-gray-50"
            />
        );
    }

    return (
        <AuthContext.Provider value={{}}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

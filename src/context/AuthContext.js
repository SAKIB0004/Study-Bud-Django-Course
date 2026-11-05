import {createContext, useEffect, useState} from "react";

import authService from "../services/api/authService";
import tokenStorage from "../services/storage/tokenStorage";

import userService from "../services/api/userService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    
    const updateProfile = async (userData) => {
        if (!user?.id) {
            throw new Error("You must be logged in to update your profile.");
        }

        const updatedUser = await userService.updateUser(user.id, userData);

        setUser((currentUser) => ({
            ...currentUser,
            ...updatedUser,
        }));

        return updatedUser;
    };


    useEffect(() => {
        const initializeAuth = async () => {
            const accessToken = tokenStorage.getAccessToken();
            const refreshToken = tokenStorage.getRefreshToken();

            if(!accessToken || !refreshToken){
                tokenStorage.clearTokens();
                setLoading(false);
                return;
            }

            try{
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser)

            }catch(error){
                console.error("Authentication initialization failed:", error);

                tokenStorage.clearTokens();
                setUser(null);

            }finally{
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for Expired sessions

        const handleSessionExpired = () => {
            setUser(null);
            setLoading(false);
        };

        window.addEventListener("auth:session-expired", handleSessionExpired);

        return () => {
            window.removeEventListener("auth:session-expired", handleSessionExpired);
        };   

    }, []);
    

    // Login function

    const login = async(credentials) => {
        const tokens = await authService.login(credentials);
        tokenStorage.setTokens(tokens);

        try{
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            return currentUser;

        }catch(error){
            tokenStorage.clearTokens();
            setUser(null);
            throw error;
        }

    };

    // Register function
    const register = async (userData) => {
        return await authService.register(userData);
    };

    // Logout function

    const logout = async () => {
        try{
            await authService.logout();
        }catch(error){
            console.error("Logout failed:", error);

        }finally{
            tokenStorage.clearTokens();
            setUser(null);
        }

    };

    const isAuthenticated = Boolean(user);

    const contextValue = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
    
}

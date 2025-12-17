import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const AuthContext = createContext(null);

// CHANGE THIS TO YOUR LOCAL IP
const API_URL = 'http://192.168.1.45:8000/api';

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored token on startup
        const bootstrapAsync = async () => {
            let token;
            try {
                token = await SecureStore.getItemAsync('userToken');
            } catch (e) {
                console.error("Restoring token failed", e);
            }
            setUserToken(token);
            setIsLoading(false);
        };

        bootstrapAsync();
    }, []);

    const login = async (username, password) => {
        console.log(`Attempting login for ${username} to ${API_URL}/token/`);
        try {
            const response = await axios.post(`${API_URL}/token/`, {
                username,
                password
            }, { timeout: 5000 }); // 5s timeout

            console.log("Login response:", response.status);
            const { access, refresh } = response.data;

            await SecureStore.setItemAsync('userToken', access);
            await SecureStore.setItemAsync('refreshToken', refresh);

            setUserToken(access);
            return true;
        } catch (error) {
            console.error("Login failed details:", error.message);
            if (error.response) {
                console.error("Server Error:", error.response.data);
            } else if (error.request) {
                console.error("No response from server. Check IP and Network.");
            }
            return false;
        }
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('refreshToken');
        setUserToken(null);
    };

    return (
        <AuthContext.Provider value={{ userToken, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

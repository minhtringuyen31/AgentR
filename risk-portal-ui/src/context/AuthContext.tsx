import React, { createContext, useContext, useState, ReactNode } from "react";
import { RegistrationData } from "../types/RegistrationData";

interface AuthContextType {
    registerData: RegistrationData | null;
    setRegisterData: (registerData: RegistrationData) => void
}

interface AuthProviderProps {
    children: ReactNode;
  }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [registerData, setRegisterData] = useState<RegistrationData | null>(null);

    const value: AuthContextType = {
        registerData,
        setRegisterData,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthProvider = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

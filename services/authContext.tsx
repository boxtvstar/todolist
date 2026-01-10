import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                // Ensure persistence is set to LOCAL (survives browser restarts)
                await setPersistence(auth, browserLocalPersistence);
            } catch (error) {
                console.error("Auth initialization failed:", error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        initAuth();

        return () => unsubscribe();
    }, []);

    const login = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await setPersistence(auth, browserLocalPersistence);
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login failed:", error);
            alert("로그인에 실패했습니다. 팝업 차단이 되어있는지 확인해주세요.");
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center bg-[#0f1712] text-[#4ade80]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-xl font-bold animate-pulse">Emerald System Initializing...</div>
                        <div className="text-xs text-gray-500">인증 상태를 확인하고 있습니다...</div>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

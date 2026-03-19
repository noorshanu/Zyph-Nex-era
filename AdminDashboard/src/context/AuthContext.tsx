import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '../services';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (firstName: string, lastName: string, email: string, password: string, registerAsAdmin?: boolean) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from token on mount
    useEffect(() => {
        const verifyToken = async () => {
            const token = AuthService.getToken();
            if (token) {
                try {
                    const data = await AuthService.getMe();
                    if (data.success && data.data?.user?.role === 'admin') {
                        setUser(data.data.user);
                    } else {
                        AuthService.logout();
                    }
                } catch {
                    AuthService.logout();
                }
            }
            setIsLoading(false);
        };

        verifyToken();
    }, []);

    const signup = async (
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        registerAsAdmin: boolean = true
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const data = await AuthService.signup(firstName, lastName, email, password, registerAsAdmin);

            if (data.success) {
                if (data.data?.token && data.data?.user) {
                    setUser(data.data.user);
                }
                return { success: true };
            } else {
                return {
                    success: false,
                    error: data.errors?.[0]?.message || data.message || 'Signup failed'
                };
            }
        } catch (error: any) {
            return { success: false, error: error.message || 'Network error. Please try again.' };
        }
    };

    const login = async (
        email: string,
        password: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const data = await AuthService.login(email, password);

            if (data.success) {
                if (data.data.user?.role !== 'admin') {
                    AuthService.logout();
                    return {
                        success: false,
                        error: 'Admin access required. Only users with admin role can sign in here.',
                    };
                }

                setUser(data.data.user);
                return { success: true };
            } else {
                return {
                    success: false,
                    error: data.errors?.[0]?.message || data.message || 'Login failed'
                };
            }
        } catch (error: any) {
            return { success: false, error: error.message || 'Network error. Please try again.' };
        }
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                signup,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

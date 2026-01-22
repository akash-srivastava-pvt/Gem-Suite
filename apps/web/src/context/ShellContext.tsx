import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ShellContextType {
    headerActions: ReactNode | null;
    setHeaderActions: (actions: ReactNode | null) => void;
}

const ShellContext = createContext<ShellContextType | undefined>(undefined);

export const ShellProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [headerActions, setHeaderActions] = useState<ReactNode | null>(null);

    return (
        <ShellContext.Provider value={{ headerActions, setHeaderActions }}>
            {children}
        </ShellContext.Provider>
    );
};

export const useShell = () => {
    const context = useContext(ShellContext);
    if (!context) {
        throw new Error('useShell must be used within a ShellProvider');
    }
    return context;
};

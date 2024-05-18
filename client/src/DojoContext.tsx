import { ReactNode, createContext, useContext, useMemo } from "react";
import { Account, RpcProvider } from "starknet";
import { SetupResult } from "./dojo/setup";

import { Provider } from "./components/wallet/providers";

const DojoContext = createContext<DojoContextType | null>(null);

type DojoProviderProps = {
    children: ReactNode;
    value: SetupResult;
};

export const DojoProvider = ({ children, value }: DojoProviderProps) => {
    const currentValue = useContext(DojoContext);
    if (currentValue) throw new Error("DojoProvider can only be used once");

    /*const rpcProvider = useMemo(
        () =>
            new RpcProvider({
                nodeUrl:
                    import.meta.env.VITE_PUBLIC_NODE_URL ||
                    "http://localhost:5050",
            }),
        []
    );*/

    return (
            <DojoContext.Provider value={{ ...value }}>
                <Provider>
                    {children}
                </Provider>
            </DojoContext.Provider>
    );
};

export const useDojo = () => {
    const contextValue = useContext(DojoContext);
    if (!contextValue)
        throw new Error(
            "The `useDojo` hook must be used within a `DojoProvider`"
        );

    return {
        setup: contextValue
    };
};

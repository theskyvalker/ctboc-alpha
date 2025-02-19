import { createContext, ReactNode, useContext, useMemo } from "react";
import { BurnerAccount, useBurnerManager } from "@dojoengine/create-burner";
import { Account } from "starknet";

import { SetupResult } from "./setup";

interface DojoContextType extends SetupResult {
    masterAccount: Account;
    account: BurnerAccount;
}

export const DojoContext = createContext<DojoContextType | null>(null);

export const DojoProvider = ({
    children,
    value,
}: {
    children: ReactNode;
    value: SetupResult;
}) => {
    const currentValue = useContext(DojoContext);
    if (currentValue) {
        throw new Error("DojoProvider can only be used once");
    }

    console.log(value);

    const {
        config: { masterAddress, masterPrivateKey },
        dojoProvider
    } = value;

    const masterAccount = useMemo(
        () =>
            new Account(
                dojoProvider.provider,
                masterAddress,
                masterPrivateKey,
                "1"
            ),
        [masterAddress, masterPrivateKey, dojoProvider.provider]
    );

    return (
        <DojoContext.Provider
            value={{
                ...value,
                masterAccount,
                //@ts-ignore
                account: {
                    account: masterAccount,
                },
            }}
        >
            {children}
        </DojoContext.Provider>
    );
};
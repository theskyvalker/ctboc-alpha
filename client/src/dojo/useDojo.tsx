import { useContext } from "react";
import { DojoContext } from "./DojoContext";

export const useDojo = () => {
    const context = useContext(DojoContext);

    if (!context) {
        throw new Error(
            "The `useDojo` hook must be used within a `DojoProvider`"
        );
    }

    const { account, ...setup } = context;

    return {
        setup,
        account,
    };
};
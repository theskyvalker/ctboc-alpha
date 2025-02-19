import React from "react";
import { ToastOptions } from "react-toastify";

export const SELLSWORD_DEFAULT_STYLE = {
    left: "47%",
    right: "",
    transform: "none",
    filter: "none",
    display: "block"
};

const BASE_TOAST_STYLE: React.CSSProperties = {
    height: "173px",
    width: "274px",
    borderWidth: "2px",
    borderStyle: "solid",
    color: "black",
    textAlign: "center",
    opacity: 0.8,
};

export const DEFAULT_TOAST_STYLE_SUBSET: { [key: string]: React.CSSProperties } = {
    success: {
        ...BASE_TOAST_STYLE,
        backgroundColor: "green",
    },
    error: {
        ...BASE_TOAST_STYLE,
        backgroundColor: "lightcoral",
    },
    warning: {
        ...BASE_TOAST_STYLE,
        backgroundColor: "lightyellow",
    },
    info: {
        ...BASE_TOAST_STYLE,
        backgroundColor: "lightblue",
    },
};

export const DEFAULT_TOAST_STYLE: { [key: string]: ToastOptions } = {
    success: {
        style: DEFAULT_TOAST_STYLE_SUBSET.success,
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: true,
    },
    error: {
        style: DEFAULT_TOAST_STYLE_SUBSET.error,
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: true,
    },
    warning: {
        style: DEFAULT_TOAST_STYLE_SUBSET.warning,
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: true,
    },
    info: {
        style: DEFAULT_TOAST_STYLE_SUBSET.info,
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: true,
    },
};

export const GAME_STAGES = {
    0: "Enrollment",
    1: "Staging",
    2: "Battle",
    3: "End"
}

export const GENERAL_DEFAULT_COOLDOWN = 14400; // in seconds
export const SWORD_DEFAULT_COOLDOWN = 21400; // in seconds

export const GRAPHQL_ENDPOINT = "https://api.cartridge.gg/x/ctboc-sepolia/torii/graphql"
//export const GRAPHQL_ENDPOINT = "http://18.140.199.119:8080/torii/graphql"
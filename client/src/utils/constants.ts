import { ToastOptions } from "react-toastify";

export const SELLSWORD_DEFAULT_STYLE = {
    left: "47%",
    right: "",
    transform: "none",
    filter: "none",
    display: "block"
};

export const DEFAULT_TOAST_STYLE: ToastOptions = {
    style: {
      backgroundColor: "transparent", border: "none", boxShadow: "none",
      height: "173px",
      width: "274px",
      color: "white",
      textAlign: "center",
    },
    position: "bottom-center",
    bodyClassName: "toast-error",
    autoClose: 2000,
    hideProgressBar: true
};

export const GAME_STAGES = {
    0: "Enrollment",
    1: "Staging",
    2: "Battle",
    3: "End"
}

export const GRAPHQL_ENDPOINT = "https://api.cartridge.gg/x/ctboc-sepolia/torii/graphql"
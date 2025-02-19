import { create } from "zustand";
import React, { createRef } from 'react';
import { SELLSWORD_DEFAULT_STYLE } from "../utils/constants";

type State = {
  disconnected: boolean;
  setDisconnected: (value: boolean) => void;
  isWrongNetwork: boolean;
  setIsWrongNetwork: (value: boolean) => void;
  activeGameId: number;
  setActiveGameId: (value: number) => void;
  isBgmMuted: boolean;
  setIsBgmMuted: (value: boolean) => void;
  tutorialDialog: boolean;
  showTutorialDialog: (value: boolean) => void;
  showLogoMenu: boolean;
  setShowLogoMenu: (value: boolean) => void;
  showFortifyMenu: boolean;
  setShowFortifyMenu: (value: boolean) => void;
  showProfileMenu: boolean;
  setShowProfileMenu: (value: boolean) => void;
  showNickModal: boolean;
  setShowNickModal: (value: boolean) => void;
  ongoingAnimation: boolean;
  setOngoingAnimation: (value: boolean) => void;
  selectedCastle: "red" | "blue" | "";
  setSelectedCastle: (value: "red" | "blue" | "") => void;
  fortifyAmount: number;
  newNickname: string;
  setNewNickname: (value: string) => void;
  nickConfirmed: boolean;
  setNickConfirmed: (value: boolean) => void;
  showPayModal: boolean;
  setShowPayModal: (value: boolean) => void;
  setFortifyAmount: (value: number) => void;
  redHP: number;
  setRedHP: (value: number) => void;
  blueHP: number;
  setBlueHP: (value: number) => void;
  damageSouth: number;
  setDamageSouth: (value: number) => void;
  damageNorth: number;
  setDamageNorth: (value: number) => void;
  displayButtonsCastle: boolean;
  setDisplayButtonsCastle: (value: boolean) => void;
  displayButtonsSellsword: boolean;
  setDisplayButtonsSellsword: (value: boolean) => void;
  sellswordStyle: React.CSSProperties;
  setSellswordStyle: (value: React.CSSProperties) => void;
  gameNames: { [key: string]: string };
  setGameNames: (value: { [key: string]: string }) => void;
  pinnedGames: number[];
  setPinnedGames: (value: number[]) => void;
  walkBlueRef: React.MutableRefObject<any>;
  walkRedRef: React.MutableRefObject<any>;
  damageTextBlueRef: React.MutableRefObject<any>;
  damageTextRedRef: React.MutableRefObject<any>;
  attackBlueRef: React.MutableRefObject<any>;
  attackRedRef: React.MutableRefObject<any>;
  redCastleRef: React.MutableRefObject<any>;
  blueCastleRef: React.MutableRefObject<any>;
  blacksmithRef: React.MutableRefObject<any>;
  sharpenCoinRef: React.MutableRefObject<any>;
};

const useUIStore = create<State>((set) => ({
  disconnected: false,
  setDisconnected: (value) => set({ disconnected: value }),
  isWrongNetwork: false,
  setIsWrongNetwork: (value) => set({ isWrongNetwork: value }),
  activeGameId: 0,
  setActiveGameId: (value) => set({ activeGameId: value }),
  isBgmMuted: false,
  setIsBgmMuted: (value) => set({ isBgmMuted: value }),
  showLogoMenu: false,
  setShowLogoMenu: (value) => set({ showLogoMenu: value }),
  showFortifyMenu: false,
  setShowFortifyMenu: (value) => set({ showFortifyMenu: value }),
  fortifyAmount: 0,
  setFortifyAmount: (value) => set({ fortifyAmount: value }),
  showProfileMenu: false,
  setShowProfileMenu: (value) => set({ showProfileMenu: value }),
  showNickModal: false,
  setShowNickModal: (value) => set({ showNickModal: value }),
  newNickname: "",
  setNewNickname: (value) => set({ newNickname: value }),
  nickConfirmed: false,
  setNickConfirmed: (value) => set({ nickConfirmed: value }),
  showPayModal: false,
  setShowPayModal: (value) => set({ showPayModal: value }),
  tutorialDialog: false,
  showTutorialDialog: (value) => set({ tutorialDialog: value }),
  ongoingAnimation: false,
  setOngoingAnimation: (value) => set({ ongoingAnimation: value }),
  selectedCastle: "",
  setSelectedCastle: (value) => set({ selectedCastle: value }),
  redHP: 100,
  setRedHP: (value) => set({ redHP: value }),
  blueHP: 100,
  setBlueHP: (value) => set({ blueHP: value }),
  damageNorth: 0,
  setDamageNorth: (value) => set({ damageNorth: value }),
  damageSouth: 0,
  setDamageSouth: (value) => set({ damageSouth: value }),
  displayButtonsCastle: false,
  setDisplayButtonsCastle: (value) => set({ displayButtonsCastle: value }),
  displayButtonsSellsword: false,
  setDisplayButtonsSellsword: (value) => set({ displayButtonsSellsword: value }),
  sellswordStyle: SELLSWORD_DEFAULT_STYLE,
  setSellswordStyle: (value) => set({ sellswordStyle: value }),
  gameNames: {},
  setGameNames: (value) => set({gameNames: value}),
  pinnedGames: [],
  setPinnedGames: (value) => set({pinnedGames: value}),
  walkBlueRef: createRef(),
  walkRedRef: createRef(),
  damageTextBlueRef: createRef(),
  damageTextRedRef: createRef(),
  attackBlueRef: createRef(),
  attackRedRef: createRef(),
  redCastleRef: createRef(),
  blueCastleRef: createRef(),
  blacksmithRef: createRef(),
  sharpenCoinRef: createRef()
}));

export default useUIStore;
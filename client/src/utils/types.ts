import { GAME_STAGES } from "./constants";

export interface AttackResult {
    success: boolean;
    damage?: number;
}

export interface FortifyResult {
    success: boolean;
    castleHpIncrease?: number;
}

export type GameStageKey = keyof typeof GAME_STAGES;

export interface EventEmitted {
    id: string;
    data: string[];
    keys: string[];
    createdAt: string;
}

export interface SubscriptionResponse {
    eventEmitted: EventEmitted;
}

interface Trait {
    [key: string]: string | number;
    _id: number;
    img_data: string;
    name: string;
    rarity: number;
    subtype: string;
    type: string;
}

export interface Banner {
    wallet: string;
    ids: BannerIds;
    dataURL: string;
    tokenId: number;
}

interface BannerIds {
    [key: string]: number;
    background: number;
    pole: number;
    bannerfield: number;
    element: number;
    top: number;
    side: number;
    over: number;
}

export interface SelectedBannersPerGame {
    [gameId: number]: {
      red: number | null;
      blue: number | null;
    };
}  
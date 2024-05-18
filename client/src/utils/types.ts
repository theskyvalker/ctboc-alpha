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
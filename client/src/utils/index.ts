import { hexStringToUint8Array } from "@latticexyz/utils";
import { DeclareTransactionReceiptResponse, RejectedTransactionReceiptResponse, RevertedTransactionReceiptResponse } from "starknet";
import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";

export enum Direction {
    Left = 1,
    Right = 2,
    Up = 3,
    Down = 4,
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function updatePositionWithDirection(
    direction: Direction,
    value: { vec: { x: number; y: number } }
) {
    switch (direction) {
        case Direction.Left:
            value.vec.x--;
            break;
        case Direction.Right:
            value.vec.x++;
            break;
        case Direction.Up:
            value.vec.y--;
            break;
        case Direction.Down:
            value.vec.y++;
            break;
        default:
            throw new Error("Invalid direction provided");
    }
    return value;
}

export const GAME_STAGES: { [index: number]: string } = {
    0: 'Enrollment',
    1: 'Staging',
    2: 'Battle',
    3: 'End'
}

export function tryBetterErrorMessage(receipt: any): string {
    if (!receipt) return "";

    const regex = /Failure reason: (0x[0-9a-fA-F]+ \('([^']+)'\))/;
    const matches = (receipt as RevertedTransactionReceiptResponse).revert_reason?.match(regex);

    if (matches && matches[2]) {
        return matches[2];
    }

    return "";
}

export function processTxReceipt(receipt: DeclareTransactionReceiptResponse | RevertedTransactionReceiptResponse | RejectedTransactionReceiptResponse | undefined) {
if (receipt?.status == "REJECTED") {
    throw new Error("Transaction rejected");
    } else if (receipt?.execution_status == "REVERTED" && receipt?.execution_status == "ACCEPTED_ON_L2") {
        throw new Error(tryBetterErrorMessage(receipt) || "Transaction reverted");
    } else if (receipt?.finality_status == "ACCEPTED_ON_L2" && receipt?.execution_status == "SUCCEEDED") {
    return true;
    } else {
    throw new Error(receipt ? tryBetterErrorMessage(receipt) : "Transaction failed");
    }
}

export function hexToDecimal(hex: string): number {
    return parseInt(hex, 16);
}
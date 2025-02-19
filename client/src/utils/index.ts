import { hexStringToUint8Array } from "@latticexyz/utils";
import { DeclareTransactionReceiptResponse, GetTransactionReceiptResponse, RejectedTransactionReceiptResponse, RevertedTransactionReceiptResponse } from "starknet";
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

export function formatAddress(address: string) {
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
}

/*export function formatStartTime(hexTime: string) {
    const timestamp = parseInt(hexTime, 16);
    return new Date(timestamp * 1000).toLocaleString();
};*/

export function formatStartTime(hexTime: string): string {
    // Convert hex timestamp to a JavaScript Date object
    const timestamp = parseInt(hexTime, 16);
    const date = new Date(timestamp * 1000);

    // Convert month number to month name
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = monthNames[date.getMonth()];

    // Get day of the month
    const day = date.getDate();

    // Determine time of day based on hour
    const hour = date.getHours();
    let timeOfDay: string;
    if (hour >= 5 && hour < 8) {
        timeOfDay = "dawn";
    } else if (hour >= 8 && hour < 12) {
        timeOfDay = "morning";
    } else if (hour === 12) {
        timeOfDay = "midday";
    } else if (hour >= 13 && hour < 17) {
        timeOfDay = "afternoon";
    } else if (hour >= 17 && hour < 20) {
        timeOfDay = "evening";
    } else if (hour >= 20 && hour <= 23) {
        timeOfDay = "night";
    } else {
        timeOfDay = "twilight";
    }

    // Helper function to add ordinal suffix to the day
    function ordinal(n: number): string {
        if (n >= 11 && n <= 13) return `${n}th`;
        const lastDigit = n % 10;
        if (lastDigit === 1) return `${n}st`;
        if (lastDigit === 2) return `${n}nd`;
        if (lastDigit === 3) return `${n}rd`;
        return `${n}th`;
    }

    // Format the date as "Day of Month at timeOfDay" with ordinal
    const dayWithOrdinal = ordinal(day);
    return `${dayWithOrdinal} of ${monthName} at ${timeOfDay}`;
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

export function processTxReceipt(receipt: any) {
    console.log("We are inside processTxReceipt:", receipt);
    if (!receipt) {
        throw new Error("Failed to get transaction status.");
    }
    console.log(receipt.execution_status);
    if (receipt.execution_status === "REJECTED" ) {
        console.log("Error being shown");
        throw new Error("Transaction rejected");
    } else if (receipt.execution_status === "REVERTED") {
        console.log("Error being shown");
        throw new Error(tryBetterErrorMessage(receipt) || "Transaction reverted");
    } else if (receipt.execution_status === "SUCCEEDED") {
        return true;
    } else {
        console.log("Error being shown");
        throw new Error(receipt ? tryBetterErrorMessage(receipt) : "Transaction failed");
    }
}

export function hexToDecimal(hex: string): number {
    return parseInt(hex, 16);
}
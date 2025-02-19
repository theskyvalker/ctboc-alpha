// eventParsing.ts
import { BigNumberish } from "ethers";
import { setupNetwork } from "../dojo/setupNetwork";
import { EventEmitted } from "./types";
import { shortString } from "starknet";
import { GAME_STAGES } from "./constants";

// Initialize network and extract 'call'
const { call } = await setupNetwork();

// Now you can define 'get_nickname' using 'call'
export const get_nickname = async (gameId: string, address: string) => {
  try {
    // Perform a read-only call to get the nickname
    const nickname = await call('actions', 'get_nickname', [gameId.toString(), address]);
    // Return the fetched nickname
    return shortString.decodeShortString(nickname.toString());
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

export async function parseMessageByEventType(event: EventEmitted, eventType: string): Promise<
{
  eventText: string,
  castle: undefined | "north" | "south"
}> {
  const timestamp = new Date(event.createdAt).toLocaleString('en-GB', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(',', '');
  console.log("Event data: ", event);
  let playerNick;
  switch (eventType) {
    case 'Fortification':
      playerNick = get_nickname(event.data[1], event.data[0]);
      return {
        eventText: `[${timestamp}]: ${playerNick || event.data[0]} fortified `,
        castle: "south"
      }
    case 'PlayerNickname':
      if (event.data[2].length) {
        return {
          eventText: `[${timestamp}]: ${shortString.decodeShortString(event.data[2])} changed their nickname to ${shortString.decodeShortString(event.data[3])}`,
          castle: undefined
        }
      } else {
        return {
          eventText: `[${timestamp}]: ${event.data[0]} set their nickname as ${shortString.decodeShortString(event.data[3])}`,
          castle: undefined
        }
      }
    case 'GameStageChange':
      return {
        //@ts-ignore
        eventText: `[${timestamp}]: Game stage changed to ${GAME_STAGES[parseInt(event.data[1])]}`,
        castle: undefined
      }
    case 'Sharpen':
      playerNick = await get_nickname(event.data[1], event.data[0]);
      return {
        eventText: `[${timestamp}]: ${playerNick || event.data[0]} sharpened their sword!`,
        castle: undefined
      }
    case 'Attack':
      playerNick = await get_nickname(event.data[1], event.data[0]);
      const targetCastle = parseInt(event.data[2]) == 2 ? "South" : "North";
      return {
        eventText: `[${timestamp}]: ${playerNick || event.data[0]} attacked the ${targetCastle} castle for ${parseInt(event.data[3])} damage!`,
        //@ts-ignore
        castle: targetCastle.toLowerCase()
      }
    case 'Payment':
      const senderNickname = await get_nickname(event.data[0], event.data[1]);
      const receiverNickname = await get_nickname(event.data[0], event.data[2]);
      return {
        eventText: `[${timestamp}]: ${senderNickname || event.data[1]} paid ${parseInt(event.data[3])} gold to ${receiverNickname || event.data[2]}`,
        castle: undefined
      }
    default:
      return {
        eventText: ``,
        castle: undefined
      }
  }
}
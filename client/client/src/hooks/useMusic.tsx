import useSound from "use-sound";
import { useCallback, useEffect, useState, useRef } from "react";

const dir = "/bgm/";

export const musicSelector = {
  backgroundMusic: "8bit-music-for-game-68698.mp3",
  battle: "dance-of-devils-giulio-fazio-main-version-01-15-14356.mp3"
};

export const useMusic = (
  playState: { isMuted: boolean, isInBattle: boolean },
  options?: { volume?: number; loop?: boolean }
) => {
  const [music, setMusic] = useState<string>(musicSelector.backgroundMusic);
  const stopRef = useRef<() => void>();

  const [play, { stop }] = useSound(dir + music, {
    volume: options?.volume || 0.1,
    loop: options?.loop || false,
  });

  const start = useCallback(() => {
    play();
  }, [play]);

  const trackArray = [musicSelector.battle];

  useEffect(() => {
    if (stopRef.current) {
      stopRef.current();
    }
    stopRef.current = stop;

    console.log("music changed");

    if (playState.isInBattle) {
      setMusic(trackArray[Math.floor(Math.random() * trackArray.length)]);
    } else {
      setMusic(musicSelector.backgroundMusic);
    }
    start();
  }, [start, stop, playState.isInBattle]);

  useEffect(() => {
    if (playState.isMuted) {
      stop();
    } else {
      play();
    }
  }, [play, stop, playState.isMuted, playState.isInBattle]);

  return {
    play,
    stop,
  };
};
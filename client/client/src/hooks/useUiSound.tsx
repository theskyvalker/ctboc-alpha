import useSound from "use-sound";

const dir = "/sfx/";

export const soundSelector: {[key: string]: string} = {
    sword: "591155__ultraaxvii__sword-contact-with-swipe.wav",
    run: "running-on-sand-24847.mp3",
    damaged: "vibrating-thud-39536.mp3",
    duringSharpen: "hammering-on-anvil-71902.mp3",
    sharpenEnd: "success.mp3",
    paycoin: "coin-payout-1-188227.mp3",
    powerUp: "power-up-35839.mp3",
    sendcoins: "coin-flip-88793.mp3"
};

export const useUiSounds = (selector: string) => {
  const [play, { stop }] = useSound(dir + soundSelector[selector], {
    volume: 0.4,
  });

  return {
    play,
    stop
  };
};
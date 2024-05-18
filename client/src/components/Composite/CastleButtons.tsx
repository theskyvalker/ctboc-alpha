import Button from "../Button";
import { useUiSounds } from "../../hooks/useUiSound";
import useUIStore from "../../hooks/useUIStore";
import React from "react";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { AttackResult } from "../../utils/types";
import { DEFAULT_TOAST_STYLE, SELLSWORD_DEFAULT_STYLE } from "../../utils/constants";

interface CastleButtonsProps {
    castle: "red" | "blue";
    isGeneral: boolean | undefined;
    gold: number;
    attack: () => Promise<AttackResult>;
    fortify: () => Promise<boolean>;
}

export const CastleButtons: React.FC<CastleButtonsProps> = ({ castle, isGeneral, gold, attack, fortify }) => {

    const {
        setDisplayButtonsCastle,
        setSellswordStyle,
        walkBlueRef,
        walkRedRef,
        attackBlueRef,
        attackRedRef,
        damageTextBlueRef,
        damageTextRedRef,
        showFortifyMenu,
        setShowFortifyMenu,
        setIsBgmMuted,
        fortifyAmount,
        setFortifyAmount,
        setDamageNorth,
        setDamageSouth,
        ongoingAnimation,
        showLogoMenu,
        setOngoingAnimation,
        blueHP,
        redHP,
        setRedHP,
        setBlueHP,
        redCastleRef,
        blueCastleRef
    } = useUIStore();

    const walkSound = useUiSounds("run");
    const swordSound = useUiSounds("sword");
    const impactSound = useUiSounds("damaged");
    const fortifySound = useUiSounds("powerUp");

    const updateFortifyAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFortifyAmount(parseInt(event.target.value));
    };

    const resetSellsword = () => {
        if (ongoingAnimation || showLogoMenu) return;
        setSellswordStyle(SELLSWORD_DEFAULT_STYLE);
    }

    const toggleFortifyMenu = (event?: React.MouseEvent | React.PointerEvent) => {
        if (event) {
          event?.stopPropagation();
        }
        if (isGeneral) {
          setShowFortifyMenu(!showFortifyMenu);
        } else {
          toast.warning("Must be a general to fortify a castle", {
            position: "bottom-center",
            autoClose: 3000,
            hideProgressBar: true,
            style: {
              backgroundColor: "transparent",
              border: "none",
              boxShadow: "none",
              color: "white",
              height: "173px",
              width: "274px",
              textAlign: "center"
            }
          });
        }
      }

    const handleAttack = async (event: React.PointerEvent) => {
        event.stopPropagation();
        console.log("attack");
        setDisplayButtonsCastle(false);
        setOngoingAnimation(true);
        const toastId = toast.loading('Preparing to charge...', {
            position: "bottom-center",
            style: {
                backgroundColor: "transparent",
                border: "none",
                boxShadow: "none",
                color: "white",
                height: "173px",
                width: "274px",
                textAlign: "center",
            },
            autoClose: false});
        var damage = 0;
        try {
            const result = await attack();
            console.log("determined success");
            console.log(result);
            result.damage ? damage = result.damage : damage = 0;
            toast.dismiss(toastId);
            toast.success('Attack!!!', {
                autoClose: 2000,
                style: {
                    backgroundColor: "transparent", border: "none", boxShadow: "none",
                    height: "173px",
                    width: "274px",
                    color: "white",
                    textAlign: "center",
                },
                position: "bottom-center",
                icon: () => "⚔️",
                bodyClassName: "toast-success",
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true
            });
        } catch (reason: any) {
            console.log(reason);
            toast.dismiss(toastId);
            toast.error(reason.toString().replace("Error: ",""), DEFAULT_TOAST_STYLE);
        }
        if (!damage) {
            console.log("damage not non zero");
            setOngoingAnimation(false);
            return;
        }
        console.log("attack 2");
        setSellswordStyle({display: "none"});
        if (castle === "blue") {
            walkBlueRef.current.style.animation = 'spriteAnim 1.5s steps(8) infinite, moveAnimBlue 4s linear forwards';
            walkBlueRef.current.style.display = 'block';
            walkSound.play();
            walkBlueRef.current.addEventListener('animationend', function(e: any) {
                if (e.animationName === 'moveAnimBlue') {
                    walkSound.stop();
                    walkBlueRef.current.style.display = 'none';
                    attackBlueRef.current.style.display = 'block';
                    blueCastleRef.current.style.animation = 'flashAnim 1.8s';
                    setTimeout(() => {
                        swordSound.play();
                    }, 1200);
                    attackBlueRef.current.addEventListener('animationend', function(e: any) {
                        if (e.animationName === 'spriteAnimAttack') {
                            impactSound.play();
                            damageTextBlueRef.current.style.display = 'block';
                            attackBlueRef.current.style.display = 'none';
                            setOngoingAnimation(false);
                            setDamageNorth(damage);
                            setBlueHP(blueHP - damage);
                            resetSellsword();
                            //sellswordRef.current.style.display = 'block';
                            blueCastleRef.current.style.animation = '';
                        }
                    });
                    damageTextBlueRef.current.addEventListener('animationend', function(e: any) {
                        if (e.animationName === 'up') {
                            damageTextBlueRef.current.style.display = 'none';
                        }
                    });
                }
            });
        } else {
            walkRedRef.current.style.animation = 'spriteAnim 1.5s steps(8) infinite, moveAnimRed 4s linear forwards';
            walkRedRef.current.style.display = 'block';
            walkRedRef.current.addEventListener('animationend', function(e: any) {
                if (e.animationName === 'moveAnimRed') {
                    walkRedRef.current.style.display = 'none';
                    attackRedRef.current.style.display = 'block';
                    redCastleRef.current.style.animation = 'flashAnim 1.8s';
                    setTimeout(() => {
                        swordSound.play();
                    }, 1200);
                    attackRedRef.current.addEventListener('animationend', function(e: any) {
                        if (e.animationName === 'spriteAnimAttack') {
                            impactSound.play();
                            damageTextRedRef.current.style.display = 'block';
                            attackRedRef.current.style.display = 'none';
                            setOngoingAnimation(false);
                            // resetSellsword();
                            setDamageSouth(damage);
                            setRedHP(redHP - damage);
                            resetSellsword();
                            redCastleRef.current.style.animation = '';
                        }
                    });
                    damageTextRedRef.current.addEventListener('animationend', function(e: any) {
                        if (e.animationName === 'up') {
                            damageTextRedRef.current.style.display = 'none';
                        }
                    });
                }
            });
        }
    };

    const handleFortify = async (event: React.PointerEvent | React.MouseEvent) => {
        event.stopPropagation();
        console.log("fortify");
        const castleRef = castle === "blue" ? blueCastleRef : redCastleRef;
        const toastId = toast.loading(`Fortifying ${castle} castle...`, {
            position: "bottom-center",
            style: {
                backgroundColor: "transparent",
                border: "none",
                boxShadow: "none",
                color: "white",
                height: "173px",
                width: "274px",
                textAlign: "center",
            },
            autoClose: false
        });

        try {
            const result = await fortify();
            setIsBgmMuted(true);
            console.log("fortification complete");
            setShowFortifyMenu(false);
            console.log(result);

            toast.dismiss(toastId);
            toast.success(`Fortified ${castle} castle by ${fortifyAmount * 2} HP`, DEFAULT_TOAST_STYLE);

            // Success animation with color change
            const scaleIncrements = [1.05, 1, 1.05, 1, 1.05, 1]; // Scaling up and back down
            const hueRotations = [0, 60, 120, 180, 240, 0]; // Hue rotations for each step

            fortifySound.play();
            setIsBgmMuted(false);

            for (let i = 0; i < scaleIncrements.length; i++) {
                castleRef.current.style.transform = `scale(${scaleIncrements[i]})`;
                castleRef.current.style.filter = `drop-shadow(0 0 20px rgba(255, 255, 255, 0.75)) hue-rotate(${hueRotations[i]}deg)`;
                await new Promise(resolve => setTimeout(resolve, 500)); // Timing between animations
            }

            castleRef.current.style.transform = 'scale(1)';
            castleRef.current.style.filter = 'none';
        } catch (error: any) {
            console.log(error);
            toast.dismiss(toastId);
            toast.error(`Failed to fortify ${castle} castle: ${error.toString().replace("Error: ", "")}`, DEFAULT_TOAST_STYLE);
        }
    };     

    return (
        <>
            <Button id={`attack-${{castle}}`} imgUrl='/attack.svg' onClick={handleAttack} style={{left: "45%", top: "35%"}} />
            <Button id={`fortify-${{castle}}`} imgUrl='/fortify.svg' onClick={toggleFortifyMenu} style={{left: "45%", top: "45%"}} />
            
            {showFortifyMenu && (
                <div id="fortify-menu" onClick={(event) => event.stopPropagation()}>
                    <p style={{ color: 'Black' }}>
                        Spending {fortifyAmount} coins to fortify {castle === "blue" ? "North (Blue) Castle" : "South (Red) Castle"}
                    </p>
                    <p style={{ color: 'Black' }}>
                        Current Castle HP: {castle === "blue" ? blueHP : redHP}
                    </p>
                    <input
                        type="range"
                        min="10"
                        max={gold}
                        value={fortifyAmount}
                        onChange={updateFortifyAmount}
                        style={{ width: '300px' }}
                    />
                    <input
                        type="number"
                        min="10"
                        max={gold}
                        value={fortifyAmount}
                        onChange={updateFortifyAmount}
                        style={{ marginLeft: '10px' }}
                    />
                    <button
                        style={{ marginTop: '1rem' }}
                        className="button menu-button"
                        onClick={handleFortify}
                    >
                        Fortify
                    </button>
                    <button
                        style={{ marginTop: '1rem' }}
                        className="button menu-button"
                        onClick={() => setShowFortifyMenu(false)}
                    >
                        Close Menu
                    </button>
                </div>
            )}
        </>
    );
}
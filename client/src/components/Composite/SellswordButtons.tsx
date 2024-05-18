import useUIStore from "../../hooks/useUIStore";
import { useUiSounds } from "../../hooks/useUiSound";
import Button from "../Button";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { DEFAULT_TOAST_STYLE, SELLSWORD_DEFAULT_STYLE } from "../../utils/constants";

interface SellswordButtonsProps {
    sharpen: () => Promise<boolean>;
}

export const SellswordButtons: React.FC<SellswordButtonsProps> = ({sharpen}) => {

    const {
        setDisplayButtonsSellsword,
        ongoingAnimation,
        setOngoingAnimation,
        setSellswordStyle,
        showLogoMenu,
        blacksmithRef,
        sharpenCoinRef,
        showProfileMenu,
        setShowPayModal,
        setShowProfileMenu
    } = useUIStore();

    const sharpenSound = useUiSounds("duringSharpen");
    const sharpenEndSound = useUiSounds("sharpenEnd");
    const paySound = useUiSounds("paycoin");

    const resetSellsword = () => {
        if (ongoingAnimation || showLogoMenu) return;
        setSellswordStyle(SELLSWORD_DEFAULT_STYLE);
    }

    const toggleProfileMenu = () => {
        setShowProfileMenu(!showProfileMenu);
    }

    const handleSharpen = async (event: React.PointerEvent) => {
        event.stopPropagation();
        if (ongoingAnimation) return;
        setDisplayButtonsSellsword(false);
        resetSellsword();
        console.log("sharpen");
        const loadingToast = toast.loading("Arranging blacksmith...", {
            position: "bottom-center",
            autoClose: false,
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
        try {
            const success = await sharpen();
            toast.dismiss(loadingToast);
            const successToast = toast.success("Sharpening your sword!", {
                position: "bottom-center",
                icon: () => "🔪",
                autoClose: 3000,
                hideProgressBar: true,
                style: {
                    backgroundColor: "transparent",
                    border: "none",
                    boxShadow: "none",
                    height: "173px",
                    width: "274px",
                    color: "white",
                    textAlign: "center"
                }
            });
            setOngoingAnimation(true);
            sharpenSound.play();
            paySound.play();
            blacksmithRef.current.style.display = "block";
            sharpenCoinRef.current.style.display = "block";
            const stopAnimations = async () => {
                await new Promise((resolve) => setTimeout(resolve, 3000));
                paySound.stop();
                sharpenSound.stop();
                sharpenEndSound.play();
                blacksmithRef.current.style.display = "none";
                sharpenCoinRef.current.style.display = "none";
                setOngoingAnimation(false);
            };
            setTimeout(stopAnimations, 0);
            toast.dismiss(successToast);
            toast.success("Spent 50 gold to sharpen!", {
                position: "bottom-center",
                icon: () => "💰",
                autoClose: 2000,
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
        } catch (error: any) {
            console.log(error);
            toast.dismiss(loadingToast);
            toast.error(error.toString().replace("Error: ",""), DEFAULT_TOAST_STYLE);
        }
    }

    return (
        <>
            <Button id={`profile`} imgUrl='/profile.svg' onClick={toggleProfileMenu} style={{left: "45%", top: "35%"}} />
            <Button id={`sharpen`} imgUrl='/sharpen.svg' onClick={handleSharpen} style={{left: "45%", top: "45%"}} />
            <Button id={`pay`} imgUrl='/pay.svg' onClick={() => setShowPayModal(true)} style={{left: "45%", top: "55%"}} />
        </>
    );
}
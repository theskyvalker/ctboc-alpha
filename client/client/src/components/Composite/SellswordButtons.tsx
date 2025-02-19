import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import ActionButton from '../ActionButton';
import { useUiSounds } from '../../hooks/useUiSound';
import useUIStore from '../../hooks/useUIStore';
import { toast } from 'react-toastify';
import { DEFAULT_TOAST_STYLE, DEFAULT_TOAST_STYLE_SUBSET, SELLSWORD_DEFAULT_STYLE } from '../../utils/constants';

interface SellswordButtonsProps {
    sharpen: () => Promise<boolean>;
    focusedButtonIndex: number;
}

interface ButtonItem {
    id: string;
    imgUrl: string;
    onClick: (event?: React.PointerEvent) => void | Promise<void>;
    style: React.CSSProperties;
}

export const SellswordButtons = forwardRef((props: SellswordButtonsProps, ref) => {
    const { sharpen, focusedButtonIndex } = props;

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
        setShowProfileMenu,
    } = useUIStore();

    const sharpenSound = useUiSounds('duringSharpen');
    const sharpenEndSound = useUiSounds('sharpenEnd');
    const paySound = useUiSounds('paycoin');

    const resetSellsword = () => {
        if (ongoingAnimation || showLogoMenu) return;
        setSellswordStyle(SELLSWORD_DEFAULT_STYLE);
    };

    const toggleProfileMenu = (event?: React.PointerEvent) => {
        if (event) event.stopPropagation();
        setShowProfileMenu(!showProfileMenu);
    };

    const handleSharpen = async (event?: React.PointerEvent) => {
        if (event) event.stopPropagation();
        if (ongoingAnimation) return;
        setDisplayButtonsSellsword(false);
        resetSellsword();
        console.log("sharpen");
        const loadingToast = toast.loading("Arranging blacksmith...", {
            position: "bottom-center",
            autoClose: false,
            style: DEFAULT_TOAST_STYLE_SUBSET.info
        });
        try {
            const success = await sharpen();
            toast.dismiss(loadingToast);
            const successToast = toast.success("Sharpening your sword!", {
                position: "bottom-center",
                icon: () => "🔪",
                autoClose: 3000,
                hideProgressBar: true,
                style: DEFAULT_TOAST_STYLE_SUBSET.success
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
                style: DEFAULT_TOAST_STYLE_SUBSET.success
            });
        } catch (error: any) {
            console.log(error);
            toast.dismiss(loadingToast);
            toast.error(error.toString().replace("Error: ", ""), DEFAULT_TOAST_STYLE.error);
        }
    }

    const buttons: ButtonItem[] = [
        {
            id: 'profile',
            imgUrl: '/profile.svg',
            onClick: toggleProfileMenu,
            style: { left: '45%', top: '48%' },
        },
        {
            id: 'sharpen',
            imgUrl: '/sharpen.svg',
            onClick: handleSharpen,
            style: { left: '45%', top: '56%' },
        },
        {
            id: 'pay',
            imgUrl: '/pay.svg',
            onClick: () => setShowPayModal(true),
            style: { left: '45%', top: '64%' },
        },
    ];

    // Create refs for each button
    const buttonRefs = useRef(buttons.map(() => React.createRef<any>())).current;

    useImperativeHandle(ref, () => ({
        invokeAction: () => {
            const button = buttons[focusedButtonIndex];
            if (button && button.onClick) {
                // Trigger the pressed state
                if (buttonRefs[focusedButtonIndex].current) {
                    buttonRefs[focusedButtonIndex].current.triggerPressedAnimation();
                }
                button.onClick(); // No error because event is optional
            }
        },
    }));

    return (
        <>
            {/*<Button id={`profile`} imgUrl='/profile.svg' onClick={toggleProfileMenu} style={{left: "45%", top: "48%"}} />
            <Button id={`sharpen`} imgUrl='/sharpen.svg' onClick={handleSharpen} style={{left: "45%", top: "56%"}} />
            <Button id={`pay`} imgUrl='/pay.svg' onClick={() => setShowPayModal(true)} style={{left: "45%", top: "64%"}} />*/}
            {buttons.map((button, index) => (
                <ActionButton
                    key={button.id}
                    //@ts-ignore
                    ref={buttonRefs[index]}
                    id={button.id}
                    imgUrl={button.imgUrl}
                    onClick={button.onClick}
                    style={button.style}
                    className={focusedButtonIndex === index ? 'focused-button' : ''}
                />
            ))}
        </>
    );
});
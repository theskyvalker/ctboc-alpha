import React, { useState } from 'react';
import Modal from 'react-responsive-modal';
import useUIStore from '../hooks/useUIStore';
import { toast } from 'react-toastify';
import { useUiSounds } from '../hooks/useUiSound';

interface CastleButtonsProps {
    getNickname: (address: string) => Promise<string | undefined>;
    gold: number;
    performPayment: (address: string, amount: number) => Promise<boolean>;
}

const PayModal: React.FC<CastleButtonsProps> = ({ getNickname, gold, performPayment }) => {
    const { showPayModal, setShowPayModal } = useUIStore();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [amount, setAmount] = useState(1);
    const [address, setAddress] = useState('');
    const [nickname, setNickname] = useState('');
    const [errorVisible, setErrorVisible] = useState(false);
    const sendcoins = useUiSounds("sendcoins");

    const onOpenModal = () => setShowPayModal(true);
    const onCloseModal = () => setShowPayModal(false);

    const onOpenConfirmModal = () => {
        if (address.length > 14 && address.startsWith("0x")) {
            setConfirmOpen(true);
        }
    }
    const onCloseConfirmModal = () => {
        console.log("called close confirm");
        setConfirmOpen(false);
    }

    const handleAmountChange = (e: any) => setAmount(e.target.value);
    const handleAddressChange = (e: any) => setAddress(e.target.value);

    const handleConfirm = async () => {
        // onCloseModal();
        if (address.length > 14 && address.startsWith("0x")) {
            let toastId;
            try {
                toastId = toast.loading(
                    "Validating...",
                    {
                        style: {
                            backgroundColor: "transparent", border: "none", boxShadow: "none",
                            height: "173px",
                            width: "274px",
                            color: "white",
                            textAlign: "center",
                        },
                        position: "bottom-center",
                        bodyClassName: "toast-error",
                        autoClose: 2000,
                        hideProgressBar: true
                    });
                const fetchedNickname = await getNickname(address);
                setNickname(fetchedNickname || '');
                console.log(`Fetched nickname for ${address}: ${fetchedNickname}`);
                onOpenConfirmModal();
                setErrorVisible(false);
            } catch (error: any) {
                toast.dismiss(toastId);
                if (!error.toString().includes('nickname defined')) {
                    toast.error(error.toString(), {
                        style: {
                            backgroundColor: "transparent", border: "none", boxShadow: "none",
                            height: "173px",
                            width: "274px",
                            color: "white",
                            textAlign: "center",
                        },
                        position: "bottom-center",
                        bodyClassName: "toast-error",
                        autoClose: 2000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true
                    });
                } else {
                    onOpenConfirmModal();
                    setErrorVisible(false);
                }
            }
        } else {
            setErrorVisible(true);
        }
    };

    const Pay = async () => {
        console.log(`Sending ${amount} coins to ${address} with ${nickname ? `nickname of ${nickname}` : 'no defined nickname'}`);
        onCloseConfirmModal();
        try {
            const success = await performPayment(address, amount);
            if (success) {
                sendcoins.play();
                toast.success(
                    "💰 Payment sent!", {
                    style: {
                        backgroundColor: "transparent", border: "none", boxShadow: "none",
                        height: "173px",
                        width: "274px",
                        color: "white",
                        textAlign: "center",
                    },
                    position: "bottom-center",
                    bodyClassName: "toast-error",
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true
                });
            }
        } catch (error: any) {
            toast.error(error.toString(), {
                style: {
                    backgroundColor: "transparent", border: "none", boxShadow: "none",
                    height: "173px",
                    width: "274px",
                    color: "white",
                    textAlign: "center",
                },
                position: "bottom-center",
                bodyClassName: "toast-error",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true
            });
        }
    };

    return (
        <div id="pay-modal">
            <h2>Pay Coins</h2>
            <p style={{color:`${errorVisible ? 'red' : 'transparent'}`}}>Please enter a valid Starknet address</p>
            <div className="pay-modal-inp-grp">
                <div><input type="range" min="1" max={gold} value={amount} onChange={handleAmountChange} /></div>
                <input type="number" min="1" max={gold} value={amount} onChange={handleAmountChange} />
            </div>
            <input type="text" value={address} onChange={handleAddressChange} placeholder="Enter Starknet address" />
            <button onClick={handleConfirm} style={{backgroundColor:"chocolate"}}>Confirm</button>
            <button onClick={onCloseModal} style={{backgroundColor:"slategray"}}>Cancel</button>
            {confirmOpen && <Modal modalId='confirm-pay-modal' open={confirmOpen} onClose={onCloseConfirmModal} showCloseIcon={false} center>
                <h2>Confirm Payment</h2>
                <p>
                    Are you sure you want to send <span style={{fontSize:'1.5rem'}}>{amount} {amount > 1 ? `coins` : `coin`}</span> to<br/><span style={{fontSize:'1.5rem'}}>{address}</span><br/> with {nickname ? `a nickname of ${nickname}` : 'no defined nickname'}?
                </p>
                <button onClick={Pay} style={{backgroundColor:"green"}}>Yes</button>
                <button onClick={onCloseConfirmModal} style={{backgroundColor:"red"}}>Cancel</button>
            </Modal>}
        </div>
    );
};

export default PayModal;
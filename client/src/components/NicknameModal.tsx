import React, { useState } from 'react';
import Modal from 'react-responsive-modal';
import useUIStore from "../hooks/useUIStore";

const NicknameModal = () => {

    const { showNickModal, setShowNickModal, newNickname, setNewNickname, setNickConfirmed } = useUIStore();

    const onCloseModal = () => setShowNickModal(false);

    const handleNicknameChange = (e: any) => {
        const input = e.target.value;
        if (input.length <= 31) {
            setNewNickname(input);
        }
    };

    const handleConfirm = () => {
        console.log("Nickname confirmed:", newNickname);
        setNickConfirmed(true);
        onCloseModal();
    };

    return (
    <div>
        <h2 style={{color:'orange', fontSize:'1.5rem'}}>Enter Your Nickname</h2>
        <input
            type="text"
            value={newNickname}
            onChange={handleNicknameChange}
            placeholder="Nickname (up to 31 characters)"
            maxLength={31}
            style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />
        <button onClick={handleConfirm} style={{marginRight:'1rem'}}>Confirm</button>
        <button onClick={onCloseModal}>Cancel</button>
    </div>
    );
};

export default NicknameModal;
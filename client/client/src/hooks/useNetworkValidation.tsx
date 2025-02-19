// useNetworkValidation.ts
import { useState, useEffect } from 'react';
import { useAccount } from '@starknet-react/core';
import { mainnet, sepolia } from '@starknet-react/chains';

export const useNetworkValidation = () => {
  const { account, chainId } = useAccount();
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        if (!account || chainId !== sepolia.id) {
          setIsWrongNetwork(true); // Show modal if the wrong network is detected
        } else {
          setIsWrongNetwork(false); // Hide modal if the correct network is detected
        }
      } catch (error) {
        console.error('Error fetching chain ID:', error);
      }
    };

    if (account) {
      checkNetwork();
    }
  }, [account]);

  const switchNetwork = async () => {
    //TODO
  };

  return {
    isWrongNetwork,
    switchNetwork,
  };
};
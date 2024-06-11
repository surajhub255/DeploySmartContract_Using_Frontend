"use client";
import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import axios from 'axios';

const Verify = () => {
  const { address: userAddress } = useAccount();
  const tokenAddress = "0x0F927bd8867B302a793DaE263C9141D311F7a68D";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userAddress) {
      console.log(userAddress);
    }
  }, [userAddress]);

  async function verifyContract(
    contractAddress: string,
    contractSourceCode: string,
    contractName: string,
    compilerVersion: string,
    constructorArguments: string,
    licenseType: string
  ) {
    const apiKey = "RBNWT988E1EQS41KEP1P4GIHP279Y1TU7I";
  // const apiKey = "I4P2814JMQ4JEFNQQR6DCGIVUEW4DMVTIW";

    const params = new URLSearchParams();
    params.append('apikey', apiKey);
    params.append('module', 'contract');
    params.append('action', 'verifysourcecode');
    params.append('contractaddress', contractAddress);
    params.append('sourceCode', contractSourceCode);
    params.append('codeformat', 'solidity-single-file');
    params.append('contractname', contractName);
    params.append('compilerversion', compilerVersion);
    params.append('optimizationUsed', '0');
    params.append('runs', '200');
    params.append('constructorArguments', constructorArguments);
    params.append('licenseType', licenseType);

    try {
      const response = await axios.post('https://api-sepolia.etherscan.io/api', params);
      // const response = await axios.post('https://api-amoy.polygonscan.com/api', params.toString());

      if (response.data.status === '1') {
        console.log('Contract verified successfully');
        console.log('Verification response:', response);
        console.log('Verification Guid:', response.data.result);
      } else {
        console.log('Failed to verify contract:', response.data.result);
      }
    } catch (error) {
      console.error('Error verifying contract:', error);
    }
  }

  const handleVerify = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (!tokenAddress) {
      setError('No contract address found to verify.');
      return;
    }
    const contractSourceCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    uint256 public dataA;

    // Setter function to store a value
    function set(uint256 _data) public {
        dataA = _data;
    }
}`;
    try {
      await verifyContract(
        tokenAddress,
        contractSourceCode,
        'SimpleStorage', 
        'v0.8.26+commit.8a97fa7a', 
        '',
        'MIT' 
      );
    } catch (error) {
      setError('Error verifying contract: ' + error);
      console.error('Error verifying contract:', error);
    }
  };

  return (
    <main className="flex items-center justify-between p-24">
      <button
        className="p-2 px-6 bg-white text-black rounded-full mt-10 text-2xl"
        onClick={handleVerify}
      >
        Verify
      </button>
      {tokenAddress && <p className="text-white mt-4">Contract Address: {tokenAddress}</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </main>
  );
};

export default Verify;

"use client";
import React, { useEffect, useState } from 'react';
import { createPublicClient, http, Hex } from 'viem';
import SimpleStorage from './SimpleStorage.json';
import { polygonAmoy } from 'viem/chains';
import { useAccount, useChainId, useWalletClient } from 'wagmi';
import axios from 'axios';

const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(),
});

const AmoyDeploy = () => {
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });

  const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isDeployed, setIsDeployed] = useState(false);

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
    constructorArguments: string
  ) {
    const apiKey = "RBNWT988E1EQS41KEP1P4GIHP279Y1TU7I";

    const params = new URLSearchParams();
    params.append('apikey', apiKey);
    params.append('module', 'contract');
    params.append('action', 'verifysourcecode');
    params.append('contractaddress', contractAddress);
    params.append('sourceCode', contractSourceCode);
    params.append('codeformat', 'solidity-single-file');
    params.append('contractname', contractName);
    params.append('compilerversion', compilerVersion);
    params.append('optimizationUsed', '0'); // Change to '1' if optimization was used
    params.append('runs', '200'); // Change to the number of runs if optimization was used
    params.append('constructorArguments', constructorArguments);

    try {
      const response = await axios.post('https://api-sepolia.etherscan.io/api', params.toString());
      console.log(apiKey);
      console.log(contractAddress);
      console.log(contractSourceCode);
      console.log(contractName);
      console.log(compilerVersion);
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

  async function deploySimpleStorage() {
    if (!walletClient) {
      throw new Error('Wallet client is not available');
    }

    try {
      const hash = await walletClient.deployContract({
        abi: SimpleStorage.abi,
        bytecode: SimpleStorage.bytecode as Hex,
        account: userAddress,
      });

      if (!hash) {
        throw new Error('Failed to execute deploy contract transaction');
      }

      const txn = await publicClient.waitForTransactionReceipt({ hash });
      setContractAddress(txn.contractAddress as `0x${string}`);
      setIsDeployed(true);

      return txn.contractAddress;
    } catch (error) {
      console.error('Deployment error:', error);
      setError('Error deploying contract: ' + error);
    }
  }

  const handleDeploy = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    try {
      const address = await deploySimpleStorage();
      console.log('Contract deployed at:', address);
    } catch (error) {
      console.error('Error deploying contract:', error);
      setError('Error deploying contract: ' + error);
    }
  };

  const handleVerify = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (!contractAddress) {
      setError('No contract address found to verify.');
      return;
    }
    const contractSourceCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private data;

    // Setter function to store a value
    function set(uint256 _data) public {
        data = _data;
    }

    // Getter function to retrieve the stored value
    function get() public view returns (uint256) {
        return data;
    }
}`;
    try {
      await verifyContract(
        contractAddress as string,
        contractSourceCode,
        'SimpleStorage', // Contract name
        'v0.8.0+commit.c7dfd78e', // Compiler version
        ''
      );
    } catch (error) {
      setError('Error verifying contract: ' + error);
      console.error('Error verifying contract:', error);
    }
  };

  return (
    <main className="flex items-center justify-between p-24">
      <form>
        <label className="text-5xl text-white">Deploy Simple Storage Contract</label> <br />
        <button
          className="p-2 px-6 bg-white text-black rounded-full mt-10 text-2xl"
          onClick={handleDeploy}
        >
          Deploy
        </button>
      </form>
      {isDeployed && (
        <button
          className="p-2 px-6 bg-white text-black rounded-full mt-10 text-2xl"
          onClick={handleVerify}
        >
          Verify
        </button>
      )}
      {contractAddress && <p className="text-white mt-4">Contract Address: {contractAddress}</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </main>
  );
};

export default AmoyDeploy;

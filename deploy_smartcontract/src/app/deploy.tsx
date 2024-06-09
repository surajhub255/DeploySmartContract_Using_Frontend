"use client";
import { useEffect, useState } from "react";
import { createPublicClient, http, Hex } from "viem";
import nero from "./Nero.json";
import { sepolia } from "viem/chains";
import { useAccount, useChainId, useWalletClient } from "wagmi";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

 const Deploy=()=> {
  const userAddress = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });

  const [tokenAddress, setTokenAddress] = useState<`0x${string}` | undefined>();

  useEffect(() => {
    const provider = (window as any).ethereum;
    if (provider && userAddress) {
    }
  }, [userAddress]);

  useEffect(() => {
    if (userAddress) {
      console.log(userAddress);
    }
  }, [userAddress]);

  async function deploy721A(
    name: string,
    symbol: string,
    totalSupply: number,
    tokenPrice: number,
    bronzeLevel: number,
    silverLevel: number,
    goldLevel: number
  ) {
    console.log(walletClient, "walletClient");
    console.log(publicClient, "publicClient")
    if (!walletClient) {
      throw new Error('Wallet client is not available');
    }

    const hash = await walletClient?.deployContract({
      abi: nero.abi,
      bytecode: nero.bytecode as Hex,
      account: userAddress,
      args: [name, symbol, totalSupply, tokenPrice, '0xf5d0A178a61A2543c98FC4a73E3e78a097DBD9EE', bronzeLevel, silverLevel, goldLevel]
    });

    if (!hash) {
      throw new Error('Failed to execute deploy contract transaction');
    }

    console.log('deployed!', hash);
    const txn = await publicClient.waitForTransactionReceipt({ hash });

    console.log('transaction result is', txn, txn.to);

    setTokenAddress(txn.contractAddress as `0x${string}`);

    return txn.contractAddress;
  }

  const handleDeploy = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    try {
      const contractAddress = await deploy721A("suraj", "SST", 1000, 0, 10, 100, 200);
      console.log('Contract deployed at:', contractAddress);
    } catch (error) {
      console.error('Error deploying contract:', error);
    }
  };

  return (
    <main className="flex items-center justify-between p-24">
      <form>
        <label className="text-5xl text-white">Deploy Smart Contract</label> <br />
        <button
          className="p-2 px-6 bg-white text-black rounded-full mt-10 text-2xl"
          onClick={handleDeploy}
        >
          Deploy
        </button>
      </form>
      {tokenAddress && (
        <p className="text-white mt-4">Contract Address: {tokenAddress}</p>
      )}
    </main>
  );
}

export default Deploy;

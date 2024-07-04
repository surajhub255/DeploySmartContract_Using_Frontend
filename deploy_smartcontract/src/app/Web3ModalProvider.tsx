'use client'

import React, { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { State, WagmiProvider } from 'wagmi'
import { defaultWagmiConfig } from '@web3modal/wagmi'
import { baseSepolia, mainnet, polygonAmoy, sepolia } from 'viem/chains'

// Setup queryClient
const queryClient = new QueryClient()


const projectId = `${process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}`

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'nero',
  description: 'Web3Modal Example',
  url: 'https://nero-marketplace.vercel.app/',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const chains = [mainnet, sepolia , polygonAmoy , baseSepolia] as const;

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
 
});
export default function Web3ModalProvider({
  children,
  initialState
}: {
  children: ReactNode
  initialState?: State
}) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
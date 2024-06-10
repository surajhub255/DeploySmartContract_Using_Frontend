import { cookieToInitialState } from 'wagmi';
import { headers } from 'next/headers';
import Deploy from './deploy';
import { mainnet, polygonAmoy, sepolia } from 'wagmi/chains';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';

import { QueryClient } from '@tanstack/react-query'
import Web3ModalProvider from './Web3ModalProvider';
import Verify from './verify';
import AmoyDeploy from './amoydeploy';

export default function App() {
  const projectId = `${process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}`
  const queryClient = new QueryClient()

  if (!projectId) throw new Error('Project ID is not defined')

  const metadata = {
    name: 'nero',
    description: 'Web3Modal Example',
    url: 'https://nero-marketplace.vercel.app/',
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
  };

  const chains = [mainnet, sepolia , polygonAmoy] as const;
  const config = defaultWagmiConfig({
    chains,
    projectId,
    metadata,
    ssr: true,

  });
  const initialState = cookieToInitialState(config, headers().get("cookie"));

  return (
    <Web3ModalProvider initialState={initialState}>
      {/* <Deploy/> */}
      <Verify />
      {/* <AmoyDeploy/> */}
    </Web3ModalProvider>
  )
}
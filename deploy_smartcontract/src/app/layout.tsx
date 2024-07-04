import type { Metadata } from 'next'
import { Bai_Jamjuree as FontSans } from 'next/font/google'
import './globals.css'

import { headers } from 'next/headers'

import { cookieToInitialState } from 'wagmi'
import { config } from '@/lib/wagmi'
import Providers from '@/lib/providers'
import Web3ModalProvider from '@/lib/providers'



const fontSans = FontSans({
	subsets: ['latin'],
	weight: ['400', '700'],
	variable: '--font-sans',
})
export const metadata: Metadata = {
	title: 'Myriadflow Studio',
	description: 'Create your brand phygital and NFTs',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const initialState = cookieToInitialState(config, headers().get('cookie'))
	return (
		<html lang='en' suppressHydrationWarning>
			<Providers>
				<body>
				<Web3ModalProvider initialState={initialState}>{children}</Web3ModalProvider>
				</body>
			</Providers>
		</html>
	)
}

'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UserProvider from './_contexts/UserContext'

export function Providers({ children }) {
    const queryClient = new QueryClient()

    return (
        <ChakraProvider>
            <QueryClientProvider client={queryClient}>
                <UserProvider>{children}</UserProvider>
            </QueryClientProvider>
        </ChakraProvider>
    )
}

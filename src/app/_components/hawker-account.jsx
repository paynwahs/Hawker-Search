'use client'

import { Flex, Text, Button } from '@chakra-ui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createClient } from '~/supabase/client'
import { useContext } from 'react'
import { UserContext } from '../_contexts/UserContext'

export default function HawkerAccount() {
    const router = useRouter()
    const { wipeData } = useContext(UserContext)

    const logout = useMutation({
        mutationFn: async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            router.replace('/login')
        },
    })

    const triggerLogout = () => {
        wipeData()
        logout.mutate()
    }

    return (
        <Flex
            flexDir={'column'}
            justifyContent={'center'}
            alignItems={'center'}
            height={'100%'}
        >
            <Text fontSize={'3xl'} marginBottom={'24px'}>
                Hello, Hawker!
            </Text>
            <Button onClick={triggerLogout}>Log out</Button>
        </Flex>
    )
}

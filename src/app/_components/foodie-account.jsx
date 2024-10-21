'use client'
import { Flex, Text, Button } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { createClient } from '~/supabase/client'
import { useContext } from 'react'
import { UserContext } from '../_contexts/UserContext'

export default function FoodieAccount() {
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
                Hello, Foodie!
            </Text>
            <Button onClick={triggerLogout}>Log out</Button>
        </Flex>
    )
}

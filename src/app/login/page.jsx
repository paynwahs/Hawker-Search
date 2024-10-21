'use client'

import { Stack, Text, Box, Input, Flex, Button } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useContext, useState, useEffect } from 'react'
import { loginUser } from '../_utils/auth'
import { UserContext } from '../_contexts/UserContext'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const router = useRouter()
    const { role, initialiseData } = useContext(UserContext)

    useEffect(() => {
        if (role) router.push(`${role}/home`)
    }, [role])

    const handleLogin = async () => {
        const userData = await loginUser({ email, password })

        if (userData) {
            initialiseData(userData)
            console.log('login success')
        } else {
            console.log('login failed')
            setErrorMessage('Email or password is incorrect')
        }
    }

    const handleSignup = () => {
        router.replace('onboarding')
    }

    // TODO: Remove this for production
    const testHawkerLogin = async () => {
        const userData = await loginUser({
            email: 'user7@example.com',
            password: 'password123',
        })
        initialiseData(userData)
    }
    const testFoodieLogin = async () => {
        const userData = await loginUser({
            email: 'user1@example.com',
            password: 'password123',
        })
        initialiseData(userData)
    }

    return (
        <Flex
            flexDir={'column'}
            justifyContent={'center'}
            alignItems={'center'}
            height={'100%'}
            width={'100%'}
        >
            <Stack
                direction={'column'}
                paddingX={'48px'}
                width={'100%'}
                spacing={'24px'}
            >
                <Text fontSize={'3xl'}>Welcome back!</Text>
                {errorMessage !== '' && (
                    <Text fontSize={'md'} color={'red'}>
                        {errorMessage}
                    </Text>
                )}
                <Stack spacing={'12px'}>
                    <Text fontSize={'xl'}>Email</Text>
                    <Box width={'100%'} height={'48px'}>
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. ahboon@gmail.com"
                            autoFocus
                            height={'100%'}
                        />
                    </Box>
                    <Text fontSize={'xl'}>Password</Text>
                    <Box width={'100%'} height={'48px'}>
                        <Input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="e.g. password123"
                            height={'100%'}
                        />
                    </Box>
                </Stack>
                <Button
                    width={'80%'}
                    alignSelf={'center'}
                    onClick={handleLogin}
                >
                    Log In
                </Button>
                <Box height={'1px'} bgColor={'grey'} width={'100%'} />
                <Text>If you don&apos;t have an account, sign up here:</Text>
                <Button
                    width={'80%'}
                    alignSelf={'center'}
                    onClick={handleSignup}
                >
                    Sign Up
                </Button>

                <Button
                    width={'80%'}
                    alignSelf={'center'}
                    onClick={testFoodieLogin}
                >
                    User 1 Foodie Login (for testing)
                </Button>
                <Button
                    width={'80%'}
                    alignSelf={'center'}
                    onClick={testHawkerLogin}
                >
                    User 7 Hawker Login (for testing)
                </Button>
            </Stack>
        </Flex>
    )
}

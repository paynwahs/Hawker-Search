'use client'

import { Box, Button, Text, Stack, Flex } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function HawkerStart() {
    const router = useRouter()
    const handleSubmit = () => {
        router.replace('/onboarding/hawker')
    }

    return (
        <Stack
            direction={'column'}
            spacing={'24px'}
            paddingX={'24px'}
            paddingTop={'24px'}
            width={'100%'}
            height={'100%'}
            justifyContent={'center'}
            alignItems={'center'}
        >
            <Box>
                <Text
                    fontSize={'2xl'}
                    fontWeight={'bold'}
                    marginBottom={'12px'}
                >
                    We need to ask a few questions about your hawker stall
                </Text>
                <Text fontSize={'lg'}>
                    Your answers will help us recommend your hawker stall to
                    more customers.
                </Text>
            </Box>
            <Button
                width={'fit-content'}
                height={'48px'}
                borderRadius={'16px'}
                shadow={'lg'}
                bgColor={'green'}
                color={'white'}
                onClick={handleSubmit}
            >
                Start
            </Button>
        </Stack>
    )
}

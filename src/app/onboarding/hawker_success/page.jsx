'use client'

import { Box, Button, Text, Stack, Flex } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function HawkerSuccess() {
    const router = useRouter()
    const handleSubmit = () => {
        router.replace('/hawker/home')
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
                    Congratulations, you have successfully joined our platform!
                </Text>
                <Text fontSize={'lg'}>
                    When customers search for food and drinks, we will try our
                    best to recommend your hawker stall to them.
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
                Go to my hawker dashboard
            </Button>
        </Stack>
    )
}

'use client'

import { Box, Button, Text, Stack, Flex } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function FoodieSuccess() {
    const router = useRouter()
    const handleSubmit = () => {
        router.replace('/foodie/home')
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
                    The best hawker stalls in Singapore are waiting to be
                    discovered.
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
                Start searching for food
            </Button>
        </Stack>
    )
}

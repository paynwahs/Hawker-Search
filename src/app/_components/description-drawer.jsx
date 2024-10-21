'use client'

import { useState } from 'react'
import { Flex, Text, Box, Button, Image } from '@chakra-ui/react'
import { Drawer } from 'vaul'
import { FiHeart } from 'react-icons/fi'
import useFavourite from '../_utils/favourite-util'

export default function DescriptionDrawer({
    open,
    setOpen,
    showFavouriteFunction = false,
    showReason = false,
    hawkerData,
}) {
    const { favourited, toggleFavourite } = useFavourite({
        initial: hawkerData ? hawkerData.favourite : false,
    })

    const getHawkerImage = () => {
        let hash = 0

        // Generate a simple hash from the string
        if (hawkerData) {
            for (let i = 0; i < hawkerData.name.length; i++) {
                hash = hawkerData.name.charCodeAt(i) + ((hash << 5) - hash)
            }

            // Map the hash to a number between 1 and 5
            let hashOutput = (Math.abs(hash) % 5) + 1

            return `/hawker${hashOutput}.jpg`
        } else return `/hawker1.jpg`
    }

    return (
        <Drawer.Root open={open} onOpenChange={setOpen}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                <Drawer.Content className="max-h-[75%] bg-zinc-100 flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0">
                    <div className="py-4 bg-white rounded-t-[10px] flex-1 overflow-auto relative pb-24">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-4 sticky top-0" />
                        {/* Image */}
                        <Image
                            src={getHawkerImage()}
                            alt="hawker stall"
                            width="100%"
                            height="250px"
                            objectPosition={'50% 20%'}
                            objectFit={'cover'}
                            marginBottom={'24px'}
                        />
                        <Box paddingX={'24px'} position={'relative'}>
                            {/* Favourite button */}
                            {showFavouriteFunction && (
                                <Box
                                    position={'absolute'}
                                    right={'24px'}
                                    top={'12px'}
                                >
                                    <FiHeart
                                        size={'24'}
                                        color={favourited ? 'red' : 'grey'}
                                        onClick={toggleFavourite}
                                    />
                                </Box>
                            )}
                            {/* Hawker info */}
                            <Box marginBottom={'24px'}>
                                <Drawer.Title className="font-medium mb-4">
                                    <Text
                                        fontSize={'3xl'}
                                        fontWeight={'bold'}
                                        marginBottom={'12px'}
                                    >
                                        {hawkerData?.name}
                                    </Text>
                                </Drawer.Title>
                                <Text fontSize={'lg'} marginBottom={'6px'}>
                                    📍&nbsp;&nbsp;&nbsp;{hawkerData?.location}
                                </Text>
                                <Text fontSize={'lg'} marginBottom={'6px'}>
                                    🕒&nbsp;&nbsp;&nbsp;{hawkerData?.opening} to{' '}
                                    {hawkerData?.closing}
                                </Text>
                            </Box>
                            {/* Search recommendation reason */}
                            {showReason && (
                                <Box marginBottom={'24px'}>
                                    <Text
                                        fontSize={'2xl'}
                                        marginBottom={'12px'}
                                        fontWeight={'bold'}
                                    >
                                        Why we recommended this
                                    </Text>
                                    <Text fontSize={'md'}>
                                        {hawkerData?.reason}
                                    </Text>
                                </Box>
                            )}
                            <Box marginBottom={'24px'}>
                                <Text
                                    fontSize={'2xl'}
                                    marginBottom={'12px'}
                                    fontWeight={'bold'}
                                >
                                    Menu
                                </Text>
                                {hawkerData?.foods.map((item, index) => {
                                    return (
                                        <Box key={index} marginBottom={'6px'}>
                                            <Text
                                                fontSize={'md'}
                                                fontWeight={'bold'}
                                                marginBottom={'12px'}
                                                as={'span'}
                                            >
                                                {item.name}: &nbsp;
                                            </Text>
                                            <Text
                                                key={index}
                                                fontSize={'md'}
                                                marginBottom={'12px'}
                                                as={'span'}
                                            >
                                                {item.description}
                                            </Text>
                                            <br />
                                        </Box>
                                    )
                                })}
                            </Box>
                        </Box>
                        {/* Take me there */}
                        <Flex
                            width={'100%'}
                            position={'fixed'}
                            bottom={'60px'}
                            justifyContent={'center'}
                        >
                            <Button
                                width={'60%'}
                                height={'fit-content'}
                                onClick={() => alert('Opening Google Maps!')}
                                bgColor={'teal'}
                                color={'white'}
                                borderRadius={'24px'}
                                paddingY={'12px'}
                            >
                                {/* <FiChevronLeft /> */}
                                <Text>Take me there</Text>
                            </Button>
                        </Flex>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    )
}

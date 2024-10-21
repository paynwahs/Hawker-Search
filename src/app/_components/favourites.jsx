'use client'

import { useState } from 'react'
import { Flex, Text, Box } from '@chakra-ui/react'
import { FiHeart } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import useFavourite from '../_utils/favourite-util'
import DescriptionDrawer from '@/app/_components/description-drawer'

const FavouritedItem = ({ hawker, onClick }) => {
    const router = useRouter()

    const { favourited, toggleFavourite } = useFavourite({ initial: true })

    return (
        <Box
            paddingY={'12px'}
            paddingX={'24px'}
            boxShadow={'lg'}
            background={'pink'}
            borderRadius={'12px'}
            marginBottom={'18px'}
            onClick={onClick}
            position={'relative'}
        >
            <Text
                fontSize={'xl'}
                fontWeight={'bold'}
                align={'left'}
                width={'100%'}
                marginBottom={'6px'}
            >
                {hawker.name}
            </Text>
            <Flex width={'100%'} marginBottom={'6px'}>
                <Text fontSize={'md'} marginRight={'32px'}>
                    📍&nbsp;&nbsp;&nbsp;{hawker.location}
                </Text>
                <Text fontSize={'md'}>
                    🕒&nbsp;&nbsp;&nbsp;{hawker.opening} to {hawker.closing}
                </Text>
            </Flex>
            <Text fontSize={'md'} align={'left'} width={'100%'}>
                {hawker.description}
            </Text>
            <Box position={'absolute'} right={'12px'} top={'12px'}>
                <FiHeart
                    size={'24'}
                    color={favourited ? 'red' : 'grey'}
                    onClick={toggleFavourite}
                />
            </Box>
        </Box>
    )
}

export default function FavouritesComponent() {
    const [favourites, setFavourites] = useState([
        {
            name: 'Noodle Paradise',
            description:
                'Offering a diverse range of noodles served in mouth-watering broths and soups',
            location: '188735',
            opening: '10:00:00',
            closing: '07:00:00',
        },
        {
            name: 'Satay King',
            description:
                'Perfectly seasoned meats grilled on a charcoal skewer',
            location: '354118',
            opening: '09:00:00',
            closing: '22:00:00',
        },
        {
            name: 'Hainan Delights',
            description:
                'A large menu ranging from Hainanese Chicken to Pork Porridge slow-cooked to perfection',
            location: '655714',
            opening: '11:00:00',
            closing: '18:00:00',
        },
    ])

    const [openBottomSheet, setOpenBottomSheet] = useState(false)

    return (
        <>
            <Box
                paddingX={'24px'}
                marginTop={'12px'}
                paddingBottom={'120px'}
                height={'100%'}
            >
                <Text
                    fontSize={'2xl'}
                    align={'left'}
                    width={'100%'}
                    fontWeight={'bold'}
                    marginBottom={'12px'}
                >
                    Your favourite hawkers
                </Text>
                {favourites.map((hawker, index) => {
                    return (
                        <FavouritedItem
                            hawker={hawker}
                            key={index}
                            onClick={() => setOpenBottomSheet(true)}
                        />
                    )
                })}
            </Box>
            <DescriptionDrawer
                open={openBottomSheet}
                setOpen={setOpenBottomSheet}
                showFavouriteFunction={true} // Always show favourite functionality when coming from favourites page
                showReason={false} // Never show reason when coming from foodie favourites (no search, so no reason)
            />
        </>
    )
}

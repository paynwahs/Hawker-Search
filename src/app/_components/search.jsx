'use client'

import { useState, useEffect, useContext } from 'react'
import { FiSearch, FiHeart } from 'react-icons/fi'
import {
    Flex,
    Text,
    Box,
    Input,
    IconButton,
    Stack,
    Button,
    Spinner,
} from '@chakra-ui/react'
import useFavourite from '../_utils/favourite-util'
import DescriptionDrawer from './description-drawer'
import { getStraightLineDistance } from '../_utils/directions-api'
import { UserContext } from '../_contexts/UserContext'
import { getSearchResults } from '../_utils/data-api'
import { useMutation } from '@tanstack/react-query'

const RecommendationBoxWithFav = ({ result, onClick }) => {
    const { favourited, toggleFavourite } = useFavourite({
        initial: result.favourited,
    })

    return (
        <Box
            paddingY={'12px'}
            paddingX={'24px'}
            borderRadius={'12px'}
            marginBottom={'18px'}
            boxShadow={'lg'}
            background={'pink'}
            onClick={onClick}
            position={'relative'}
        >
            <Text fontSize={'xl'} align={'left'} width={'100%'}>
                {result.name}
            </Text>
            <Text fontSize={'md'} align={'left'} width={'100%'}>
                {result.reason}
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

const RecommendationBoxNoFav = ({ result, onClick }) => {
    return (
        <Box
            paddingY={'12px'}
            paddingX={'24px'}
            borderRadius={'12px'}
            marginBottom={'18px'}
            boxShadow={'lg'}
            background={'pink'}
            onClick={onClick}
        >
            <Text fontSize={'xl'} align={'left'} width={'100%'}>
                {result.name}
            </Text>
            <Text fontSize={'md'} align={'left'} width={'100%'}>
                {result.reason}
            </Text>
        </Box>
    )
}

export default function SearchComponent() {
    const { role } = useContext(UserContext)
    const [prompt, setPrompt] = useState('')
    const [searched, setSearched] = useState(0)

    // Filtering states
    const [nearFilter, setNearFilter] = useState(false)
    const [openNowFilter, setOpenNowFilter] = useState(false)
    const [halalFilter, setHalalFilter] = useState(false)
    const [veggieFilter, setVeggieFilter] = useState(false)
    const [userLocation, setUserLocation] = useState(null)

    // TOOD: useEffect to get user's geolocation

    const handleSearch = () => {
        // Only search if prompt is not empty
        if (prompt.trim() !== '') {
            // Show search results
            setSearched((prev) => prev + 1)
        }
    }

    const [results, setResults] = useState([])
    const getSearchResultsMutation = useMutation({
        mutationFn: async ({ message, location, halal, vegetarian }) => {
            const searchResults = await getSearchResults({
                message,
                location,
                halal,
                vegetarian,
            })
            setResults(searchResults)
        },
    })

    const [selectedHawker, setSelectedHawker] = useState(null)

    useEffect(() => {
        // Get user location and save
        function saveLocation(pos) {
            console.log('printing location data')
            console.log(pos)
            setUserLocation(`${pos.coords.latitude},${pos.coords.longitude}`)
        }
        function errorLocation(err) {
            console.log(`error printing location: ${err.message}`)
        }
        if (navigator.geolocation) {
            navigator.permissions
                .query({ name: 'geolocation' })
                .then(function (result) {
                    if (
                        result.state === 'granted' ||
                        result.state === 'prompt'
                    ) {
                        navigator.geolocation.getCurrentPosition(
                            saveLocation,
                            errorLocation
                        )
                    } else if (result.state === 'denied') {
                        console.log(
                            `error printing location: user denied permissions`
                        )
                    }
                })
        }
    }, [])

    useEffect(() => {
        if (searched > 0) {
            console.log(
                `${prompt} === ${userLocation} === ${halalFilter} === ${veggieFilter}`
            )
            console.log(
                `${nearFilter} === ${openNowFilter} === ${halalFilter} === ${veggieFilter}`
            )
            // Get search results
            getSearchResultsMutation.mutate({
                message: prompt,
                location: nearFilter ? userLocation : null,
                halal: halalFilter,
                vegetarian: veggieFilter,
            })
        }
    }, [searched])

    const [openBottomSheet, setOpenBottomSheet] = useState(false)

    return (
        <>
            <Flex
                flexDirection={'column'}
                justifyContent={'flex-start'}
                alignItems={'center'}
                height={'100%'}
                paddingX={'24px'}
            >
                <Box
                    width={'100%'}
                    paddingTop={searched > 0 ? '1vh' : '30vh'}
                    marginBottom={'24px'}
                >
                    {searched === 0 && (
                        <Text fontSize={'2xl'} align={'left'} width={'100%'}>
                            What do you feel like eating?
                        </Text>
                    )}
                    <Flex
                        flexDir={'row'}
                        justifyContent={'space-between'}
                        width={'100%'}
                        height={'48px'}
                        marginBottom={'24px'}
                        marginTop={'24px'}
                    >
                        <Input
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. Something spicy"
                            width={'80%'}
                            height={'100%'}
                            autoFocus
                            borderRadius={'24px'}
                            backgroundColor={'white'}
                        />
                        <IconButton
                            icon={<FiSearch />}
                            width={'17%'}
                            height={'100%'}
                            bg={'green'}
                            color={'white'}
                            borderRadius={'24px'}
                            onClick={handleSearch}
                        />
                    </Flex>
                    <Stack flexDir={'row'} spacing={'6px'}>
                        <Button
                            borderRadius={'24px'}
                            variant={'outline'}
                            colorScheme={nearFilter ? 'red' : 'white'}
                            onClick={() => setNearFilter((prev) => !prev)}
                        >
                            Near me
                        </Button>
                        <Button
                            borderRadius={'24px'}
                            variant={'outline'}
                            colorScheme={openNowFilter ? 'red' : 'white'}
                            onClick={() => setOpenNowFilter((prev) => !prev)}
                        >
                            Open now
                        </Button>
                        <Button
                            borderRadius={'24px'}
                            variant={'outline'}
                            colorScheme={halalFilter ? 'red' : 'white'}
                            onClick={() => setHalalFilter((prev) => !prev)}
                        >
                            Halal
                        </Button>
                        <Button
                            borderRadius={'24px'}
                            variant={'outline'}
                            colorScheme={veggieFilter ? 'red' : 'white'}
                            onClick={() => setVeggieFilter((prev) => !prev)}
                        >
                            Vegetarian
                        </Button>
                    </Stack>
                </Box>
                {searched > 0 && (
                    <Flex
                        width={'100%'}
                        flexDir={'column'}
                        justifyContent={'flex-start'}
                        alignItems={'center'}
                    >
                        {getSearchResultsMutation.isSuccess &&
                            results.length > 0 && (
                                <Box marginBottom={'12px'} width={'100%'}>
                                    <Text
                                        fontSize={'2xl'}
                                        align={'left'}
                                        width={'100%'}
                                    >
                                        Here&apos;s what we recommend
                                    </Text>
                                    <Text
                                        fontSize={'md'}
                                        align={'left'}
                                        width={'100%'}
                                    >
                                        Tap any hawker below to see more details
                                    </Text>
                                </Box>
                            )}
                        {getSearchResultsMutation.isPending && (
                            <>
                                <Text
                                    fontSize={'2xl'}
                                    align={'center'}
                                    width={'100%'}
                                    marginBottom={'24px'}
                                >
                                    Finding the best hawkers for you
                                </Text>
                                <Spinner color={'red'} size={'xl'} />
                            </>
                        )}
                        {getSearchResultsMutation.isSuccess &&
                            results !== null &&
                            results.map((result, index) => {
                                if (role === 'foodie') {
                                    return (
                                        <RecommendationBoxWithFav
                                            onClick={() => {
                                                setOpenBottomSheet(true)
                                                setSelectedHawker(result)
                                            }}
                                            result={result}
                                            key={index}
                                        />
                                    )
                                } else {
                                    return (
                                        <RecommendationBoxNoFav
                                            onClick={() => {
                                                setOpenBottomSheet(true)
                                                setSelectedHawker(result)
                                            }}
                                            result={result}
                                            key={index}
                                        />
                                    )
                                }
                            })}
                        {getSearchResultsMutation.isSuccess &&
                            results.length === 0 && (
                                <>
                                    <Text textAlign={'center'}>
                                        Sorry, no hawkers fit your preferences.
                                    </Text>
                                    <Text textAlign={'center'}>
                                        Try searching for something else?
                                    </Text>
                                </>
                            )}
                    </Flex>
                )}
            </Flex>
            {selectedHawker && (
                <DescriptionDrawer
                    open={openBottomSheet}
                    setOpen={setOpenBottomSheet}
                    showFavouriteFunction={role === 'foodie' ? true : false} // Don't show favourite functionality for hawkers
                    showReason={true} // Show reason when coming from search
                    hawkerData={selectedHawker}
                />
            )}
        </>
    )
}

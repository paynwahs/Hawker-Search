'use client'

import { useContext, useEffect, useState } from 'react'
import { Flex, Button, Text, Box, Spinner } from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import {
    getHawkerInsights,
    getKeywords,
    searchAndFavourites,
} from '../_utils/data-api'
import { UserContext } from '../_contexts/UserContext'

export default function HawkerInsights() {
    const [timeframe, setTimeframe] = useState('today')

    // Summary
    const [numbers, setNumbers] = useState(null)
    const getSummaryData = useMutation({
        mutationFn: async ({ hawkerId }) => {
            const numbersData = await searchAndFavourites(hawkerId)
            setNumbers(numbersData)
        },
    })
    const getSearches = () => {
        if (numbers == null) return 0
        switch (timeframe) {
            case 'today':
                return numbers.searchCount.todayCount
            case 'weekly':
                return numbers.searchCount.last7DaysCount
            case 'allTime':
                return numbers.searchCount.allTimeCount
            default:
                return 0
        }
    }

    const getFavourites = () => {
        if (numbers == null) return 0
        switch (timeframe) {
            case 'today':
                return numbers.favouriteCount.todayCount
            case 'weekly':
                return numbers.favouriteCount.last7DaysCount
            case 'allTime':
                return numbers.favouriteCount.allTimeCount
            default:
                return 0
        }
    }

    // Prompts
    const [prompts, setPrompts] = useState([])
    const getRecentPromptsMutation = useMutation({
        mutationFn: async (hawkerId) => {
            const promptData = await getKeywords(hawkerId)
            setPrompts(promptData)
        },
    })

    // Recommendations
    const [insights, setInsights] = useState([])
    const getInsightsMutation = useMutation({
        mutationFn: async (hawkerId) => {
            const recommendations = await getHawkerInsights(hawkerId)
            setInsights(recommendations)
        },
    })

    const { roleId } = useContext(UserContext)
    useEffect(() => {
        if (roleId !== null) {
            // Get aggregate numbers
            getSummaryData.mutate({ hawkerId: roleId })
            // Get insights
            getInsightsMutation.mutate({ hawkerId: roleId })
            // Get recent prompts
            getRecentPromptsMutation.mutate({ hawkerId: roleId })
        }
    }, [roleId])

    return (
        <Box paddingX={'24px'} overflow={'scroll'} height={'100%'}>
            {/* Insights summary */}
            <Text fontSize={'2xl'} fontWeight={'bold'}>
                Summary
            </Text>
            <Text fontSize={'lg'} marginBottom={'12px'}>
                How many customers found your stall and favourited your stall
            </Text>
            {/* Timeframe buttons */}
            <Flex
                flexDirection={'row'}
                justifyContent={'start'}
                alignItems={'center'}
                marginBottom={'12px'}
            >
                <Button
                    marginRight={'12px'}
                    borderRadius={'24px'}
                    variant={'outline'}
                    colorScheme={timeframe === 'today' ? 'red' : 'white'}
                    onClick={() => setTimeframe('today')}
                >
                    Today
                </Button>
                <Button
                    marginRight={'12px'}
                    borderRadius={'24px'}
                    variant={'outline'}
                    colorScheme={timeframe === 'weekly' ? 'red' : 'white'}
                    onClick={() => setTimeframe('weekly')}
                >
                    This Week
                </Button>
                <Button
                    marginRight={'12px'}
                    borderRadius={'24px'}
                    variant={'outline'}
                    colorScheme={timeframe === 'allTime' ? 'red' : 'white'}
                    onClick={() => setTimeframe('allTime')}
                >
                    All Time
                </Button>
            </Flex>
            <Flex
                flexDirection={'row'}
                justifyContent={'space-around'}
                alignItems={'center'}
                borderWidth={'1px'}
                borderColor={'black'}
                borderRadius={'12px'}
                height={'100px'}
                marginBottom={'24px'}
            >
                <Flex
                    flexDirection={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                >
                    {getSummaryData.isPending && <Spinner color={'red'} />}
                    {getSummaryData.isSuccess && (
                        <Text fontSize={'3xl'}>{getSearches()}</Text>
                    )}
                    <Text fontSize={'md'}>searches</Text>
                </Flex>
                <Flex
                    flexDirection={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                >
                    {getSummaryData.isPending && <Spinner color={'red'} />}
                    {getSummaryData.isSuccess && (
                        <Text fontSize={'3xl'}>{getFavourites()}</Text>
                    )}
                    <Text fontSize={'md'}>favourites</Text>
                </Flex>
            </Flex>
            {/* User searches */}
            <Text fontSize={'2xl'} fontWeight={'bold'}>
                What your stall is known for
            </Text>
            <Text fontSize={'lg'} marginBottom={'12px'}>
                These are the main words people use when searching for your
                stall.
            </Text>
            <Flex
                flexDirection={'row'}
                justifyContent={'start'}
                alignItems={'center'}
                wrap={'wrap'}
                marginBottom={'24px'}
            >
                {getRecentPromptsMutation.isPending && (
                    <Spinner color={'red'} />
                )}
                {getRecentPromptsMutation.isSuccess &&
                    prompts.map((prompt, index) => {
                        return (
                            <Box
                                key={index}
                                width={'fit-content'}
                                bgColor={'pink'}
                                paddingX={'18px'}
                                paddingY={'6px'}
                                borderRadius={'12px'}
                                marginBottom={'12px'}
                                marginRight={'6px'}
                            >
                                <Text>{prompt}</Text>
                            </Box>
                        )
                    })}
            </Flex>
            {/* Recommendations */}
            <Text fontSize={'2xl'} fontWeight={'bold'}>
                Recommendations
            </Text>
            <Text fontSize={'lg'} marginBottom={'12px'}>
                Based on recent search trends, here are some things you can do
                to attract more customers
            </Text>
            {getInsightsMutation.isPending && <Spinner color={'red'} />}
            {getInsightsMutation.isSuccess &&
                insights.map((insight, index) => {
                    return (
                        <Flex
                            key={index}
                            flexDirection={'row'}
                            justifyContent={'space-between'}
                            alignItems={'center'}
                            width={'fit-content'}
                            bgColor={'pink'}
                            paddingY={'12px'}
                            paddingRight={'12px'}
                            borderRadius={'12px'}
                            marginBottom={'12px'}
                        >
                            <Text fontSize={'4xl'} marginX={'12px'}>
                                &#x1F4A1;
                            </Text>
                            <Text>{insight}</Text>
                        </Flex>
                    )
                })}
        </Box>
    )
}

'use client'

import { Text, Flex, Box } from '@chakra-ui/react'
import { FiSearch, FiUser, FiHeart, FiLoader } from 'react-icons/fi'
import { useState } from 'react'
import SearchComponent from '@/app/_components/search'
import HawkerInsights from '@/app/_components/insights'
import HawkerAccount from '@/app/_components/hawker-account'

export default function HawkerHome() {
    const [selectedTab, setSelectedTab] = useState('insights')

    const getActiveScreen = () => {
        switch (selectedTab) {
            case 'search':
                return <SearchComponent isFoodie={false} />
            case 'insights':
                return <HawkerInsights />
            case 'account':
                return <HawkerAccount />
            default:
                return <h1>Undefined</h1>
        }
    }

    const openSearch = () => {
        setSelectedTab('search')
    }
    const openInsights = () => {
        setSelectedTab('insights')
    }
    const openAccount = () => {
        setSelectedTab('account')
    }

    return (
        <>
            {/* Top Nav */}
            <Flex
                flexDirection={'column'}
                justifyContent={'center'}
                alignItems={'center'}
                paddingY={'12px'}
                marginBottom={'12px'}
                position={'fixed'}
                top={'0'}
                width={'100%'}
                bgColor={'white'}
                zIndex={'1'}
                className="shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),_0_2px_4px_-1px_rgba(0,0,0,0.06)]"
            >
                <Text fontSize={'2xl'} fontWeight={'bolder'}>
                    HawkerSearch
                </Text>
            </Flex>
            <Box
                paddingTop={'72px'}
                zIndex={'0'}
                paddingBottom={'150px'}
                min-height={'100vh'}
            >
                {getActiveScreen()}
            </Box>
            {/* Bottom Nav */}
            <Flex
                flexDirection={'row'}
                justifyContent={'space-around'}
                alignItems={'center'}
                position={'fixed'}
                bottom={'0'}
                width={'100%'}
                paddingBottom={'40px'}
                paddingTop={'20px'}
                bgColor={'white'}
                className="shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),_0_-2px_4px_-1px_rgba(0,0,0,0.06)]"
            >
                <Flex
                    flexDirection={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    onClick={openSearch}
                >
                    <FiSearch
                        size={'28px'}
                        color={selectedTab === 'search' ? 'red' : 'black'}
                    />
                    <Text color={selectedTab === 'search' ? 'red' : 'black'}>
                        Search
                    </Text>
                </Flex>
                <Flex
                    flexDirection={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    onClick={openInsights}
                >
                    <FiLoader
                        size={'28px'}
                        color={selectedTab === 'insights' ? 'red' : 'black'}
                    />
                    <Text color={selectedTab === 'insights' ? 'red' : 'black'}>
                        Insights
                    </Text>
                </Flex>
                <Flex
                    flexDirection={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    onClick={openAccount}
                >
                    <FiUser
                        size={'28px'}
                        color={selectedTab === 'account' ? 'red' : 'black'}
                    />
                    <Text color={selectedTab === 'account' ? 'red' : 'black'}>
                        Account
                    </Text>
                </Flex>
            </Flex>
        </>
    )
}

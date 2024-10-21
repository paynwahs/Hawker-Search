'use server'

import { createClient } from '~/supabase/server'

const supabase = createClient()

export const getUser = async () => {
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user == null) {
        console.error('No user found, log in first.')
        return null
    }

    console.log('Printing user')
    console.log(user)

    return user
}

export const createFoodie = async () => {
    const { data, error } = await supabase.from('foodie').insert({}).select()

    if (error) return false

    console.log('foodie created!')
    console.log(data[0])

    return {
        roleId: data[0].id,
    }
}

export const createHawker = async ({
    name,
    location,
    halal,
    vegetarian,
    opening,
    closing,
    foodItems,
}) => {
    const { data: hawkerData, error: hawkerError } = await supabase
        .from('hawker')
        .insert({
            name,
            location,
            halal,
            vegetarian,
            opening,
            closing,
        })
        .select()

    if (hawkerError) return false

    console.log('Successful hawker creation')
    console.log(hawkerData)

    const { data: foodData, error: foodError } = await supabase
        .from('food')
        .insert(
            foodItems.map((item) => {
                return { name: item, hawker_id: hawkerData[0].id }
            })
        )
        .select()
    if (foodError) return false

    console.log('Successful food item creation')
    console.log(foodData)

    return {
        roleId: hawkerData[0].id,
    }
}

export const getHawkerInsights = async ({ hawkerId }) => {
    try {
        const {
            data: { session },
        } = await supabase.auth.getSession()

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analytics`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    hawker_id: hawkerId,
                }),
            }
        )
        const body = await response.json()
        return body
    } catch (e) {
        console.error(e)
        return []
    }
}

export async function getRecentPrompts({ hawkerId, numberOfPrompts }) {
    console.log(typeof hawkerId)
    console.log(hawkerId)
    console.log(typeof numberOfPrompts)
    console.log(numberOfPrompts)
    const { data: searchResponseData, error: searchResponseError } =
        await supabase
            .from('results')
            .select('search(text, date)')
            .eq('hawker_id', hawkerId)

    if (searchResponseError) {
        console.log('Error printing top data')
        console.log(searchResponseError)
        return []
    }

    const sortedData = searchResponseData.sort(
        (a, b) => new Date(b.search.date) - new Date(a.search.date)
    )

    const topData = sortedData
        .slice(0, numberOfPrompts)
        .map((item) => item.search.text)

    console.log('Printing top data')
    console.log(topData)

    return topData
}

export const getSearchResults = async ({
    message,
    location = null,
    halal = false,
    vegetarian = false,
}) => {
    try {
        const {
            data: { session },
        } = await supabase.auth.getSession()

        console.log('PRINTING SEARCH PARAMS')
        console.log(`${message} === ${location} === ${halal} === ${vegetarian}`)

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/search`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    location,
                    halal,
                    vegetarian,
                }),
            }
        )
        const body = await response.json()
        return body
    } catch (e) {
        console.error(e)
        return []
    }
}

export async function searchAndFavourites(hawker_id) {
    // Internal function for counting
    function countEvents(dates) {
        const today = new Date()
        const sevenDaysAgo = new Date(today)
        const allTimeCount = dates.length

        sevenDaysAgo.setDate(today.getDate() - 7)

        let todayCount = 0
        let last7DaysCount = 0

        dates.forEach((dateStr) => {
            const eventDate = new Date(dateStr)
            if (eventDate.toDateString() === today.toDateString()) {
                todayCount += 1
            }

            if (eventDate >= sevenDaysAgo && eventDate <= today) {
                last7DaysCount += 1
            }
        })

        return { todayCount, last7DaysCount, allTimeCount }
    }

    // Actual computation for search and favourite aggregate numbers
    const { data: favouritesData, error: favouriteError } = await supabase
        .from('favourite')
        .select(`date`)
        .eq('hawker_id', hawker_id)

    if (favouriteError) {
        console.log('LOGGIN FAV ERROR')
        console.log(favouriteError)
        return null
    }

    const favouritesDataArr = favouritesData.map((favourite) => {
        return favourite.date
    })

    const { data: searchData, error: errorData } = await supabase
        .from('results')
        .select(`search(date)`)
        .eq('hawker_id', hawker_id)

    if (errorData) {
        console.log('LOGGIN SEARCH ERROR')
        console.log(errorData)
        return null
    }

    const searchDataArr = searchData.map((search) => {
        return search.search.date
    })

    const searchCount = countEvents(searchDataArr)
    const favouriteCount = countEvents(favouritesDataArr)

    return { searchCount, favouriteCount }
}

export const getKeywords = async ({ hawkerId }) => {
    try {
        const {
            data: { session },
        } = await supabase.auth.getSession()

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/found`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    hawker_id: hawkerId,
                }),
            }
        )
        const body = await response.json()
        return body
    } catch (e) {
        console.error(e)
        return []
    }
}

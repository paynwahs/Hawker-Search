'use server'

export async function getStraightLineDistance(origin, destination) {
    const googleDirectionsApiKey =
        process.env.NEXT_PUBLIC_GOOGLE_DIRECTIONS_API_KEY
    return fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?` +
            `destinations=${encodeURIComponent(origin)}` +
            '&' +
            `origins=${encodeURIComponent(destination)}` +
            '&' +
            `key=${googleDirectionsApiKey}`
    )
        .then((res) => {
            return res.json()
        })
        .then((body) => {
            const distanceValue = body.rows[0].elements[0].distance.value
            const distanceString = body.rows[0].elements[0].distance.text
            console.log(
                `Distance calculated: ${distanceValue} ${distanceString}`
            )
            return { distanceValue, distanceString }
        })
        .catch((e) => {
            console.log(e)
        })
}

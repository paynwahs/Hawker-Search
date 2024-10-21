'use client'

import { useState } from 'react'

export default function useFavourite({ initial }) {
    const [favourited, setFavourited] = useState(initial)

    const toggleFavourite = (e) => {
        e.stopPropagation() // Prevents click from being propagated to parent click handler
        if (favourited) {
            // endpoint call to remove from favourites
        } else {
            // endpoint call to add to favourites
        }
        setFavourited((prev) => !prev)
    }

    return {
        favourited: favourited,
        toggleFavourite: toggleFavourite,
    }
}

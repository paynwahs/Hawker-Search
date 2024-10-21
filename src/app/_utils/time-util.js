'use client'

import { useState } from 'react'

export default function useTime({
    initialHour = 0,
    initialMinutes = 0,
    initialMeridian = 'am',
}) {
    const [hour, setHour] = useState(initialHour) // Will only take values 1 to 12
    const [minutes, setMinutes] = useState(initialMinutes) // Will only take values 0 to 59
    const [meridian, setMeridian] = useState(initialMeridian)

    const incrementHour = () => {
        if (hour == 12) {
            setHour(1)
        } else setHour((prev) => prev + 1)
    }

    const decrementHour = () => {
        if (hour == 1) {
            setHour(12)
        } else setHour((prev) => prev - 1)
    }

    const incrementMinutes = () => {
        if (minutes >= 55) {
            setMinutes((prev) => prev + 5 - 60)
        } else setMinutes((prev) => prev + 5)
    }

    const decrementMinutes = () => {
        if (minutes <= 5) {
            setMinutes((prev) => prev - 5 + 60)
        } else setMinutes((prev) => prev - 5)
    }

    const toggleMeridian = () => {
        if (meridian === 'am') {
            setMeridian('pm')
        } else setMeridian('am')
    }

    const getHourString = (twelveHourFormat = true) => {
        if (twelveHourFormat) {
            return `${hour}`
        } else {
            return `${meridian === 'am' ? hour : hour + 12}`
        }
    }

    const getMinuteString = () => {
        return `${minutes < 10 ? '0' : ''}${minutes}`
    }

    const getTimePrintString = (showMeridian = true) => {
        if (showMeridian) {
            return `${hour}:${minutes < 10 ? '0' : ''}${minutes}${meridian}`
        } else {
            return `${hour}:${minutes < 10 ? '0' : ''}${minutes}`
        }
    }

    const getTimeSaveString = () => {
        let processedHour = meridian === 'am' ? hour : hour + 12
        if (processedHour < 10) processedHour = '0' + `${processedHour}`
        let processedMinutes = minutes < 10 ? '0' + `${minutes}` : `${minutes}`
        return `${processedHour}:${processedMinutes}:00`
    }

    return {
        hour,
        minutes,
        meridian,
        getHourString,
        getMinuteString,
        incrementHour,
        decrementHour,
        incrementMinutes,
        decrementMinutes,
        toggleMeridian,
        getTimePrintString,
        getTimeSaveString,
    }
}

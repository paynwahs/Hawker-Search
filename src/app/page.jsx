'use client'

import Link from 'next/link'
import { Button } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { createClient } from '~/supabase/client'
import { useContext, useEffect, useState } from 'react'
import { getUser } from './_utils/data-api'
import { UserContext } from './_contexts/UserContext'

export default function Home() {
    const supabase = createClient()
    const router = useRouter()
    const { role } = useContext(UserContext)

    useEffect(() => {
        async function getAuthStatus() {
            const userSessionExists = await supabase.auth.getSession()

            console.log(`printing role: ${role}`)
            if (userSessionExists.session) console.log('session exists')
            else console.log('session doesnt exist')

            if (role) console.log('role exists')
            else console.log('role doesnt exist')

            if (userSessionExists.session && role) {
                // If user already has a session
                router.push(`${role}/home`)
            } else {
                // If user doesn't have a session
                router.push('login')
            }
        }
        getAuthStatus()
    }, [])

    return <div></div>
}

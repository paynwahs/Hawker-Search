'use client'

import { useState, createContext, useEffect } from 'react'
import { getUser } from '../_utils/data-api'

export const UserContext = createContext()

export default function UserProvider({ children }) {
    const [userId, setUserId] = useState(null)
    const [email, setEmail] = useState(null)
    const [role, setRole] = useState(null)
    const [roleId, setRoleId] = useState(null)
    const [name, setName] = useState(null)

    useEffect(() => {
        printData()
    }, [userId, email, role, roleId, name])

    const initialiseData = ({ userId, email, role, roleId, name }) => {
        if (userId) setUserId(userId)
        if (email) setEmail(email)
        if (role) setRole(role)
        if (roleId) setRoleId(parseInt(roleId))
        if (name) setName(name)
    }

    const wipeData = () => {
        setUserId(null)
        setEmail(null)
        setRole(null)
        setRoleId(null)
        setName(null)
    }

    const printData = () => {
        console.log(
            `userId: ${userId}\n email:${email}\n role:${role}\n roleId: ${roleId}\n name:${name}`
        )
    }

    return (
        <UserContext.Provider
            value={{
                userId,
                email,
                role,
                roleId,
                name,
                initialiseData,
                wipeData,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '~/supabase/server'
import { createSession } from '../session'

const supabase = createClient()

export async function signupUser({ name, email, password, role }) {
    /**
     * Takes in name, email, password, role and creates new user
     * Returns userId, email, role, name
     */
    const authData = {
        email,
        password,
        options: {
            data: {
                name,
                role,
            },
        },
    }

    const { data, error } = await supabase.auth.signUp(authData)

    if (error) {
        console.log('Signup failed')
        console.log(error)
        return false
    }

    const parsedMetadata = data.user.user_metadata
    const processedData = {
        userId: data.user.id,
        email: data.user.email,
        name: parsedMetadata.name,
        role: parsedMetadata.role,
    }
    console.log('Signup successful, printing user data')
    console.log(data)
    console.log(processedData)

    return processedData
}

export async function loginUser({ email, password }) {
    /**
     * Takes in email, password
     * Returns userId, email, role, name, roleId
     */
    const authData = {
        email,
        password,
    }
    // Get userId, email, name, role
    const { data: authResultData, error: authResultError } =
        await supabase.auth.signInWithPassword(authData)
    if (authResultError) {
        return false
    }
    const parsedMetadata = authResultData.user.user_metadata
    let processedData = {
        userId: authResultData.user.id,
        email: authResultData.user.email,
        name: parsedMetadata.name,
        role: parsedMetadata.role,
    }
    console.log('Login successful, printing user data')
    console.log(processedData)

    // Get roleId
    const tableName = parsedMetadata.role === 'foodie' ? 'foodie' : 'hawker'
    const {
        data: { id: roleId },
        error,
    } = await supabase
        .from(tableName)
        .select('id')
        .eq('user_id', authResultData.user.id)
        .limit(1)
        .single()

    // Final data object contains all five variables
    processedData = { ...processedData, roleId }
    console.log('Final data')
    console.log(processedData)

    return processedData
}

'use client'

import {
    FiCheck,
    FiChevronLeft,
    FiPlus,
    FiX,
    FiChevronUp,
    FiChevronDown,
} from 'react-icons/fi'
import {
    Box,
    Button,
    Text,
    Stack,
    Input,
    IconButton,
    Flex,
    Image,
} from '@chakra-ui/react'
import { useState, useRef, useEffect, useContext } from 'react'
import {
    Step,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
    useSteps,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { validateEmail } from '../_utils/validate'
import { createFoodie } from '../_utils/data-api'
import { signupUser } from '../_utils/auth'
import { UserContext } from '../_contexts/UserContext'

const IntroComponent = ({ type, setType, setSubmitHandler }) => {
    const [errorMessage, setErrorMessage] = useState('')
    useEffect(() => {
        // Saves value of name, so must add name as dependency to update value of name stored
        const handleSubmit = () => {
            if (type === null) {
                setErrorMessage('Please select an option')
                return false
            } else return true
        }
        setSubmitHandler(() => handleSubmit)
    }, [type])

    return (
        <Stack direction={'column'} spacing={'24px'} alignItems={'center'}>
            <Text fontSize={'2xl'} alignSelf={'flex-start'} fontWeight={'bold'}>
                Are you a hawker or customer?
            </Text>
            {errorMessage !== '' && (
                <Text fontSize={'md'} color={'red'}>
                    {errorMessage}
                </Text>
            )}
            <Stack
                flexDir={'column'}
                justifyContent={'center'}
                alignItems={'center'}
                height={'fit-content'}
                width={'85%'}
                borderRadius={'12px'}
                padding={'12px'}
                bgColor={'white'}
                color={'black'}
                borderWidth={type === 'hawker' ? '6px' : '0.5px'}
                borderColor={'teal.600'}
                shadow={'xl'}
                onClick={() => setType('hawker')}
            >
                <Image
                    src={'hawker.png'}
                    alt="hawker stall"
                    width="100%"
                    height="150px"
                    objectPosition={'50% 90%'}
                    objectFit={'cover'}
                />
                <Text fontSize={'xl'} fontWeight={'bold'} textAlign={'center'}>
                    Hawker
                </Text>
            </Stack>
            <Stack
                flexDir={'column'}
                justifyContent={'center'}
                alignItems={'center'}
                height={'fit-content'}
                width={'85%'}
                borderRadius={'12px'}
                padding={'12px'}
                borderWidth={type === 'foodie' ? '6px' : '0.5px'}
                borderColor={'teal.600'}
                bgColor={'white'}
                color={'black'}
                shadow={'xl'}
                onClick={() => setType('foodie')}
            >
                <Image
                    src={'customer.png'}
                    alt="hawker stall"
                    width="100%"
                    height="150px"
                    objectPosition={'50% 70%'}
                    objectFit={'cover'}
                />
                <Text fontSize={'xl'} fontWeight={'bold'} textAlign={'center'}>
                    Customer
                </Text>
            </Stack>
        </Stack>
    )
}

const NameSection = ({ name, setName, setSubmitHandler }) => {
    const [errorMessage, setErrorMessage] = useState('')
    const inputRef = useRef(null)

    useEffect(() => {
        // Saves value of name, so must add name as dependency to update value of name stored
        const handleSubmit = () => {
            if (name === '') {
                setErrorMessage('Name cannot be empty')
                inputRef.current.focus()
                return false
            } else return true
        }
        setSubmitHandler(() => handleSubmit)
    }, [name])

    return (
        <Stack direction={'column'} spacing="24px">
            <Text fontSize={'2xl'} alignSelf={'flex-start'} fontWeight={'bold'}>
                What is your name?
            </Text>
            {errorMessage !== '' && (
                <Text fontSize={'md'} color={'red'}>
                    {errorMessage}
                </Text>
            )}
            <Box width={'100%'} height={'48px'}>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Tan"
                    autoFocus
                    height={'100%'}
                    ref={inputRef}
                />
            </Box>
        </Stack>
    )
}

const EmailSection = ({ email, setEmail, setSubmitHandler }) => {
    const [errorMessage, setErrorMessage] = useState('')
    const inputRef = useRef(null)

    useEffect(() => {
        // Saves value of name, so must add name as dependency to update value of name stored
        const handleSubmit = () => {
            if (email === '') {
                setErrorMessage('Email cannot be empty')
                inputRef.current.focus()
                return false
            } else if (!validateEmail(email)) {
                setErrorMessage('Email is invalid')
                inputRef.current.focus()
                return false
            } else return true
        }
        setSubmitHandler(() => handleSubmit)
    }, [email])

    return (
        <Stack direction={'column'} spacing="24px">
            <Text fontSize={'2xl'} alignSelf={'flex-start'} fontWeight={'bold'}>
                What is your email?
            </Text>
            {errorMessage !== '' && (
                <Text fontSize={'md'} color={'red'}>
                    {errorMessage}
                </Text>
            )}
            <Box width={'100%'} height={'48px'}>
                <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. johntan@gmail.com"
                    autoFocus
                    height={'100%'}
                    ref={inputRef}
                />
            </Box>
        </Stack>
    )
}

const PasswordSection = ({ password, setPassword, setSubmitHandler }) => {
    const [errorMessage, setErrorMessage] = useState('')
    const inputRef = useRef(null)

    useEffect(() => {
        // Saves value of name, so must add name as dependency to update value of name stored
        const handleSubmit = () => {
            if (password === '') {
                setErrorMessage('Password cannot be empty')
                inputRef.current.focus()
                return false
            } else return true
        }
        setSubmitHandler(() => handleSubmit)
    }, [password])

    return (
        <Stack direction={'column'} spacing="24px">
            <Text fontSize={'2xl'} alignSelf={'flex-start'} fontWeight={'bold'}>
                Please set your password
            </Text>
            {errorMessage !== '' && (
                <Text fontSize={'md'} color={'red'}>
                    {errorMessage}
                </Text>
            )}
            <Box width={'100%'} height={'48px'}>
                <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. password123"
                    autoFocus
                    height={'100%'}
                    ref={inputRef}
                />
            </Box>
        </Stack>
    )
}

export default function Home() {
    const router = useRouter()

    const [type, setType] = useState('null')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // Stepper
    const { activeStep, setActiveStep, goToNext, goToPrevious } = useSteps({
        index: 0,
    })
    const stepRefs = useRef([])
    const stepContainerRef = useRef(null)
    useEffect(() => {
        if (stepRefs.current[activeStep] && stepContainerRef) {
            const stepRect =
                stepRefs.current[activeStep].getBoundingClientRect()
            const stepContainerRect =
                stepContainerRef.current.getBoundingClientRect()
            stepContainerRef.current.scrollLeft +=
                stepRect.left - stepContainerRect.left
        }
    }, [activeStep])
    const [childSubmitHandler, setChildSubmitHandler] = useState(() => {})
    const steps = [
        {
            title: 'Intro',
            component: (
                <IntroComponent
                    type={type}
                    setType={setType}
                    setSubmitHandler={setChildSubmitHandler}
                />
            ),
        },
        {
            title: 'Name',
            component: (
                <NameSection
                    name={name}
                    setName={setName}
                    setSubmitHandler={setChildSubmitHandler}
                />
            ),
        },
        {
            title: 'Email',
            component: (
                <EmailSection
                    email={email}
                    setEmail={setEmail}
                    setSubmitHandler={setChildSubmitHandler}
                />
            ),
        },
        {
            title: 'Password',
            component: (
                <PasswordSection
                    password={password}
                    setPassword={setPassword}
                    setSubmitHandler={setChildSubmitHandler}
                />
            ),
        },
    ]
    const FormComponent = steps[activeStep].component

    const { initialiseData } = useContext(UserContext)

    // Navigation buttons
    const handleBack = () => {
        if (activeStep === 0) {
            setChildSubmitHandler(null)
            router.back()
        } else goToPrevious()
    }
    const handleSubmit = async () => {
        // Doesn't pass section checks
        if (childSubmitHandler && !childSubmitHandler()) {
            return
        }
        // Last step: Submit form
        if (activeStep === steps.length - 1) {
            const userData = await signupUser({
                name,
                email,
                password,
                role: type,
            })
            if (userData) {
                // Update context with userId, role, email, name
                initialiseData({
                    userId: userData.userId,
                    role: type,
                    email,
                    name,
                })
                console.log('successfully created user')
            }

            if (type === 'foodie') {
                const foodieData = await createFoodie()
                // Update context with roleId for foodies
                initialiseData({ roleId: foodieData.roleId })
                router.push('/onboarding/foodie_success')
            } else {
                // Go to hawker onboarding
                router.push('/onboarding/hawker_start')
            }
        }
        // Not last step: Move onto next section
        else {
            goToNext()
            setChildSubmitHandler(null)
        }
    }

    return (
        <Box paddingX={'24px'} paddingTop={'24px'}>
            {/* Progress bar */}
            {/* <div className="overflow-x-scroll" ref={stepContainerRef}>
                <Stepper index={activeStep} marginBottom={'24px'} size="sm">
                    {steps.map((step, index) => (
                        <Step
                            key={index}
                            ref={(step) => (stepRefs.current[index] = step)}
                            onClick={() => setActiveStep(index)}
                        >
                            <StepIndicator>
                                <StepStatus
                                    complete={<StepIcon />}
                                    incomplete={<StepNumber />}
                                    active={<StepNumber />}
                                />
                            </StepIndicator>
                            <Box>
                                <StepTitle>{step.title}</StepTitle>
                            </Box>
                            <StepSeparator size="xs" />
                        </Step>
                    ))}
                </Stepper>
            </div> */}
            <Flex
                flexDirection={'row'}
                justifyContent={'space-between'}
                width={'100%'}
                marginBottom={'24px'}
            >
                {/* Back Button */}
                <Button
                    width={'84px'}
                    display={'flex'}
                    flexDirection={'row'}
                    justifyContent={'space-around'}
                    onClick={handleBack}
                >
                    <FiChevronLeft />
                    Back
                </Button>
                {/* Submit Button */}
                <Button
                    width={'84px'}
                    display={'flex'}
                    flexDirection={'row'}
                    justifyContent={'space-around'}
                    bg={'green'}
                    color={'white'}
                    onClick={handleSubmit}
                >
                    {activeStep < steps.length - 1 ? 'Next' : 'Finish'}
                </Button>
            </Flex>
            <Text fontSize={'xl'} marginBottom={'12px'}>
                Step {activeStep + 1} of {steps.length}
            </Text>
            {/* Form */}
            {FormComponent}
        </Box>
    )
}

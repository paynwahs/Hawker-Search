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
import useTime from '@/app/_utils/time-util'
import { useMutation } from '@tanstack/react-query'
import { createHawker } from '@/app/_utils/data-api'
import { UserContext } from '@/app/_contexts/UserContext'

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
                What is your stall name?
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
                    placeholder="e.g. ABC Bee Hoon"
                    autoFocus
                    height={'100%'}
                    ref={inputRef}
                />
            </Box>
        </Stack>
    )
}

const LocationSection = ({ location, setLocation, setSubmitHandler }) => {
    const [errorMessage, setErrorMessage] = useState('')
    const inputRef = useRef(null)

    useEffect(() => {
        const handleSubmit = () => {
            if (location.length !== 6) {
                setErrorMessage('Postal code must be 6 digits')
                inputRef.current.focus()
                return false
            } else return true
        }
        setSubmitHandler(() => handleSubmit)
    }, [location])

    return (
        <Stack direction={'column'} spacing="24px">
            <Box>
                <Text
                    fontSize={'2xl'}
                    alignSelf={'flex-start'}
                    fontWeight={'bold'}
                    marginBottom={'12px'}
                >
                    What is your postal code?
                </Text>
                <Text fontSize={'xl'}>
                    This will help customers find your stall.
                </Text>
            </Box>
            {errorMessage !== '' && (
                <Text fontSize={'md'} color={'red'}>
                    {errorMessage}
                </Text>
            )}
            <Box width={'100%'} height={'48px'}>
                <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    type="number"
                    height={'100%'}
                    placeholder="e.g. 123456"
                    autoFocus
                    ref={inputRef}
                />
            </Box>
        </Stack>
    )
}

const OpeningSection = ({
    hour,
    minutes,
    meridian,
    incrementHour,
    decrementHour,
    incrementMinutes,
    decrementMinutes,
    toggleMeridian,
}) => {
    return (
        <Stack direction={'column'} spacing={'24px'}>
            <Text fontSize={'2xl'} alignSelf={'flex-start'} fontWeight={'bold'}>
                What time do you open?
            </Text>
            <Flex
                width={'100%'}
                flexDir={'column'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                {/* Time select component */}
                <Stack direction={'row'} spacing={'18px'} alignItems={'center'}>
                    {/* Hour */}
                    <Flex
                        flexDir={'column'}
                        justifyContent={'center'}
                        alignItems={'center'}
                    >
                        <FiChevronUp size={'50px'} onClick={incrementHour} />
                        <Text fontSize={'3xl'}>{hour}</Text>
                        <FiChevronDown size={'50px'} onClick={decrementHour} />
                    </Flex>
                    {/* : */}
                    <Text fontSize={'3xl'}>:</Text>
                    {/* Minutes */}
                    <Flex
                        flexDir={'column'}
                        justifyContent={'center'}
                        alignItems={'center'}
                    >
                        <FiChevronUp size={'50px'} onClick={incrementMinutes} />
                        <Text fontSize={'3xl'}>{minutes}</Text>
                        <FiChevronDown
                            size={'50px'}
                            onClick={decrementMinutes}
                        />
                    </Flex>
                    {/* Meridian */}
                    <Flex
                        flexDir={'column'}
                        justifyContent={'center'}
                        alignItems={'center'}
                    >
                        <FiChevronUp size={'50px'} onClick={toggleMeridian} />
                        <Text fontSize={'3xl'}>{meridian}</Text>
                        <FiChevronDown size={'50px'} onClick={toggleMeridian} />
                    </Flex>
                </Stack>
            </Flex>
        </Stack>
    )
}

const ClosingSection = ({
    openingTimeString,
    hour,
    minutes,
    meridian,
    incrementHour,
    decrementHour,
    incrementMinutes,
    decrementMinutes,
    toggleMeridian,
}) => {
    return (
        <Stack direction={'column'} spacing={'24px'}>
            <Box>
                <Text
                    fontSize={'2xl'}
                    alignSelf={'flex-start'}
                    fontWeight={'bold'}
                    marginBottom={'12px'}
                >
                    What time do you close?
                </Text>
                <Text fontSize={'xl'}>
                    Your opening time is {openingTimeString}.
                </Text>
            </Box>
            <Flex
                width={'100%'}
                flexDir={'column'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                {/* Time select component */}
                <Stack direction={'row'} spacing={'18px'} alignItems={'center'}>
                    {/* Hour */}
                    <Flex
                        flexDir={'column'}
                        justifyContent={'center'}
                        alignItems={'center'}
                    >
                        <FiChevronUp size={'50px'} onClick={incrementHour} />
                        <Text fontSize={'3xl'}>{hour}</Text>
                        <FiChevronDown size={'50px'} onClick={decrementHour} />
                    </Flex>
                    {/* : */}
                    <Text fontSize={'3xl'}>:</Text>
                    {/* Minutes */}
                    <Flex
                        flexDir={'column'}
                        justifyContent={'center'}
                        alignItems={'center'}
                    >
                        <FiChevronUp size={'50px'} onClick={incrementMinutes} />
                        <Text fontSize={'3xl'}>{minutes}</Text>
                        <FiChevronDown
                            size={'50px'}
                            onClick={decrementMinutes}
                        />
                    </Flex>
                    {/* Meridian */}
                    <Flex
                        flexDir={'column'}
                        justifyContent={'center'}
                        alignItems={'center'}
                    >
                        <FiChevronUp size={'50px'} onClick={toggleMeridian} />
                        <Text fontSize={'3xl'}>{meridian}</Text>
                        <FiChevronDown size={'50px'} onClick={toggleMeridian} />
                    </Flex>
                </Stack>
            </Flex>
        </Stack>
    )
}

const FoodItem = ({ name, index, onDelete }) => {
    return (
        <Flex
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            width={'fit-content'}
            background={'pink'}
            borderRadius={'16px'}
            paddingLeft={'12px'}
            paddingY={'6px'}
            onClick={() => {
                onDelete(index)
            }}
        >
            <Text>{name}</Text>
            <IconButton
                icon={<FiX />}
                width={'fit-content'}
                height={'100%'}
                bg={'transparent'}
                color={'red'}
            />
        </Flex>
    )
}

const FoodItemsSection = ({ foodItems, setFoodItems, setSubmitHandler }) => {
    const [currentItem, setCurrentItem] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const inputRef = useRef(null)

    useEffect(() => {
        const handleSubmit = () => {
            if (foodItems.length === 0) {
                setErrorMessage(
                    'Input food into the box and click the green button to add'
                )
                inputRef.current.focus()
                return false
            } else return true
        }
        setSubmitHandler(() => handleSubmit)
    }, [foodItems])

    const handleAdd = () => {
        if (currentItem !== '') {
            setFoodItems((items) => [currentItem, ...items])
            setCurrentItem('')
            inputRef.current.focus()
        }
    }

    const handleDelete = (index) => {
        if (index < foodItems.length) {
            setFoodItems((items) => items.filter((_, i) => i !== index))
            inputRef.current.focus()
        }
    }

    return (
        <Stack direction={'column'} spacing="24px">
            <Stack spacing={'12px'}>
                <Text
                    fontSize={'2xl'}
                    alignSelf={'flex-start'}
                    fontWeight={'bold'}
                >
                    What food or drinks do you sell?
                </Text>
                <Text fontSize={'xl'}>
                    For example, if you sell Chicken Rice, type “Chicken Rice”
                    into the box, then tap “Add”. Do this for all the food or
                    drinks you sell.
                </Text>
            </Stack>
            {errorMessage !== '' && (
                <Text fontSize={'md'} color={'red'}>
                    {errorMessage}
                </Text>
            )}
            <Stack
                direction={'row'}
                spacing={'12px'}
                width={'100%'}
                height={'48px'}
                alignItems={'center'}
            >
                <Input
                    value={currentItem}
                    onChange={(e) => setCurrentItem(e.target.value)}
                    placeholder="e.g. Chicken Rice"
                    width={'85%'}
                    height={'100%'}
                    borderRadius={'24px'}
                    autoFocus
                    ref={inputRef}
                />
                <Button
                    width={'84px'}
                    display={'flex'}
                    flexDirection={'row'}
                    bg={'black'}
                    color={'white'}
                    justifyContent={'space-around'}
                    onClick={handleAdd}
                >
                    Add
                </Button>
            </Stack>
            {foodItems.length > 0 && (
                <Text fontSize={'xl'}>
                    Tap on any food or drink to delete it
                </Text>
            )}
            {foodItems.map((itemName, index) => {
                return (
                    <FoodItem
                        key={index}
                        name={itemName}
                        index={index}
                        onDelete={handleDelete}
                    />
                )
            })}
        </Stack>
    )
}

const HalalSection = ({ halal, setHalal }) => {
    return (
        <Stack direction={'column'} spacing="24px">
            <Text fontSize={'2xl'} alignSelf={'flex-start'} fontWeight={'bold'}>
                Is your stall halal?
            </Text>
            <Stack flexDir={'column'} alignItems={'center'} spacing={'24px'}>
                <Button
                    width={'85%'}
                    height={'120px'}
                    display={'flex'}
                    flexDirection={'row'}
                    justifyContent={'center'}
                    onClick={() => setHalal(true)}
                    borderWidth={halal ? '6px' : '0.5px'}
                    borderColor={'teal.600'}
                    borderRadius={'12px'}
                    shadow={'xl'}
                    bgColor={'white'}
                    color={'black'}
                >
                    <Text fontSize={'2xl'}>Yes</Text>
                </Button>
                <Button
                    width={'85%'}
                    height={'120px'}
                    display={'flex'}
                    flexDirection={'row'}
                    justifyContent={'space-around'}
                    onClick={() => setHalal(false)}
                    borderWidth={!halal ? '6px' : '0.5px'}
                    borderColor={'teal.600'}
                    borderRadius={'12px'}
                    shadow={'xl'}
                    bgColor={'white'}
                    color={'black'}
                >
                    <Text fontSize={'2xl'}>No</Text>
                </Button>
            </Stack>
        </Stack>
    )
}

const VegetarianSection = ({ veggie, setVeggie }) => {
    return (
        <Stack direction={'column'} spacing="24px">
            <Text fontSize={'2xl'} alignSelf={'flex-start'} fontWeight={'bold'}>
                Is your stall vegetarian?
            </Text>
            <Stack flexDir={'column'} alignItems={'center'} spacing={'24px'}>
                <Button
                    width={'85%'}
                    height={'120px'}
                    display={'flex'}
                    flexDirection={'row'}
                    justifyContent={'center'}
                    onClick={() => setVeggie(true)}
                    borderWidth={veggie ? '6px' : '0.5px'}
                    borderColor={'teal.600'}
                    borderRadius={'12px'}
                    shadow={'xl'}
                    bgColor={'white'}
                    color={'black'}
                >
                    <Text fontSize={'2xl'}>Yes</Text>
                </Button>
                <Button
                    width={'85%'}
                    height={'120px'}
                    display={'flex'}
                    flexDirection={'row'}
                    justifyContent={'space-around'}
                    onClick={() => setVeggie(false)}
                    borderWidth={!veggie ? '6px' : '0.5px'}
                    borderColor={'teal.600'}
                    borderRadius={'12px'}
                    shadow={'xl'}
                    bgColor={'white'}
                    color={'black'}
                >
                    <Text fontSize={'2xl'}>No</Text>
                </Button>
            </Stack>
        </Stack>
    )
}

export default function HawkerOnboarding() {
    // In charge of tracking state and controlling form navigation
    const [name, setName] = useState('')
    const [location, setLocation] = useState('')
    const {
        getHourString: getOpeningHour,
        getMinuteString: getOpeningMinutes,
        meridian: openingMeridian,
        incrementHour: incrementOpeningHour,
        decrementHour: decrementOpeningHour,
        incrementMinutes: incrementOpeningMinutes,
        decrementMinutes: decrementOpeningMinutes,
        toggleMeridian: toggleOpeningMeridian,
        getTimePrintString: getOpeningTimePrintString,
        getTimeSaveString: getOpeningTimeSaveString,
    } = useTime({
        initialHour: 9,
        initialMinutes: 0,
        initialMeridian: 'am',
    })

    const {
        getHourString: getClosingHour,
        getMinuteString: getClosingMinutes,
        meridian: ClosingMeridian,
        incrementHour: incrementClosingHour,
        decrementHour: decrementClosingHour,
        incrementMinutes: incrementClosingMinutes,
        decrementMinutes: decrementClosingMinutes,
        toggleMeridian: toggleClosingMeridian,
        getTimeSaveString: getClosingTimeSaveString,
    } = useTime({
        initialHour: 6,
        initialMinutes: 0,
        initialMeridian: 'pm',
    })
    const [foodItems, setFoodItems] = useState([])
    const [halal, setHalal] = useState(false)
    const [vegetarian, setVegetarian] = useState(false)

    const { activeStep, setActiveStep, goToNext, goToPrevious } = useSteps({
        index: 0,
    })

    // To scroll stepper so that active step is always in view
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

    const router = useRouter()
    const { initialiseData } = useContext(UserContext)

    // Create hawker on Supabase
    const createHawkerMutation = useMutation({
        mutationFn: async () => {
            const hawkerData = await createHawker({
                name,
                location,
                halal,
                vegetarian,
                opening: getOpeningTimeSaveString(),
                closing: getClosingTimeSaveString(),
                foodItems,
            })
            // Update context with roleId for hawkers
            initialiseData({ roleId: hawkerData.roleId })
        },
    })

    // Child sections can pass callback function to parent
    // Parent will run child callback before doing any navigation
    const [childSubmitHandler, setChildSubmitHandler] = useState(() => {})
    const handleSubmit = () => {
        if (childSubmitHandler && !childSubmitHandler()) {
            // Don't navigate if child callback returns false
            return
        }
        if (activeStep === steps.length - 1) {
            createHawkerMutation.mutate({
                name,
                location,
                halal,
                vegetarian,
                opening: getOpeningTimeSaveString(),
                closing: getClosingTimeSaveString(),
                foodItems,
            })

            // Bring hawker to hawker homepage
            router.push('/onboarding/hawker_success')
        } else {
            goToNext()
            setChildSubmitHandler(null) // Reset child callback upon navigation
        }
    }

    const handleBack = () => {
        if (activeStep === 0) {
            setChildSubmitHandler(null) // Reset child callback upon navigation
            router.back()
        } else goToPrevious()
    }

    const steps = [
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
            title: 'Location',
            component: (
                <LocationSection
                    location={location}
                    setLocation={setLocation}
                    setSubmitHandler={setChildSubmitHandler}
                />
            ),
        },
        {
            title: 'Open',
            component: (
                <OpeningSection
                    hour={getOpeningHour()}
                    minutes={getOpeningMinutes()}
                    meridian={openingMeridian}
                    incrementHour={incrementOpeningHour}
                    decrementHour={decrementOpeningHour}
                    incrementMinutes={incrementOpeningMinutes}
                    decrementMinutes={decrementOpeningMinutes}
                    toggleMeridian={toggleOpeningMeridian}
                />
            ),
        },
        {
            title: 'Close',
            component: (
                <ClosingSection
                    openingTimeString={getOpeningTimePrintString()}
                    hour={getClosingHour()}
                    minutes={getClosingMinutes()}
                    meridian={ClosingMeridian}
                    incrementHour={incrementClosingHour}
                    decrementHour={decrementClosingHour}
                    incrementMinutes={incrementClosingMinutes}
                    decrementMinutes={decrementClosingMinutes}
                    toggleMeridian={toggleClosingMeridian}
                />
            ),
        },
        {
            title: 'Menu',
            component: (
                <FoodItemsSection
                    foodItems={foodItems}
                    setFoodItems={setFoodItems}
                    setSubmitHandler={setChildSubmitHandler}
                />
            ),
        },
        {
            title: 'Halal',
            component: <HalalSection halal={halal} setHalal={setHalal} />,
        },
        {
            title: 'Vegetarian',
            component: (
                <VegetarianSection
                    veggie={vegetarian}
                    setVeggie={setVegetarian}
                />
            ),
        },
    ]

    const FormComponent = steps[activeStep].component

    return (
        <>
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
        </>
    )
}

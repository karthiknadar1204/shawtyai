"use client"

import { Button } from '@/components/ui/button'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { Cover } from "@/components/ui/cover";
import { ShineBorder } from '@/components/magicui/shine-border';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import TooltipCredits from '../components/creditsButton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { createVideo } from '../actions/create'
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect'
import { TextHoverEffect } from '@/components/ui/text-hover-effect'

const CreateProject = ({ user, credits }: { user: string | null; credits: number }) => {
    const customMessages = [
        "Generating your unique script",
        "Adding some spices",
        "Mixing it up"
    ]

    const genZWords = [
        "viral shorts",
        "bussin' content",
        "slay videos", 
        "no cap clips",
        "fire content",
        "it's giving vibes",
        "periodt videos",
        "bestie content",
        "chef's kiss moments",
        "that's so fetch",
        "iconic moments",
        "slay queen energy",
        "main character energy",
        "bestie behavior"
    ]


    const [currentWordIndex, setCurrentWordIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWordIndex((prev) => (prev + 1) % genZWords.length)
        }, 3000) // Change word every 3 seconds

        return () => clearInterval(interval)
    }, [])

    const defaultFacts = [
        "Did you know? The shortest war in history lasted only 38 minutes!",
        "Fun fact: Honey never spoils - archaeologists have found edible honey in ancient Egyptian tombs!",
        "Interesting: A group of flamingos is called a 'flamboyance'!",
        "Amazing: There are more possible games of chess than atoms in the observable universe!",
        "Cool fact: The human brain contains approximately 86 billion neurons!",
        "Did you know? Octopuses have three hearts and blue blood!",
        "Fun fact: A jiffy is an actual unit of time - it's 1/100th of a second!",
        "Interesting: Bananas are berries, but strawberries aren't!",
        "Amazing: The Great Wall of China isn't visible from space with the naked eye!",
        "Cool fact: There are more trees on Earth than stars in the Milky Way!",
        "Mind-blowing: Wombat poop is cube-shaped! Nature's little dice!",
        "Fascinating: Dolphins have names for each other and can recognize themselves in mirrors!",
        "Incredible: A single cloud can weigh more than a million pounds!",
        "Wild fact: There's a species of jellyfish that can live forever by reverting to its juvenile form!",
        "Surprising: The human nose can detect over 1 trillion different smells!",
        "Cool discovery: There are more possible arrangements of a deck of cards than seconds since the Big Bang!",
        "Amazing: A group of owls is called a 'parliament' - how fitting!",
        "Fun science: The speed of light is so fast that it could go around Earth 7.5 times in one second!",
        "Mind-bending: Time moves slower on the top of Mount Everest than at sea level!",
        "Incredible: Your body produces 25 million new cells every second!"
    ]
    const router = useRouter()
    const placeholders = [
        "What's the first rule of Fight Club?",
        "Who is Tyler Durden?",
        "Where is Andrew Laeddis Hiding?",
        "Write a Javascript method to reverse a string",
        "How to assemble your own PC?",
    ];
    const [prompt, setPrompt] = useState("")
    const [showLoginDialog, setShowLoginDialog] = useState(false)
    const [showCreditsDialog, setShowCreditsDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [currentLoadingStep, setCurrentLoadingStep] = useState(0)
    const [randomFacts, setRandomFacts] = useState<string[]>([])

    // Create infinite queue with custom messages and random facts
    useEffect(() => {
        if (!isLoading) {
            setCurrentLoadingStep(0);
            setRandomFacts([]);
            return;
        }
        
        const timeout = setTimeout(() => {
            setCurrentLoadingStep((prevState) => {
                const totalItems = customMessages.length + defaultFacts.length;
                return (prevState + 1) % totalItems; // Infinite loop
            });
        }, 3000); // 3 seconds per item for better reading

        return () => clearTimeout(timeout);
    }, [currentLoadingStep, isLoading, customMessages.length, defaultFacts.length]);

    // Get current message from infinite queue
    const getCurrentMessage = () => {
        if (currentLoadingStep < customMessages.length) {
            return customMessages[currentLoadingStep];
        } else {
            const factIndex = currentLoadingStep - customMessages.length;
            return defaultFacts[factIndex];
        }
    };

    const handleCreateVideo = async () => {
        setIsLoading(true)
        setCurrentLoadingStep(0)

        try {
            const result = await createVideo(prompt)

            if (result?.videoId) {
                const pollInterval = setInterval(async () => {
                    try {
                        const response = await fetch(`/api/video-status/${result.videoId}`)
                        const data = await response.json()

                        if (data.completed) {
                            clearInterval(pollInterval)
                            router.replace(`/videos/${result.videoId}`)
                        } else if (data.failed) {
                            clearInterval(pollInterval)
                            setIsLoading(false)
                            setCurrentLoadingStep(0)
                            alert('video generating failed')
                        }
                    } catch (error) {
                        console.log('still processing....')
                    }
                }, 5000)
            } else {
                setIsLoading(false)
                setCurrentLoadingStep(0)
                alert('Failed to create video')
            }
        } catch (error) {
            setIsLoading(false)
            setCurrentLoadingStep(0)
            console.error('Failed to create video', error)
            alert('Failed to create video')
        }
    }
    return (
        <div className='w-screen h-screen flex flex-col relative overflow-hidden'>
            <BackgroundRippleEffect rows={12} cols={30} cellSize={60} />
            {
                !user &&
                <div className='flex justify-end gap-1 mr-7 mt-5 relative z-10'>
                    <SignInButton>
                        <Button className='bg-black border border-gray-400 text-white rounded-lg mx-2 hover:bg-gray-900 transitioncolors duration-150 cursor-pointer'>
                            Sign In
                        </Button>
                    </SignInButton>
                    <SignUpButton>
                        <Button className='bg-gradient-to-br hover:opacity-80 text-white rounded-lg from-[#3352CC] to-[#1C2D70] font-medium cursor-pointer'>
                            Sign up
                        </Button>
                    </SignUpButton>
                </div>
            }
            {user &&
                <div className='flex justify-end mr-7 mt-5 relative z-10'>
                    <TooltipCredits credits={credits} />
                    <Link href={"/dashboard"}>
                        <Button className='bg-gradient-to-br hover:opacity-80 text-white rounded-lg from-[#3352CC] to-[#1C2D70] font-medium mx-2 cursor-pointer'>
                            Dashboard
                        </Button>
                    </Link>
                </div>
            }

            <Dialog open={isLoading} onOpenChange={() => {}}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Creating Your Video</DialogTitle>
                        <DialogDescription>
                            Please wait while we generate your amazing video...
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <div className="flex items-center justify-center mb-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3352CC]"></div>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-medium">
                                {getCurrentMessage()}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                {currentLoadingStep < customMessages.length ? "Processing..." : "Fun fact while you wait!"}
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <h1 className="text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-10 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white">
                Turn your thoughts into
                <div className='h-6'></div>
                <div className="w-full h-32 flex items-center justify-center px-8">
                    <div className="w-full max-w-4xl">
                        <TextHoverEffect text={genZWords[currentWordIndex]} />
                    </div>
                </div>
            </h1>

            <div className='flex justify-center mt-auto mb-[400px] relative z-10'>
                <div className='relative rounded-3xl w-[500px] overflow-hidden'>
                    <ShineBorder
                        className='z-10'
                        shineColor={["#3352CC", "#3352CC", "#3352CC", "#3352CC"]}

                    />
                    <PlaceholdersAndVanishInput
                        placeholders={placeholders}
                        onChange={(e) => setPrompt(e.target.value)}
                        onSubmit={(e) => {
                            e.preventDefault()
                            if (!user) {
                                return setTimeout(() => setShowLoginDialog(true), 1000)
                            }
                            if (credits < 1) {
                                return setTimeout(() => setShowCreditsDialog(true), 700)
                            }
                            setTimeout(() => handleCreateVideo(), 1000)
                        }}
                    />
                </div>

                <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                    <DialogContent className='sm-max-w-[425px]'>
                        <DialogHeader>
                            <DialogTitle>Hello There!</DialogTitle>
                            <DialogDescription>Please sing in to create videos</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <SignInButton>
                                <Button className='bg-black border border-gray-400 text-white rounded-lg mx-2 hover:bg-gray-900 transitioncolors duration-150 cursor-pointer'>
                                    Sign In
                                </Button>
                            </SignInButton>
                            <SignUpButton>
                                <Button className='bg-gradient-to-br hover:opacity-80 text-white rounded-lg from-[#3352CC] to-[#1C2D70] font-medium cursor-pointer'>
                                    Sign up
                                </Button>
                            </SignUpButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={showCreditsDialog} onOpenChange={setShowCreditsDialog}>
                    <DialogContent className='sm:max-w-[425px]'>
                        <DialogHeader>
                            <DialogTitle>
                                <div className='text-red-500'>Out of credits</div>
                            </DialogTitle>
                            <DialogDescription>
                                Please add some credits to create videos
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                className='bg-gradient-to-br hover:opacity-80 text-white rounded-lg from-[#3352CC] to-[#1C2D70] font-medium cursor-pointer'

                                onClick={() => {
                                    router.push('/pricing')
                                    setShowCreditsDialog(false)
                                }}
                            >
                                Go to pricing
                            </Button>
                            <Button
                                variant="outline"
                                className='rounded-lg cursor-pointer'
                                onClick={() => setShowCreditsDialog(false)}
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>


            </div>


        </div>
    )
}

export default CreateProject
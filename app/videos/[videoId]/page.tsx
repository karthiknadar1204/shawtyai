import { prisma } from "@/app/lib/db"
import { findPrompt } from "@/app/lib/findPrompt"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { currentUser } from "@clerk/nextjs/server"
import { ArrowRightIcon, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { TypingAnimation } from "@/components/magicui/typing-animation"
import { VideoActions } from "@/app/components/videoActions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

const page = async ({ params }: {
    params: Promise<{
        videoId: string
    }>
}) => {
    const { videoId } = await params
    const user = await currentUser()
    const userId = user?.id
    const prompt = await findPrompt(videoId)
    if (!prompt || prompt === undefined) {
        return null
    }

    const video = await prisma.video.findUnique({
        where: {
            videoId: videoId
        }
    })

    if (!video) {
        return null
    }

    const isOwner = userId === video.userId

    const videoUrl = video.videoUrl
    const transcript = video.content

    if (!transcript) {
        return null
    }

    return (
        <div className="w-screen min-h-screen flex flex-col items-center p-6 relative">
            {/* Back to Dashboard Button - Top Left */}
            <div className="absolute top-6 left-6">
                <Link href="/dashboard">
                    <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-800 rounded-lg cursor-pointer">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            {/* Video Section - Centered horizontally */}
            <div className="w-full max-w-6xl mb-8 relative">
                <div className="aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                    <video
                        key={videoId}
                        className="w-full h-full object-cover rounded-2xl"
                        controls
                        playsInline
                        src={videoUrl ?? undefined}
                    >
                        screw your browser man for fuck sake
                    </video>
                </div>
                
                {/* Action Buttons - Below video on the right */}
                <div className="absolute -bottom-16 right-0">
                    <VideoActions videoId={videoId} videoUrl={videoUrl} isOwner={isOwner}/>
                </div>
            </div>

            {/* Content Section - Prompt and Transcript */}
            <div className="w-full max-w-4xl space-y-8 mt-20">
                {/* Prompt Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row gap-2 items-center">
                        <div
                            className={cn(
                                "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-800 dark:hover:bg-neutral-800",
                            )}
                        >
                            <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                                <span>✨ Prompt</span>
                                <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                            </AnimatedShinyText>
                        </div>

                        <Input
                            className="rounded h-9 flex-1"
                            style={
                                {
                                    background: "#eee",
                                    color: "#000"
                                }
                            }
                            defaultValue={prompt}
                            disabled
                        />
                    </div>
                </div>

                {/* Transcript Section */}
                <div>
                    <div className="w-fit mb-5">
                        <div className="group relative mx-auto flex items-center justify-center rounded-full px-2 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f] ">
                            <span
                                className={cn(
                                    "absolute inset-0 block h-full w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-[#b0b0b0]/50 via-[#9c40ff]/50 to-[#b0b0b0]/50 bg-[length:300%_100%] p-[1px]",
                                )}
                                style={{
                                    WebkitMask:
                                        "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                    WebkitMaskComposite: "destination-out",
                                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                    maskComposite: "subtract",
                                    WebkitClipPath: "padding-box",
                                }}
                            />

                            <AnimatedGradientText className="text-sm font-medium">
                                Transcript
                            </AnimatedGradientText>
                        </div>
                    </div>
                    <div className="w-full p-6 rounded-md bg-neutral-900/60 background-blur-sm border-gray-100">
                        <TypingAnimation className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400">
                            {transcript}
                        </TypingAnimation>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default page
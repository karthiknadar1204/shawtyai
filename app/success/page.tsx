import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

const SuccessPage = () => {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-8 max-w-2xl">
                <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500 animate-pulse drop-shadow-lg" />
                </div>

                <div className="relative">
                    <video
                        className="w-full max-w-2xl rounded-lg shadow-2xl"
                        controls
                        autoPlay
                        muted
                        loop
                        playsInline
                    >
                        <source src="/thanks.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-white">
                        Payment Successful 🎉
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Credits have been added to your account. You can continue with your video creation now.
                    </p>
                </div>

                <Link href='/dashboard'>
                    <Button className="bg-gradient-to-br hover:opacity-80 text-white rounded-lg from-[#3352CC] to-[#1C2D70] font-medium flex items-center gap-2 justify-center w-48 mx-auto py-3 cursor-pointer">
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>

            </div>
        </div>
    )
}

export default SuccessPage
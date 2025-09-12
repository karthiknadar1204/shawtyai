"use client"

import { Button } from "@/components/ui/button"
import { Copy, Download, Trash2 } from "lucide-react"
import { useVideoActions } from "../hooks/useVideoActions"
import { useRouter } from "next/navigation"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { AlertDialogDescription, AlertDialogTitle } from "@radix-ui/react-alert-dialog"

interface videoActionsPromp {
    videoId: string
    videoUrl: string | null
    isOwner?: boolean
}

export const VideoActions = ({ videoId, videoUrl, isOwner }: videoActionsPromp) => {
    const router = useRouter()
    const { handleDownload, handleCopyLink, handleDelete, isDeleting, copied } = useVideoActions({
        videoId,
        videoUrl,
        onDeleteSuccess: () => router.push('/dashboard')
    })

    return (
        <div className="flex flex-row gap-4 items-center justify-center flex-wrap">
            <Button
                onClick={handleDownload}
                className='bg-gradient-to-br hover:opacity-80 text-white rounded-lg from-[#3352CC] to-[#1C2D70] font-medium flex items-center gap-2 cursor-pointer'
                disabled={!videoUrl}
            >
                <Download className="h-4 w-4" />
                Download
            </Button>

            <Button
                variant="outline"
                onClick={handleCopyLink}
                className="flex items-center gap-2 rounded-lg cursor-pointer"
            >
                <Copy className="h-4 w-4" />
                {copied ? 'Copied!' : 'Copy Link'}
            </Button>

            {
                isOwner && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 text-red-600 hover:bg-red-50 border-red-200 rounded-lg dark:hover:bg-red-950 dark:border-red-800 cursor-pointer"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    video and remove your video from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-lg cursor-pointer">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-lg cursor-pointer"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )
            }

        </div>
    )
}
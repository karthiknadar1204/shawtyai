"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialogDescription } from "@/components/ui/alert-dialog"
import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Copy, Download, MoreVertical, Trash2 } from "lucide-react"
import Link from "next/link"
import { useVideoActions } from "../hooks/useVideoActions"
import { Card, CardTitle, CardDescription } from "@/components/ui/card-hover-effect"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"


export const VideoCard = ({ video }: { video: any }) => {
    const { handleDownload, handleCopyLink, handleDelete, isDeleting } = useVideoActions({
        videoId: video.videoId,
        videoUrl: video.videoUrl
    })
    
    const [hovered, setHovered] = useState(false)

    return (
        <div 
            className="relative group block p-2 h-full w-full"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <AnimatePresence>
                {hovered && (
                    <motion.span
                        className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block rounded-3xl"
                        layoutId="hoverBackground"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 1,
                            transition: { duration: 0.15 },
                        }}
                        exit={{
                            opacity: 0,
                            transition: { duration: 0.15, delay: 0.2 },
                        }}
                    />
                )}
            </AnimatePresence>
            
            <Card className="relative z-20">
                <Link href={`/videos/${video.videoId}`} className="block">
                    <div className="aspect-video bg-gray-800 relative rounded-lg overflow-hidden">
                        {video.thumbnail ? (
                            <img
                                src={video.thumbnail}
                                alt={"video thumbnail"}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <span className="text-gray-400">
                                    No preview available
                                </span>
                            </div>
                        )}
                    </div>
                </Link>
                
                <div className="p-4">
                    <CardTitle className="text-sm">
                        {video.prompt || "Untitled Video"}
                    </CardTitle>
                    <CardDescription className="text-xs mt-2">
                        {new Date(video.createdAt).toLocaleString()}
                    </CardDescription>
                </div>

                <div className="absolute bottom-2 right-2 z-30">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white cursor-pointer"
                                onClick={(e) => e.preventDefault()}
                            >
                                <MoreVertical className="h-4 w-4 " />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48" align="end">
                            <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
                                <Download className="mr-2 h-4 w-4" />
                                <span>Download</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                                <Copy className="mr-2 h-4 w-4" />
                                <span>Copy Link</span>
                            </DropdownMenuItem>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="text-red-400 hover:bg-red-950 focus:bg-red-950 hover:text-red-400 focus:text-red-400 cursor-pointer"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your
                                            video and remove your video from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter >
                                        <AlertDialogCancel className="rounded-full cursor-pointer">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-full cursor-pointer"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </Card>
        </div>
    )
}
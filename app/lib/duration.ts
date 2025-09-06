import { prisma } from "./db"

export const videoDuration = async (videoId: string) => {
    const video = await prisma.video.findUnique({
        where: {
            videoId: videoId
        }
    })

    const captions = (video?.captions as any[]) || []
    if (!captions.length) {
        return
    }
    const caluclatedDuration = captions[captions.length - 1].endFrame

    await prisma.video.update({
        where: {
            videoId: videoId
        },
        data: {
            duration: caluclatedDuration
        }
    })

}
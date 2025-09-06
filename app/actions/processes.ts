import { prisma } from "../lib/db"
import { findPrompt } from "../lib/findPrompt"
import { generateImages } from "./image"
import { generateScript } from "./script"
import { generateAudio } from "./audio"
import { generateCaptions } from "./captions"
import { videoDuration } from "../lib/duration"
// import { renderVideo } from "./render"

export const processes = async (videoId: string) => {
    try {
        const prompt = await findPrompt(videoId)
        const script = await generateScript(prompt || '')
        console.log("scripts",script)
        const scriptData = JSON.parse(script || '')
        const contentTexts = scriptData.content.map((data: { contentText: string }) => data.contentText)
        console.log("contentTexts",contentTexts)
        const fullContent = contentTexts.join(" ")
        const imagePrompts = scriptData.content.map((data: { imagePrompt: string }) => data.imagePrompt)
        console.log("imagePrompts",imagePrompts)
        await prisma.video.update({
            where: {
                videoId: videoId
            },
            data: {
                content: fullContent,
                imagePrompts: imagePrompts
            }
        })

        await generateImages(videoId)
        await generateAudio(videoId)
        await generateCaptions(videoId)
        await videoDuration(videoId)

        // await renderVideo(videoId)



    } catch (error) {
        console.error('error in making video:', error)
        throw error
    }
}
import { prisma } from "../lib/db"
import { AssemblyAI } from "assemblyai"

export const generateCaptions = async (videoId: string) => {
    const apiKey = process.env.ASSEMBLY_API_KEY
    if (!apiKey) {
        console.error("missing assembly api key")
        return undefined
    }
    const client = new AssemblyAI({ apiKey })
    try {
        const video = await prisma.video.findUnique({
            where: { videoId: videoId }
        })
        if (!video || !video.audio) {
            return undefined
        }

        const transcript = await client.transcripts.transcribe({ audio_url: video.audio })

        const captions = transcript.words
            ? transcript.words.map(word => ({
                text: word.text,
                startFrame: Math.round(word.start / 1000 * 30),
                endFrame: Math.round(word.end / 1000 * 30)
            }))
            : []

        console.log('generated captions hai yeh bhau')

        await prisma.video.update({
            where:
                { videoId: videoId },
            data: {
                captions: captions
            }
        })
    }
    catch (error) {
        console.error('error while generating captions:', error)
        throw error
    }

}
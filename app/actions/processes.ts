import { prisma } from "../lib/db"
import { findPrompt } from "../lib/findPrompt"
import { generateImages } from "./image"
import { generateScript } from "./script"
import { generateAudio } from "./audio"
import { generateCaptions } from "./captions"
import { videoDuration } from "../lib/duration"
import { renderVideo } from "./render"

export const processes = async (videoId: string) => {
    try {
        console.log('Starting video processing for:', videoId);
        
        // Step 1: Generate script
        console.log('Step 1: Generating script...');
        const prompt = await findPrompt(videoId)
        if (!prompt) {
            throw new Error('No prompt found for video');
        }
        
        const script = await generateScript(prompt)
        if (!script) {
            throw new Error('Failed to generate script');
        }
        
        console.log("Generated script:", script);
        const scriptData = JSON.parse(script)
        
        if (!scriptData.content || !Array.isArray(scriptData.content)) {
            throw new Error('Invalid script format');
        }
        
        const contentTexts = scriptData.content.map((data: { contentText: string }) => data.contentText)
        const fullContent = contentTexts.join(" ")
        const imagePrompts = scriptData.content.map((data: { imagePrompt: string }) => data.imagePrompt)
        
        console.log("Content texts:", contentTexts);
        console.log("Image prompts:", imagePrompts);
        
        await prisma.video.update({
            where: {
                videoId: videoId
            },
            data: {
                content: fullContent,
                imagePrompts: imagePrompts
            }
        })

        // Step 2: Generate images
        console.log('Step 2: Generating images...');
        await generateImages(videoId)
        
        // Step 3: Generate audio
        console.log('Step 3: Generating audio...');
        await generateAudio(videoId)
        
        // Step 4: Generate captions
        console.log('Step 4: Generating captions...');
        await generateCaptions(videoId)
        
        // Step 5: Calculate duration
        console.log('Step 5: Calculating duration...');
        await videoDuration(videoId)

        // Step 6: Render video
        console.log('Step 6: Rendering video...');
        await renderVideo(videoId)
        
        console.log('Video processing completed successfully for:', videoId);

    } catch (error) {
        console.error('Error in video processing for', videoId, ':', error);
        
        // Update video status to failed
        try {
            await prisma.video.update({
                where: { videoId: videoId },
                data: { 
                    processing: false,
                    failed: true 
                }
            });
        } catch (dbError) {
            console.error('Failed to update video status after processing error:', dbError);
        }
        
        throw error
    }
}
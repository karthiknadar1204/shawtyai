import { prisma } from "../lib/db"
import { getRenderProgress, renderMediaOnLambda } from "@remotion/lambda/client"

// Validate required data for rendering
const validateRenderData = (data: any) => {
    if (!data.imageLinks || data.imageLinks.length === 0) {
        throw new Error('No image links available for rendering');
    }
    if (!data.audio) {
        throw new Error('No audio file available for rendering');
    }
    if (!data.captions) {
        throw new Error('No captions available for rendering');
    }
    if (!data.duration || data.duration <= 0) {
        throw new Error('Invalid duration for rendering');
    }
};

export const renderVideo = async (videoId: string) => {
    try {
        const data = await prisma.video.findUnique({
            where: {
                videoId: videoId
            }
        })

        if (!data) {
            console.log('Video not found for rendering:', videoId);
            return undefined
        }

        // Validate render data
        validateRenderData(data);
        
        console.log('Starting video rendering for:', videoId);

        const { bucketName, renderId } = await renderMediaOnLambda({
            region: 'us-east-2',
            functionName: 'remotion-render-4-0-341-mem2048mb-disk2048mb-120sec',
            composition: 'MyVideo',
            serveUrl: 'https://remotionlambda-useast2-12kqcubr4b.s3.us-east-2.amazonaws.com/sites/shawtyai/index.html',
            codec: 'h264',
            inputProps: {
                imageLinks: data.imageLinks,
                audio: data.audio,
                captions: data.captions,
                durationInFrames: data.duration
            },
            framesPerLambda: 400
        })

        console.log('Render job started with ID:', renderId);

        const maxWaitTime = 10 * 60 * 1000; // 10 minutes
        const startTime = Date.now();
        let lastProgress = 0;

        while (true) {
            // Check for timeout
            if (Date.now() - startTime > maxWaitTime) {
                throw new Error('Render timeout exceeded');
            }

            const progress = await getRenderProgress({
                region: 'us-east-2',
                functionName: 'remotion-render-4-0-341-mem2048mb-disk2048mb-120sec',
                renderId,
                bucketName,
            })

            if (progress.fatalErrorEncountered) {
                console.error('Render failed with errors:', progress.errors);
                throw new Error(`Render failed: ${progress.errors?.join(', ') || 'Unknown error'}`);
            }

            if (progress.done) {
                const videoUrl = progress.outputFile ||
                    `https://${bucketName}.s3.us-east-2.amazonaws.com/${renderId}/out.mp4`

                console.log('Video rendering completed:', videoUrl);

                await prisma.video.update({
                    where: {
                        videoId: videoId
                    },
                    data: {
                        videoUrl: videoUrl,
                        processing: false
                    }
                })

                return videoUrl
            }

            const framesRendered = progress.framesRendered || 0
            const percent = Math.floor(progress.overallProgress * 100)

            // Only log progress if it has changed significantly
            if (percent > lastProgress + 5) {
                console.log(`Render progress: ${percent}%, frames rendered: ${framesRendered}`);
                lastProgress = percent;
            }

            // Wait before checking progress again
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    catch (error) {
        console.error('Error while generating video in Remotion for video', videoId, ':', error);
        
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
            console.error('Failed to update video status after render error:', dbError);
        }
        
        throw error
    }
}
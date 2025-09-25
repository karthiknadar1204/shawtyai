import { randomUUID } from "crypto";
import { prisma } from "../lib/db"
import { ElevenLabsClient } from "elevenlabs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

// Validate required environment variables
const validateEnvironment = () => {
    const requiredEnvVars = [
        'ELEVENLABS_API_KEY',
        'AWS_REGION',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'S3_BUCKET_NAME'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
};

// Initialize clients with validation
let client: ElevenLabsClient;
let s3Client: S3Client;
let bucketName: string;

try {
    validateEnvironment();
    
    client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! });
    
    s3Client = new S3Client({
        region: process.env.AWS_REGION!,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        }
    });
    
    bucketName = process.env.S3_BUCKET_NAME!;
} catch (error) {
    console.error('Failed to initialize audio service:', error);
    throw error;
}


export const generateAudio = async (videoId: string) => {
    try {
        const video = await prisma.video.findUnique({
            where: { videoId: videoId }
        })
        if (!video || !video.content) {
            console.log('Video not found or no content available for audio generation');
            return undefined
        }

        console.log('Starting audio generation for video:', videoId);

        // Validate content length
        if (video.content.length === 0) {
            throw new Error('Video content is empty, cannot generate audio');
        }

        const audioStream = await client.textToSpeech.convertAsStream("JBFqnCBsd6RMkjVDRZzb",
            {
                text: video.content,
                model_id: "eleven_multilingual_v2",
                output_format: "mp3_44100_128",
            }
        )

        const chunks: Buffer[] = []
        for await (const chunk of audioStream) {
            chunks.push(chunk)
        }

        if (chunks.length === 0) {
            throw new Error('No audio data received from ElevenLabs');
        }

        const audioBuffer = Buffer.concat(chunks)
        const fileName = `${randomUUID()}.mp3`

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: audioBuffer,
            ContentType: "audio/mpeg"
        })

        await s3Client.send(command)

        const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
        console.log("Audio file uploaded successfully:", s3Url)

        await prisma.video.update({
            where: {
                videoId: videoId
            },
            data: {
                audio: s3Url
            }
        })

        console.log('Audio generation completed successfully for video:', videoId);

    }
    catch (error) {
        console.error('Error while generating audio for video', videoId, ':', error)
        
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
            console.error('Failed to update video status after audio error:', dbError);
        }
        
        throw error
    }
}
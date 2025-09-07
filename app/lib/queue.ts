import { Queue } from 'bullmq'
import { Redis } from 'ioredis'

const connection = new Redis("redis://default:ARmVAAImcDEwNTU0NzY2ZmMxNGM0NTAwODI5MzczYTUxOTc0ZTMxM3AxNjU0OQ@definite-sculpin-6549.upstash.io:6379", {
    maxRetriesPerRequest: null,
})

connection.on('connect', () => {
    console.log('Redis connect sucefullly')
})

connection.on('error', (err) => {
    console.log('Redis connect error:', err)
})

connection.on('ready', () => {
    console.log('Redis ready')
})

export const videoQueue = new Queue('video-processing', {
    connection,
    defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
    }
})

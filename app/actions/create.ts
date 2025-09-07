'use server'

import { currentUser } from "@clerk/nextjs/server"
import { randomUUID } from "crypto"
import { prisma } from "../lib/db"
import { decreaseCredits } from "../lib/decreaseCredits"
// import { videoQueue } from "../lib/queue"
// import { redirect } from "next/navigation"
import { processes } from "./processes"

export const createVideo=async(prompt:string)=>{
    try {
        const videoId = randomUUID()
        const user = await currentUser()
        console.log("user exists hai",user)
        const userId = user?.id

        if (!userId) {
            return null
        }

        await prisma.video.create({
            data: {
                videoId,
                userId,
                prompt,
                processing: true,
                imagePrompts: [],
                imageLinks: []
            }
        })
        await decreaseCredits(userId)

        // Kick off processing without blocking the response
        processes(videoId).catch((error) => {
            console.error('video processing failed:', error)
        })

        return { videoId }
    } catch (error) {
        console.error('failed to create video record:', error)
        return null
    }
}





// 'use server'

// import { currentUser } from "@clerk/nextjs/server"
// import { randomUUID } from "crypto"
// import { prisma } from "../lib/db"
// import { decreaseCredits } from "../lib/decreaseCredits"
// import { videoQueue } from "../lib/queue"
// import { redirect } from "next/navigation"


// export const createVideo = async (prompt: string) => {
//     const videoId = randomUUID()
//     const user = await currentUser()
//     const userId = user?.id

//     if (!userId) {
//         return null
//     }

//     await prisma.video.create({
//         data: {
//             videoId,
//             userId,
//             prompt,
//             processing: true
//         }
//     })

//     await decreaseCredits(userId)


//     await videoQueue.add('generate-video', { videoId })
//     console.log('job added to queue succesffuly')

//     return { videoId }

// }
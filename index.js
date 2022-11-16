import { getDateString } from './lib/date.js'
import Twitch from './lib/twitch.js'
import { exec } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'
import * as dotenv from 'dotenv'

dotenv.config()

const twitchClientId = process.env.TWITCH_CLIENT_ID
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET
const twitchOAuth = process.env.TWITCH_OAUTH
const streamlinkPath = process.env.STREAMLINK_PATH

if (process.argv.length < 3) {
    console.log(`Usage: ${process.argv[0]} ${process.argv[1]} <streamer>`)
    process.exit(1)
}
const streamerName = process.argv[2]

let twitch = new Twitch(twitchClientId, twitchClientSecret)
let isRecording = false

const sleep = () =>
    new Promise(resolve => {
        setTimeout(resolve, 10000)
    })

const loop = async () => {
    if (isRecording) {
        console.log('Recording...')
        return
    }

    const isValidate = await twitch.isUserValidate()
    if (!isValidate) {
        await twitch.connexion()
    }

    const isLive = await twitch.isStreamerLive(streamerName)
    if (isLive) {
        isRecording = true
        console.log('Launching streamlink...')
        exec(
            `${streamlinkPath} "--twitch-api-header=Authorization=OAuth ${twitchOAuth}" twitch.tv/${streamerName} best -o videos/${streamerName}_${getDateString()}.mp4`,
            (error, stdout, stderr) => {
                if (error) console.log('Error:\n' + `${error.name}: ${error.message}`)
                if (stdout) console.log('Stdout:\n' + stdout)
                if (stderr) console.log('Stderr:\n' + stderr)
                isRecording = false
            },
        )
    }
}

;(async () => {
    try {
        console.log(`Recording started for ${streamerName}!`)

        if (!existsSync(path.join(process.cwd(), '/videos'))) mkdirSync(path.join(process.cwd(), '/videos'))

        while (true) {
            await Promise.all([sleep(), loop()])
        }
    } catch (error) {
        console.log('Error:\n' + `${error.name}: ${error.message}`)
    }
})()

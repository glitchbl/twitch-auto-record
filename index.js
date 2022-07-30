import { getDateString } from './lib/date.js'
import Twitch from './lib/twitch.js'
import { exec } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'
import * as dotenv from 'dotenv'

dotenv.config()

const streamerName = process.env.STREAMER_NAME
const twitchClientId = process.env.TWITCH_CLIENT_ID
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET
const twitchOAuth = process.env.TWITCH_OAUTH
const streamlinkPath = process.env.STREAMLINK_PATH

const log = console.log

let twitch = new Twitch(twitchClientId, twitchClientSecret)
let isRecording = false

const delay = () =>
    new Promise(resolve => {
        setTimeout(resolve, 10000)
    })

const loop = async () => {
    log('Recording? ' + (isRecording ? 'Yes' : 'No'))
    if (isRecording) return

    const isValidate = await twitch.isUserValidate()
    if (!isValidate) {
        await twitch.connexion()
    }

    const isLive = await twitch.isStreamerLive(streamerName)
    log('Live? ' + (isLive ? 'Yes' : 'No'))
    if (isLive) {
        isRecording = true
        log('Launching streamlink...')
        exec(
            `${streamlinkPath} "--twitch-api-header=Authentication=OAuth ${twitchOAuth}" twitch.tv/${streamerName} best -o videos/${streamerName}_${getDateString()}.mp4`,
            (error, stdout, stderr) => {
                log('Streamlink stopped')
                if (stdout) log('stdout:\n' + stdout)
                if (stderr) log('stderr:\n' + stderr)
                isRecording = false
            },
        )
    }
}

;(async () => {
    try {
        log(`App started for ${streamerName}!`)

        if (!existsSync(path.join(process.cwd(), '/videos'))) mkdirSync(path.join(process.cwd(), '/videos'))

        while (true) {
            await Promise.all([delay(), loop()])
        }
    } catch (error) {
        log('Error: ')
        console.log(error)
    }
})()

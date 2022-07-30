import axios from 'axios'

export default class Twitch {
    client_id
    client_secret
    access_token

    constructor(client_id, client_secret) {
        this.client_id = client_id
        this.client_secret = client_secret
    }

    async connexion() {
        delete axios.defaults.headers.common['Authorization']
        delete axios.defaults.headers.common['Client-Id']

        const response = await axios.post('https://id.twitch.tv/oauth2/token', {
            client_id: this.client_id,
            client_secret: this.client_secret,
            grant_type: 'client_credentials',
        })

        this.access_token = response.data.access_token

        axios.defaults.headers.common['Authorization'] = `Bearer ${this.access_token}`
        axios.defaults.headers.common['Client-Id'] = this.client_id
    }

    async isUserValidate() {
        let isValidate = true

        try {
            await axios.get('https://id.twitch.tv/oauth2/validate')
        } catch (error) {
            isValidate = false
        }

        return isValidate
    }

    async isStreamerLive(name) {
        let isLive = true

        try {
            const response = await axios.get(`https://api.twitch.tv/helix/streams?user_login=${name}`)
            isLive = response.data.data.length > 0
        } catch (error) {
            isLive = false
        }

        return isLive
    }
}

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import OpenAI from "openai";

export const app = new Hono()

const getAPIKey =  () => {
    console.log('Getting API Key from vault...')
    let vault: Record<string, string> = {};
    try {
        vault = JSON.parse(process.env.secret || '')
    } catch (e) {
        console.error(e)
    }
    return vault.openaiApiKey || ''

}

app.get('/', async (c) => {
    let result = {message: ''}
    const openaiApiKey = getAPIKey()
    const queries = c.req.queries() || {}
    //const openaiApiKey = (secrets.openaiApiKey) ? secrets.openaiApiKey as string : ''
    const openai = new OpenAI({apiKey: openaiApiKey})
    // Choose from any model listed here https://platform.openai.com/docs/models
    const openAiModel = (queries.openAiModel) ? queries.openAiModel[0] : 'gpt-3.5-turbo';
    const query = (queries.chatQuery) ? queries.chatQuery[0] as string : 'Who are you?'

    const completion = await openai.chat.completions.create({
        messages: [{role: "system", content: `${query}`}],
        model: `${openAiModel}`,
    })

    result.message = (completion.choices) ? completion.choices[0].message.content as string : 'Failed to get result'

    return c.html(JSON.stringify(result))

  //  return new Response(JSON.stringify(result))
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
    fetch: app.fetch,
    port
})

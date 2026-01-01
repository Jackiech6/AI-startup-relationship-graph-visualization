/**
 * AI client for LLM integration
 */
import OpenAI from 'openai'
import type { Startup, Person, GraphNode } from './types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
const DEFAULT_MAX_TOKENS = parseInt(process.env.OPENAI_MAX_TOKENS || '200', 10)

/**
 * Generate AI summary for a startup
 */
export async function generateStartupSummary(
  startup: Startup,
  neighbors: GraphNode[]
): Promise<string> {
  const neighborNames = neighbors.map((n) => n.data.name).join(', ')

  const systemPrompt = `You are a helpful assistant that provides concise, insightful summaries about AI startups. Keep responses brief and informative.`

  const userPrompt = `Provide a one-paragraph overview of this startup and suggest three strategic questions about it.

Startup:
- Name: ${startup.name}
- Domain: ${startup.domainTags.join(', ')}
- Stage: ${startup.stage}
- Founded: ${startup.foundedYear}
- Location: ${startup.location}
- Description: ${startup.description}

Connected founders: ${neighborNames || 'None'}

Provide a concise summary in 2-3 sentences, followed by 3 strategic questions.`

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: DEFAULT_MAX_TOKENS,
      temperature: 0.7,
    })

    return response.choices[0]?.message?.content || 'Unable to generate summary.'
  } catch (error) {
    console.error('Error generating startup summary:', error)
    throw new Error('Failed to generate AI summary')
  }
}

/**
 * Generate AI summary for a person
 */
export async function generatePersonSummary(
  person: Person,
  neighbors: GraphNode[]
): Promise<string> {
  const neighborNames = neighbors.map((n) => n.data.name).join(', ')

  const systemPrompt = `You are a helpful assistant that provides concise, insightful summaries about people in the AI startup ecosystem. Keep responses brief and informative.`

  const userPrompt = `Summarize this person's founder focus and suggest adjacent startups they might be interested in or related to.

Person:
- Name: ${person.name}
- Roles: ${person.roles.join(', ')}
- Keywords: ${person.keywords.join(', ')}
- Bio: ${person.bio}

Connected startups: ${neighborNames || 'None'}

Provide a concise summary in 2-3 sentences about their focus, followed by suggestions for 2-3 related startups or areas they might explore.`

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: DEFAULT_MAX_TOKENS,
      temperature: 0.7,
    })

    return response.choices[0]?.message?.content || 'Unable to generate summary.'
  } catch (error) {
    console.error('Error generating person summary:', error)
    throw new Error('Failed to generate AI summary')
  }
}


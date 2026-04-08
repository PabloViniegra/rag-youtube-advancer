/**
 * QuickPrompts — async Server Component
 *
 * Generates AI-powered question chips from the user's last indexed video titles.
 * Falls back to static questions if the library is empty or the LLM errors.
 *
 * Renders <QuickPromptsChips> (Client) with only serialisable data so the
 * server→client boundary is never crossed with non-serialisable props.
 */

import { generateQuickPrompts } from '@/lib/quick-prompts'
import { QuickPromptsChips } from './quick-prompts-chips'

interface QuickPromptsProps {
  titles: string[]
}

export async function QuickPrompts({ titles }: QuickPromptsProps) {
  const questions = await generateQuickPrompts(titles)

  return <QuickPromptsChips questions={questions} />
}

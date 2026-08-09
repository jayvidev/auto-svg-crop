import xml from '@shikijs/langs/xml'
import githubDark from '@shikijs/themes/github-dark'
import githubLight from '@shikijs/themes/github-light'
import { createHighlighterCore, type HighlighterCore, type RegexEngine } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

let jsEngine: RegexEngine | null = null
let highlighter: Promise<HighlighterCore> | null = null

const getShikiEngine = (): RegexEngine => {
  jsEngine ??= createJavaScriptRegexEngine()
  return jsEngine
}

const shikiHighlighter = async (): Promise<HighlighterCore> => {
  highlighter ??= createHighlighterCore({
    themes: [githubLight, githubDark],
    langs: [xml],
    engine: getShikiEngine(),
  })
  return highlighter
}

export const highlightSvg = async (code: string): Promise<string> => {
  const shiki = await shikiHighlighter()
  return shiki.codeToHtml(code, {
    lang: 'xml',
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: 'light',
  })
}

export { shikiHighlighter }

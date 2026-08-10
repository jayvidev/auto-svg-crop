export type ExportFormat = 'svg' | 'dataUri' | 'css' | 'react'

const toDataUri = (svgCode: string) => {
  const encoded = encodeURIComponent(svgCode.replace(/\s+/g, ' ').trim())
    .replace(/%20/g, ' ')
    .replace(/'/g, '%27')
    .replace(/"/g, "'")

  return `data:image/svg+xml,${encoded}`
}

const toCss = (svgCode: string) => `background-image: url("${toDataUri(svgCode)}");`

const camelCase = (attribute: string) =>
  attribute.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())

const reactAttributes: Record<string, string> = {
  class: 'className',
  'xlink:href': 'xlinkHref',
  'xml:space': 'xmlSpace',
}

const toReact = (svgCode: string, name = 'CroppedSvg') => {
  const jsx = svgCode.replace(/\s([a-zA-Z-:]+)=/g, (match, attribute: string) => {
    if (reactAttributes[attribute]) return ` ${reactAttributes[attribute]}=`
    if (attribute.includes(':')) return match
    return ` ${camelCase(attribute)}=`
  })

  return `export const ${name} = (props: React.SVGProps<SVGSVGElement>) => (\n  ${jsx.replace(
    '<svg',
    '<svg {...props}'
  )}\n)\n`
}

export const formatSvg = (svgCode: string, format: ExportFormat, name?: string) => {
  switch (format) {
    case 'dataUri':
      return toDataUri(svgCode)
    case 'css':
      return toCss(svgCode)
    case 'react':
      return toReact(svgCode, name)
    default:
      return svgCode
  }
}

export const componentName = (filename: string) => {
  const base = filename
    .replace(/\.svg$/i, '')
    .replace(/[^a-zA-Z0-9]+(.)?/g, (_, character) => (character ? character.toUpperCase() : ''))
  const name = base.charAt(0).toUpperCase() + base.slice(1)

  return /^\d/.test(name) ? `Svg${name}` : name || 'CroppedSvg'
}

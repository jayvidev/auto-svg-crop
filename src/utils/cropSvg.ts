export interface CropSvgResult {
  svg: string
  originalViewBox: string | null
  croppedViewBox: string
  width: number
  height: number
}

interface CropSvg {
  svgCode: string
  precision?: number
}

const round = (value: number, precision: number) => {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

export const cropSvg = ({ svgCode, precision = 2 }: CropSvg): CropSvgResult => {
  const container = document.createElement('div')
  container.setAttribute('aria-hidden', 'true')
  container.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none'
  container.innerHTML = svgCode

  const svg = container.querySelector('svg')
  if (!svg) {
    throw new Error('No valid <svg> element found')
  }

  document.body.appendChild(container)

  try {
    const originalViewBox = svg.getAttribute('viewBox')
    const bbox = svg.getBBox()

    if (!bbox.width || !bbox.height) {
      throw new Error('The SVG has no visible content to crop')
    }

    const width = round(bbox.width, precision)
    const height = round(bbox.height, precision)
    const croppedViewBox = `${round(bbox.x, precision)} ${round(bbox.y, precision)} ${width} ${height}`

    svg.setAttribute('viewBox', croppedViewBox)
    svg.removeAttribute('width')
    svg.removeAttribute('height')

    if (!svg.getAttribute('xmlns')) {
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    }

    return {
      svg: svg.outerHTML,
      originalViewBox,
      croppedViewBox,
      width,
      height,
    }
  } finally {
    container.remove()
  }
}

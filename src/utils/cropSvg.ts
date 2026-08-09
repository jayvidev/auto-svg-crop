export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export interface CropSvgResult {
  svg: string
  originalViewBox: string | null
  croppedViewBox: string
  frame: Box
  crop: Box
  width: number
  height: number
  trimmed: number
}

interface CropSvg {
  svgCode: string
  precision?: number
}

const round = (value: number, precision: number) => {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

const roundBox = (box: Box, precision: number): Box => ({
  x: round(box.x, precision),
  y: round(box.y, precision),
  width: round(box.width, precision),
  height: round(box.height, precision),
})

const boxToViewBox = (box: Box) => `${box.x} ${box.y} ${box.width} ${box.height}`

const getFrame = (svg: SVGSVGElement, bbox: Box, precision: number): Box => {
  const viewBox = svg.viewBox.baseVal
  if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
    return roundBox(viewBox, precision)
  }

  const width = svg.width.baseVal.value
  const height = svg.height.baseVal.value
  if (width > 0 && height > 0) return { x: 0, y: 0, width, height }

  return bbox
}

const measure = (svg: SVGSVGElement): Box =>
  svg.getBBox({ clipped: true, fill: true, stroke: true, markers: true })

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
    const bbox = measure(svg)

    if (!bbox.width || !bbox.height) {
      throw new Error('The SVG has no visible content to crop')
    }

    const crop = roundBox(bbox, precision)
    const frame = getFrame(svg, crop, precision)
    const croppedViewBox = boxToViewBox(crop)

    svg.setAttribute('viewBox', croppedViewBox)
    svg.removeAttribute('width')
    svg.removeAttribute('height')

    if (!svg.getAttribute('xmlns')) {
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    }

    const frameArea = frame.width * frame.height
    const cropArea = crop.width * crop.height

    return {
      svg: svg.outerHTML,
      originalViewBox,
      croppedViewBox,
      frame,
      crop,
      width: crop.width,
      height: crop.height,
      trimmed: frameArea > 0 ? Math.max(0, 1 - cropArea / frameArea) : 0,
    }
  } finally {
    container.remove()
  }
}

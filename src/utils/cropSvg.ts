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
  /** Coordinate system the original SVG was drawn in, used to align previews. */
  frame: Box
  /** Bounding box of the visible content, inside `frame` coordinates. */
  crop: Box
  width: number
  height: number
  /** How much of the original canvas area was empty space, 0-1. */
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

const boxToViewBox = (box: Box) => `${box.x} ${box.y} ${box.width} ${box.height}`

/**
 * The coordinate system the artwork lives in: the declared viewBox, or the
 * declared width/height, or - as a last resort - the content itself.
 */
const getFrame = (svg: SVGSVGElement, bbox: Box): Box => {
  const viewBox = svg.viewBox.baseVal
  if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
    return { x: viewBox.x, y: viewBox.y, width: viewBox.width, height: viewBox.height }
  }

  const width = svg.width.baseVal.value
  const height = svg.height.baseVal.value
  if (width > 0 && height > 0) return { x: 0, y: 0, width, height }

  return bbox
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

    const crop: Box = {
      x: round(bbox.x, precision),
      y: round(bbox.y, precision),
      width: round(bbox.width, precision),
      height: round(bbox.height, precision),
    }
    const frame = getFrame(svg, crop)
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

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

const SHAPES = 'path, rect, circle, ellipse, line, polyline, polygon, text, image, use'

const HIDDEN_PARENTS = 'defs, clipPath, mask, symbol, pattern, marker'

const isVisible = (element: Element, root: SVGSVGElement) => {
  let node: Element | null = element

  while (node) {
    const style = getComputedStyle(node)
    if (style.display === 'none' || style.visibility === 'hidden') return false
    if (Number(style.opacity) === 0) return false
    if (node === root) break
    node = node.parentElement
  }

  return true
}

const paints = (element: SVGGraphicsElement, root: SVGSVGElement) => {
  if (element.closest(HIDDEN_PARENTS)) return false
  if (!isVisible(element, root)) return false
  if (element.tagName === 'image' || element.tagName === 'use') return true

  const style = getComputedStyle(element)
  const filled = style.fill !== 'none' && Number(style.fillOpacity) !== 0
  const stroked =
    style.stroke !== 'none' &&
    Number(style.strokeOpacity) !== 0 &&
    parseFloat(style.strokeWidth) > 0

  return filled || stroked
}

const boxInRootSpace = (element: SVGGraphicsElement, root: SVGSVGElement): Box | null => {
  const rootMatrix = root.getScreenCTM()
  const elementMatrix = element.getScreenCTM()
  if (!rootMatrix || !elementMatrix) return null

  const box = element.getBBox({ clipped: true, fill: true, stroke: true, markers: true })
  if (!box.width && !box.height) return null

  const toRoot = rootMatrix.inverse().multiply(elementMatrix)
  const corners = [
    new DOMPoint(box.x, box.y),
    new DOMPoint(box.x + box.width, box.y),
    new DOMPoint(box.x, box.y + box.height),
    new DOMPoint(box.x + box.width, box.y + box.height),
  ].map((point) => point.matrixTransform(toRoot))

  const xs = corners.map((point) => point.x)
  const ys = corners.map((point) => point.y)
  const x = Math.min(...xs)
  const y = Math.min(...ys)

  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}

const measure = (svg: SVGSVGElement): Box => {
  const boxes = Array.from(svg.querySelectorAll<SVGGraphicsElement>(SHAPES))
    .filter((element) => paints(element, svg))
    .map((element) => boxInRootSpace(element, svg))
    .filter((box): box is Box => box !== null)

  if (!boxes.length) return svg.getBBox()

  const minX = Math.min(...boxes.map((box) => box.x))
  const minY = Math.min(...boxes.map((box) => box.y))
  const maxX = Math.max(...boxes.map((box) => box.x + box.width))
  const maxY = Math.max(...boxes.map((box) => box.y + box.height))

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

export const cropSvg = ({ svgCode, precision = 2 }: CropSvg): CropSvgResult => {
  const container = document.createElement('div')
  container.setAttribute('aria-hidden', 'true')
  container.style.cssText = 'position:fixed;top:0;left:-99999px;opacity:0;pointer-events:none'
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

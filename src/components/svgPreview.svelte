<script lang="ts">
  import { cn } from '@/utils/cn'
  import type { Box } from '@/utils/cropSvg'

  interface Props {
    code: string
    /** Forces the coordinate system, so two previews can share one scale. */
    viewBox?: Box | null
    /** Draws the crop bounds and dims everything that gets trimmed away. */
    overlay?: Box | null
    class?: string
  }

  let { code, viewBox = null, overlay = null, class: className }: Props = $props()

  /**
   * Previews always fill their box: intrinsic width/height would render the
   * original at its declared size and the cropped one stretched, which makes
   * the comparison useless.
   */
  const fitted = $derived.by(() => {
    if (!code) return ''
    const doc = new DOMParser().parseFromString(code, 'image/svg+xml')
    const svg = doc.documentElement
    if (svg.nodeName !== 'svg' || doc.querySelector('parsererror')) return code

    svg.removeAttribute('width')
    svg.removeAttribute('height')
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    svg.setAttribute('style', 'width:100%;height:100%;overflow:visible')
    if (viewBox) {
      svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`)
    }

    return svg.outerHTML
  })

  const frame = $derived(viewBox ?? overlay)
</script>

<div class={cn('relative', className)}>
  <div class="absolute inset-0 flex items-center justify-center p-6">
    {@html fitted}
  </div>
  {#if overlay && frame}
    <svg
      class="pointer-events-none absolute inset-0 h-full w-full p-6 text-neutral-900 dark:text-neutral-100"
      viewBox={`${frame.x} ${frame.y} ${frame.width} ${frame.height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <path
        d={`M${frame.x} ${frame.y}H${frame.x + frame.width}V${frame.y + frame.height}H${frame.x}Z
            M${overlay.x} ${overlay.y}V${overlay.y + overlay.height}H${overlay.x + overlay.width}V${overlay.y}Z`}
        fill="currentColor"
        fill-rule="evenodd"
        opacity="0.12"
      />
      <rect
        x={overlay.x}
        y={overlay.y}
        width={overlay.width}
        height={overlay.height}
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-dasharray="5 4"
        vector-effect="non-scaling-stroke"
        opacity="0.7"
      />
    </svg>
  {/if}
</div>

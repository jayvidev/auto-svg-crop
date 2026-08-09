<script lang="ts">
  import CopyIcon from '@lucide/svelte/icons/copy'
  import DownloadIcon from '@lucide/svelte/icons/download'
  import FileUpIcon from '@lucide/svelte/icons/file-up'
  import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw'
  import UploadIcon from '@lucide/svelte/icons/upload'
  import { toast } from 'svelte-sonner'

  import Dropzone from '@/components/dropzone.svelte'
  import { Button } from '@/components/ui/button'
  import { Separator } from '@/components/ui/separator'
  import { Switch } from '@/components/ui/switch'
  import { settings } from '@/stores/settings.store'
  import { clipboard } from '@/utils/clipboard'
  import { cn } from '@/utils/cn'
  import { cropSvg, type CropSvgResult } from '@/utils/cropSvg'
  import { download } from '@/utils/download'
  import { optimizeSvg } from '@/utils/optimizeSvg'
  import { byteSize, formatBytes, readSvgFile } from '@/utils/readSvgFile'

  let fileInput = $state<HTMLInputElement | null>(null)
  let dragging = $state(false)
  let dragDepth = 0

  let source = $state('')
  let filename = $state('cropped.svg')
  let result = $state<CropSvgResult | null>(null)

  const output = $derived(
    result ? ($settings.optimizeSvgs ? optimizeSvg({ svgCode: result.svg }) : result.svg) : ''
  )

  const stats = $derived.by(() => {
    if (!result) return null
    const before = byteSize(source)
    const after = byteSize(output)
    return {
      before,
      after,
      saved: before > 0 ? Math.max(0, 1 - after / before) : 0,
    }
  })

  const process = (code: string, name?: string) => {
    if (!code.includes('<svg')) {
      toast.error('That does not look like an SVG', {
        description: 'Paste <svg> code or drop a .svg file',
      })
      return
    }
    try {
      const cropped = cropSvg({ svgCode: code })
      source = code
      result = cropped
      if (name) filename = name.replace(/\.svg$/i, '') + '-crop.svg'
      toast.success('SVG cropped', {
        description: `viewBox: ${cropped.croppedViewBox}`,
      })
    } catch (error) {
      result = null
      toast.error('Could not crop', {
        description: (error as Error).message,
      })
    }
  }

  const loadFile = async (file: File) => {
    try {
      process(await readSvgFile(file), file.name)
    } catch (error) {
      toast.error('Invalid file', {
        description: (error as Error).message,
      })
    }
  }

  const onFileInput = (event: Event) => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0]
    if (file) loadFile(file)
    if (fileInput) fileInput.value = ''
  }

  const onPaste = (event: ClipboardEvent) => {
    const target = event.target as HTMLElement | null
    if (target?.closest("input, textarea, [contenteditable='true']")) return

    const file = Array.from(event.clipboardData?.files ?? [])[0]
    if (file) {
      event.preventDefault()
      loadFile(file)
      return
    }

    const text = event.clipboardData?.getData('text/plain')?.trim()
    if (text) {
      event.preventDefault()
      process(text)
    }
  }

  const hasFiles = (event: DragEvent) =>
    Array.from(event.dataTransfer?.types ?? []).includes('Files')

  const onDragEnter = (event: DragEvent) => {
    if (!hasFiles(event)) return
    dragDepth += 1
    dragging = true
  }

  const onDragOver = (event: DragEvent) => {
    if (!hasFiles(event)) return
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
  }

  const onDragLeave = () => {
    dragDepth = Math.max(0, dragDepth - 1)
    if (dragDepth === 0) dragging = false
  }

  const onDrop = (event: DragEvent) => {
    if (!hasFiles(event)) return
    event.preventDefault()
    dragDepth = 0
    dragging = false
    const file = event.dataTransfer?.files?.[0]
    if (file) loadFile(file)
  }

  const copy = () => {
    clipboard(output)
    toast.success('Copied to clipboard')
  }

  const save = () => {
    download({ content: output, filename, mimeType: 'image/svg+xml' })
  }

  const reset = () => {
    source = ''
    result = null
    filename = 'cropped.svg'
  }
</script>

<svelte:window
  onpaste={onPaste}
  ondragenter={onDragEnter}
  ondragover={onDragOver}
  ondragleave={onDragLeave}
  ondrop={onDrop}
/>

<input
  bind:this={fileInput}
  onchange={onFileInput}
  type="file"
  accept=".svg,image/svg+xml"
  class="hidden"
/>

{#if dragging}
  <div
    class="fixed inset-0 z-100 flex items-center justify-center bg-neutral-950/60 backdrop-blur-xs"
  >
    <div
      class="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-neutral-100 px-14 py-10 text-neutral-100"
    >
      <FileUpIcon size={32} strokeWidth={1.5} />
      <p class="text-lg font-medium">Drop the SVG anywhere</p>
    </div>
  </div>
{/if}

{#if !result}
  <Dropzone {dragging} onPickFile={() => fileInput?.click()} />
{:else}
  <div class="space-y-6">
    <!-- Toolbar -->
    <div
      class="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div class="flex flex-wrap items-center gap-2">
        <Button onclick={copy}>
          <CopyIcon size={15} strokeWidth={1.5} />
          <span>Copy</span>
        </Button>
        <Button variant="outline" onclick={save}>
          <DownloadIcon size={15} strokeWidth={1.5} />
          <span>Download</span>
        </Button>
        <Button variant="ghost" onclick={() => fileInput?.click()}>
          <UploadIcon size={15} strokeWidth={1.5} />
          <span>New SVG</span>
        </Button>
        <Button variant="ghost" onclick={reset}>
          <RotateCcwIcon size={15} strokeWidth={1.5} />
          <span>Clear</span>
        </Button>
      </div>
      <label class="flex items-center gap-2.5 text-sm sm:pr-1">
        <Switch bind:checked={$settings.optimizeSvgs} />
        <span>Optimize with SVGO</span>
      </label>
    </div>

    <!-- Stats -->
    <div
      class="grid gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-4 dark:border-neutral-800 dark:bg-neutral-800"
    >
      {#snippet stat(label: string, value: string)}
        <div class="bg-white p-4 dark:bg-neutral-900">
          <p class="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
          <p class="mt-1 truncate font-mono text-sm" title={value}>{value}</p>
        </div>
      {/snippet}
      {@render stat('Original viewBox', result.originalViewBox ?? 'not defined')}
      {@render stat('Cropped viewBox', result.croppedViewBox)}
      {@render stat('Size', `${result.width} × ${result.height}`)}
      {@render stat(
        'Weight',
        stats
          ? `${formatBytes(stats.before)} → ${formatBytes(stats.after)} (-${Math.round(stats.saved * 100)}%)`
          : '-'
      )}
    </div>

    <!-- Previews -->
    <div class="grid gap-6 lg:grid-cols-2">
      {#snippet preview(title: string, code: string, highlight: boolean)}
        <div
          class={cn(
            'overflow-hidden rounded-xl border bg-white dark:bg-neutral-900',
            highlight
              ? 'border-neutral-400 dark:border-neutral-600'
              : 'border-neutral-200 dark:border-neutral-800'
          )}
        >
          <div
            class="flex items-center justify-between border-b border-neutral-200 px-4 py-2.5 text-sm font-medium dark:border-neutral-800"
          >
            <span>{title}</span>
          </div>
          <div
            class="checkerboard flex h-64 items-center justify-center p-6 [&>svg]:max-h-full [&>svg]:max-w-full"
          >
            {@html code}
          </div>
        </div>
      {/snippet}
      {@render preview('Original', source, false)}
      {@render preview('Cropped', output, true)}
    </div>

    <!-- Code -->
    <div
      class="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div
        class="flex items-center justify-between border-b border-neutral-200 px-4 py-2 dark:border-neutral-800"
      >
        <span class="text-sm font-medium">Result</span>
        <div class="flex h-5 items-center gap-2">
          <span class="font-mono text-xs text-neutral-500 dark:text-neutral-400"
            >{formatBytes(byteSize(output))}</span
          >
          <Separator orientation="vertical" />
          <Button variant="ghost" size="sm" onclick={copy}>
            <CopyIcon size={14} strokeWidth={1.5} />
            <span>Copy</span>
          </Button>
        </div>
      </div>
      <pre
        class="max-h-72 overflow-auto p-4 font-mono text-xs whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{output}</pre>
    </div>
  </div>
{/if}

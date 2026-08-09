<script lang="ts">
  import CopyIcon from '@lucide/svelte/icons/copy'
  import DownloadIcon from '@lucide/svelte/icons/download'
  import FileUpIcon from '@lucide/svelte/icons/file-up'
  import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw'
  import SparklesIcon from '@lucide/svelte/icons/sparkles'
  import UploadIcon from '@lucide/svelte/icons/upload'
  import type { Snippet } from 'svelte'
  import { toast } from 'svelte-sonner'

  import Dropzone from '@/components/dropzone.svelte'
  import SvgPreview from '@/components/svgPreview.svelte'
  import { Button } from '@/components/ui/button'
  import { Separator } from '@/components/ui/separator'
  import { Switch } from '@/components/ui/switch'
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
  import { exampleSvg } from '@/data/example'
  import { settings } from '@/stores/settings.store'
  import { clipboard } from '@/utils/clipboard'
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
  let sameScale = $state(true)

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
        description: `${Math.round(cropped.trimmed * 100)}% of the canvas was empty space`,
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

{#snippet before()}
  <SvgPreview
    code={source}
    viewBox={result?.frame}
    overlay={result?.crop}
    class="checkerboard h-72"
  />
{/snippet}

{#snippet after()}
  <SvgPreview
    code={output}
    viewBox={sameScale ? result?.frame : null}
    overlay={sameScale ? result?.crop : null}
    class="checkerboard h-72"
  />
{/snippet}

{#snippet stat(label: string, value: string)}
  <div class="bg-white p-4 dark:bg-neutral-900">
    <p class="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
    <p class="mt-1 truncate font-mono text-sm" title={value}>{value}</p>
  </div>
{/snippet}

{#snippet code()}
  <div>
    <div
      class="flex items-center justify-end gap-2 border-b border-neutral-200 px-3 py-1.5 dark:border-neutral-800"
    >
      <span class="font-mono text-xs text-neutral-500 dark:text-neutral-400">
        {formatBytes(byteSize(output))}
      </span>
      <Separator orientation="vertical" class="h-5" />
      <Button variant="ghost" size="sm" onclick={copy}>
        <CopyIcon size={14} strokeWidth={1.5} />
        <span>Copy</span>
      </Button>
    </div>
    <pre
      class="max-h-96 overflow-auto p-4 font-mono text-xs whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{output}</pre>
  </div>
{/snippet}

{#snippet card(title: string, subtitle: string, body: Snippet)}
  <div
    class="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
  >
    <div
      class="flex items-baseline justify-between gap-3 border-b border-neutral-200 px-4 py-2.5 dark:border-neutral-800"
    >
      <span class="text-sm font-medium">{title}</span>
      <span class="font-mono text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</span>
    </div>
    {@render body()}
  </div>
{/snippet}

{#if !result}
  <section class="space-y-2 py-10 text-center sm:py-14">
    <h1 class="text-3xl font-medium tracking-tight text-balance sm:text-4xl">
      Trim the empty space around your SVGs
    </h1>
    <p class="text-neutral-500 text-pretty dark:text-neutral-400">
      Measures the real bounding box with
      <code class="font-mono">getBBox()</code> and rewrites the
      <code class="font-mono">viewBox</code> to fit the visible content.
    </p>
  </section>

  <Dropzone {dragging} onPickFile={() => fileInput?.click()} />

  <div class="mt-4 flex justify-center">
    <Button variant="ghost" size="sm" onclick={() => process(exampleSvg, 'example.svg')}>
      <SparklesIcon size={14} strokeWidth={1.5} />
      <span>Try it with an example</span>
    </Button>
  </div>
{:else}
  <div class="space-y-5 pt-6">
    <!-- Toolbar -->
    <div
      class="sticky top-16 z-40 flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white/90 p-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800 dark:bg-neutral-900/90"
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

    <Tabs value="compare" class="gap-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="compare">Compare</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <label
          class="flex items-center gap-2.5 text-sm"
          title="Render both previews in the original coordinate system"
        >
          <Switch bind:checked={sameScale} />
          <span>Same scale</span>
        </label>
      </div>

      <TabsContent value="compare" class="space-y-5">
        <div class="grid gap-5 lg:grid-cols-2">
          {@render card('Before', `${result.frame.width} × ${result.frame.height}`, before)}
          {@render card('After', `${result.width} × ${result.height}`, after)}
        </div>

        <!-- Stats -->
        <div
          class="grid gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-4 dark:border-neutral-800 dark:bg-neutral-800"
        >
          {@render stat('Original viewBox', result.originalViewBox ?? 'not defined')}
          {@render stat('Cropped viewBox', result.croppedViewBox)}
          {@render stat('Empty space', `${Math.round(result.trimmed * 100)}% removed`)}
          {@render stat(
            'Weight',
            stats
              ? `${formatBytes(stats.before)} → ${formatBytes(stats.after)} (-${Math.round(stats.saved * 100)}%)`
              : '-'
          )}
        </div>
      </TabsContent>

      <TabsContent value="code">
        {@render card('Result', filename, code)}
      </TabsContent>
    </Tabs>
  </div>
{/if}

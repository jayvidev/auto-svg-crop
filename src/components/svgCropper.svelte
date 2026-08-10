<script module lang="ts">
  let initialHeroAnimated = false
</script>

<script lang="ts">
  import { onMount, type Snippet } from 'svelte'
  import { pushState, replaceState } from '$app/navigation'
  import { page } from '$app/state'

  import CopyIcon from '@lucide/svelte/icons/copy'
  import DownloadIcon from '@lucide/svelte/icons/download'
  import EraserIcon from '@lucide/svelte/icons/eraser'
  import SparklesIcon from '@lucide/svelte/icons/sparkles'
  import UploadIcon from '@lucide/svelte/icons/upload'
  import { toast } from 'svelte-sonner'

  import CodeBlock from '@/components/codeBlock.svelte'
  import Dropzone from '@/components/dropzone.svelte'
  import SvgPreview from '@/components/svgPreview.svelte'
  import { Button } from '@/components/ui/button'
  import MovingFileUpIcon from '@/components/ui/moving-icons/file-up-icon.svelte'
  import { Separator } from '@/components/ui/separator'
  import { Switch } from '@/components/ui/switch'
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
  import { exampleSvg } from '@/data/example'
  import { settings } from '@/stores/settings.store'
  import { clipboard } from '@/utils/clipboard'
  import { cn } from '@/utils/cn'
  import { cropSvg, type CropSvgResult } from '@/utils/cropSvg'
  import { download } from '@/utils/download'
  import { optimizeSvg } from '@/utils/optimizeSvg'
  import { byteSize, formatBytes, readSvgFile } from '@/utils/readSvgFile'

  const storageKey = 'auto_svg_crop_last'
  const maxStoredBytes = 512 * 1024

  let fileInput = $state<HTMLInputElement | null>(null)
  let dragging = $state(false)
  let dragDepth = 0

  let source = $state('')
  let filename = $state('cropped.svg')
  let result = $state<CropSvgResult | null>(null)
  let showCropArea = $state(true)
  let activeTab = $state<'compare' | 'code'>('compare')

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

  const process = async (code: string, name?: string) => {
    if (!code.includes('<svg')) {
      toast.error('That does not look like an SVG', {
        description: 'Paste <svg> code or drop a .svg file',
      })
      return
    }
    try {
      if (code.includes('<text')) await document.fonts.ready
      const cropped = cropSvg({ svgCode: code })
      source = code
      result = cropped
      if (name) filename = name.replace(/\.svg$/i, '') + '-crop.svg'
      remember(code, filename)
      pushState('', { view: 'result' })
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

  let hasAnimatedHero = $state(initialHeroAnimated)

  onMount(() => {
    restore()

    if (!initialHeroAnimated) {
      initialHeroAnimated = true
      const timer = setTimeout(() => {
        hasAnimatedHero = true
      }, 1000)
      return () => clearTimeout(timer)
    }
  })

  /**
   * Staggered entrance only on initial page load.
   */
  const heroEnter = $derived(
    hasAnimatedHero ? '' : 'animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-both duration-500'
  )

  const remember = (code: string, name: string) => {
    try {
      if (byteSize(code) > maxStoredBytes) {
        localStorage.removeItem(storageKey)
        return
      }
      localStorage.setItem(storageKey, JSON.stringify({ code, name }))
    } catch {
      // Private mode or quota exceeded: persistence is a nicety, not a feature.
    }
  }

  const restore = () => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) return

      const { code, name } = JSON.parse(stored) as { code?: string; name?: string }
      if (!code) return

      result = cropSvg({ svgCode: code })
      source = code
      filename = name ?? 'cropped.svg'
      replaceState('', { view: 'result' })
    } catch {
      localStorage.removeItem(storageKey)
    }
  }

  const reset = () => {
    source = ''
    result = null
    filename = 'cropped.svg'
    localStorage.removeItem(storageKey)
    replaceState('', {})
  }

  const showResult = $derived(Boolean(result) && page.state.view === 'result')
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
    class="animate-in fade-in-0 fixed inset-0 z-100 flex items-center justify-center bg-neutral-100/80 p-6 backdrop-blur-sm duration-200 dark:bg-neutral-950/80"
  >
    <div
      class="zoom-in-95 animate-in flex w-full max-w-md flex-col items-center gap-4 rounded-xl border-2 border-dashed border-neutral-400 bg-white/80 px-8 py-12 text-center duration-200 dark:border-neutral-600 dark:bg-neutral-900/80"
    >
      <MovingFileUpIcon
        size={32}
        strokeWidth={1.5}
        isHovered
        class="text-neutral-500 dark:text-neutral-400"
      />
      <div class="space-y-1">
        <p class="text-base font-medium sm:text-lg">Drop it anywhere</p>
        <p class="text-xs text-neutral-500 sm:text-sm dark:text-neutral-400">
          Release to crop the SVG
        </p>
      </div>
    </div>
  </div>
{/if}

{#snippet before()}
  <SvgPreview
    code={source}
    viewBox={result?.frame}
    overlay={showCropArea ? result?.crop : null}
    class="checkerboard h-72"
  />
{/snippet}

{#snippet after()}
  <SvgPreview code={output} overlay={null} class="checkerboard h-72" />
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
    <CodeBlock code={output} class="max-h-96" />
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

{#if !showResult}
  <div class="relative flex flex-1 flex-col justify-center py-10">
    <div class="pointer-events-none absolute inset-0 -z-10 hero-glow" aria-hidden="true"></div>

    <section class="space-y-2 pb-8 text-center">
      <h1 class={cn('text-2xl font-semibold tracking-tight text-balance sm:text-4xl', heroEnter)}>
        Trim the empty space around your SVGs
      </h1>
      <p
        class={cn(
          'text-sm text-neutral-500 text-pretty sm:text-base dark:text-neutral-400',
          heroEnter,
          !hasAnimatedHero && 'delay-100'
        )}
      >
        Measures the real bounding box with
        <code class="font-mono">getBBox()</code> and rewrites the
        <code class="font-mono">viewBox</code> to fit the visible content.
      </p>
    </section>

    <div class={cn(heroEnter, !hasAnimatedHero && 'delay-200')}>
      <Dropzone {dragging} onPickFile={() => fileInput?.click()} />
    </div>

    <div class={cn('mt-4 flex justify-center', heroEnter, !hasAnimatedHero && 'delay-300')}>
      <Button variant="ghost" size="sm" onclick={() => process(exampleSvg, 'example.svg')}>
        <SparklesIcon size={14} strokeWidth={1.5} />
        <span>Try it with an example</span>
      </Button>
    </div>
  </div>
{:else if result}
  <div class="space-y-5 pt-6 animate-in fade-in-0 duration-300">
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
          <EraserIcon size={15} strokeWidth={1.5} />
          <span>Clear</span>
        </Button>
      </div>
      <label class="flex items-center gap-2.5 text-sm sm:pr-1">
        <Switch bind:checked={$settings.optimizeSvgs} />
        <span>Optimize with SVGO</span>
      </label>
    </div>

    <Tabs
      value={activeTab}
      onValueChange={(v) => (activeTab = (v || 'compare') as 'compare' | 'code')}
      class="gap-4"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="compare">Compare</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        {#if activeTab === 'compare'}
          <label
            class="flex items-center gap-2.5 text-sm"
            title="Outline the bounding box and dim the empty space being removed"
          >
            <Switch bind:checked={showCropArea} />
            <span>Show crop area</span>
          </label>
        {/if}
      </div>

      <TabsContent value="compare" class="animate-in fade-in-0 space-y-5 duration-300">
        <div class="grid gap-5 lg:grid-cols-2">
          {@render card(
            'Before',
            `${result.frame.width} × ${result.frame.height} · ${Math.round(result.trimmed * 100)}% empty`,
            before
          )}
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

      <TabsContent value="code" class="animate-in fade-in-0 duration-300">
        {@render card('Result', filename, code)}
      </TabsContent>
    </Tabs>
  </div>
{/if}

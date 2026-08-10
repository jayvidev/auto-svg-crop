<script module lang="ts">
  let initialHeroAnimated = false
</script>

<script lang="ts">
  import { onMount, type Snippet } from 'svelte'
  import { pushState, replaceState } from '$app/navigation'
  import { page } from '$app/state'

  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down'
  import CodeIcon from '@lucide/svelte/icons/code-xml'
  import ColumnsIcon from '@lucide/svelte/icons/columns-2'
  import CopyIcon from '@lucide/svelte/icons/copy'
  import DownloadIcon from '@lucide/svelte/icons/download'
  import Grid2x2Icon from '@lucide/svelte/icons/grid-2x2'
  import LinkIcon from '@lucide/svelte/icons/link'
  import MoonIcon from '@lucide/svelte/icons/moon'
  import SparklesIcon from '@lucide/svelte/icons/sparkles'
  import SunIcon from '@lucide/svelte/icons/sun'
  import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert'
  import UploadIcon from '@lucide/svelte/icons/upload'
  import XIcon from '@lucide/svelte/icons/x'
  import { toast } from 'svelte-sonner'

  import CodeBlock from '@/components/codeBlock.svelte'
  import Dropzone from '@/components/dropzone.svelte'
  import History from '@/components/history.svelte'
  import Css from '@/components/logos/css.svelte'
  import React from '@/components/logos/react.svelte'
  import SvgPreview from '@/components/svgPreview.svelte'
  import { Button, buttonVariants } from '@/components/ui/button'
  import * as DropdownMenu from '@/components/ui/dropdown-menu'
  import { Kbd } from '@/components/ui/kbd'
  import MovingFileUpIcon from '@/components/ui/moving-icons/file-up-icon.svelte'
  import { Separator } from '@/components/ui/separator'
  import { Slider } from '@/components/ui/slider'
  import { Switch } from '@/components/ui/switch'
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
  import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
  import { exampleSvg } from '@/data/example'
  import { addToHistory, type HistoryEntry } from '@/stores/history.store'
  import { settings } from '@/stores/settings.store'
  import { clipboard } from '@/utils/clipboard'
  import { cn } from '@/utils/cn'
  import { type Box, cropSvg, type CropSvgResult, expandBox, withViewBox } from '@/utils/cropSvg'
  import { download } from '@/utils/download'
  import { componentName, type ExportFormat, formatSvg } from '@/utils/exportSvg'
  import { optimizeSvg } from '@/utils/optimizeSvg'
  import { byteSize, formatBytes, readSvgFile } from '@/utils/readSvgFile'

  let fileInput = $state<HTMLInputElement | null>(null)
  let dragging = $state(false)
  let dragDepth = 0

  let source = $state('')
  let filename = $state('cropped.svg')
  let result = $state<CropSvgResult | null>(null)
  let showCropArea = $state(true)
  let activeTab = $state<'compare' | 'code'>('compare')
  let padding = $state(0)
  let previewBackground = $state<PreviewBackground>('checker')

  type PreviewBackground = 'checker' | 'light' | 'dark'

  const backgrounds = {
    checker: 'checkerboard text-neutral-900 dark:text-neutral-100',
    light: 'bg-white text-neutral-900',
    dark: 'bg-neutral-950 text-neutral-100',
  } as const

  const previewClass = $derived(cn(backgrounds[previewBackground] ?? backgrounds.checker, 'h-72'))

  const box = $derived<Box | null>(result ? expandBox(result.crop, padding) : null)

  const cropped = $derived(result && box ? withViewBox(result.svg, box) : '')

  const output = $derived(
    cropped ? ($settings.optimizeSvgs ? optimizeSvg({ svgCode: cropped }) : cropped) : ''
  )

  const shortcuts = [
    { keys: '⌘/Ctrl + C', label: 'copy' },
    { keys: '⌘/Ctrl + S', label: 'download' },
    { keys: '⌘/Ctrl + V', label: 'paste another SVG' },
    { keys: 'Esc', label: 'back to start' },
  ]

  const backgroundOptions = [
    { value: 'checker', label: 'Checkerboard', icon: Grid2x2Icon },
    { value: 'light', label: 'White background', icon: SunIcon },
    { value: 'dark', label: 'Black background', icon: MoonIcon },
  ] as const

  const round = (value: number) => Math.round(value * 100) / 100

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'instant' })

  const onKeydown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null
    if (target?.closest("input, textarea, [contenteditable='true']")) return
    if (!result) return

    if (event.key === 'Escape') {
      reset()
      return
    }

    if (!event.metaKey && !event.ctrlKey) return

    if (event.key === 's') {
      event.preventDefault()
      save()
    }

    if (event.key === 'c' && !window.getSelection()?.toString()) {
      event.preventDefault()
      copy()
    }
  }

  const copyAs = (format: ExportFormat, label: string) => {
    clipboard(formatSvg(output, format, componentName(filename)))
    toast.success(`Copied as ${label}`)
  }

  const stats = $derived.by(() => {
    if (!result) return null

    const before = byteSize(source)
    const trimmedBytes = byteSize(cropped)
    const after = byteSize(output)

    return {
      before,
      after,
      saved: before > 0 ? Math.max(0, 1 - after / before) : 0,
      byCrop: Math.max(0, before - trimmedBytes),
      bySvgo: Math.max(0, trimmedBytes - after),
    }
  })

  const trim = $derived.by(() => {
    if (!result || !box) return null

    const { frame } = result
    return {
      top: round(box.y - frame.y),
      right: round(frame.x + frame.width - (box.x + box.width)),
      bottom: round(frame.y + frame.height - (box.y + box.height)),
      left: round(box.x - frame.x),
    }
  })

  const ratio = $derived.by(() => {
    if (!box || !box.width || !box.height) return '-'

    return box.width >= box.height
      ? `${round(box.width / box.height)}:1`
      : `1:${round(box.height / box.width)}`
  })

  const scale = $derived.by(() => {
    if (!result || !box || !box.width || !box.height) return '-'

    const factor = Math.min(result.frame.width / box.width, result.frame.height / box.height)
    return `${round(factor)}× bigger`
  })

  const suggestedSize = $derived(
    box ? `width="${Math.round(box.width)}" height="${Math.round(box.height)}"` : '-'
  )

  const appliedPadding = $derived.by(() => {
    if (!result) return '-'
    if (!padding) return 'none'

    const amount = round((Math.max(result.crop.width, result.crop.height) * padding) / 100)
    return `${padding}% · ${amount} units`
  })

  const copyValue = (value: string) => {
    clipboard(value)
    toast.success('Copied to clipboard', { description: value })
  }

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
      addToHistory({
        name: filename,
        code,
        crop: cropped.crop,
        width: cropped.width,
        height: cropped.height,
      })
      pushState('', { view: 'result' })
      scrollToTop()
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

  let hydrated = $state(false)
  let hasAnimatedHero = $state(initialHeroAnimated)

  onMount(() => {
    hydrated = true

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
    !hydrated || hasAnimatedHero
      ? ''
      : 'animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-both duration-500'
  )

  const openHistoryEntry = (entry: HistoryEntry) => {
    try {
      result = cropSvg({ svgCode: entry.code })
      source = entry.code
      filename = entry.name
      pushState('', { view: 'result' })
      scrollToTop()
    } catch (error) {
      toast.error('Could not reopen', { description: (error as Error).message })
    }
  }

  const reset = () => {
    source = ''
    result = null
    filename = 'cropped.svg'
    replaceState('', {})
    scrollToTop()
  }

  const showResult = $derived(Boolean(result) && page.state.view === 'result')
</script>

<svelte:window
  onkeydown={onKeydown}
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
    overlay={showCropArea ? box : null}
    class={previewClass}
  />
{/snippet}

{#snippet after()}
  <SvgPreview code={output} overlay={null} class={previewClass} />
{/snippet}

{#snippet stat(label: string, value: string, copyable = false)}
  {#if copyable}
    <button
      type="button"
      onclick={() => copyValue(value)}
      title={`${value} — click to copy`}
      class="group/stat cursor-pointer border-r border-b border-neutral-200 p-4 text-left transition-colors hover:bg-neutral-100/80 dark:border-neutral-800 dark:hover:bg-neutral-800/20"
    >
      <span class="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
        {label}
        <CopyIcon
          size={12}
          strokeWidth={1.5}
          class="opacity-0 transition-opacity group-hover/stat:opacity-100"
        />
      </span>
      <span class="mt-1 block truncate font-mono text-sm">{value}</span>
    </button>
  {:else}
    <div class="border-r border-b border-neutral-200 p-4 dark:border-neutral-800">
      <p class="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
      <p class="mt-1 truncate font-mono text-sm" title={value}>{value}</p>
    </div>
  {/if}
{/snippet}

{#snippet colorStat(colors: string[])}
  <div class="border-r border-b border-neutral-200 p-4 dark:border-neutral-800">
    <p class="text-xs text-neutral-500 dark:text-neutral-400">
      {colors.length}
      {colors.length === 1 ? 'color' : 'colors'}
    </p>
    {#if !colors.length}
      <p class="mt-1 truncate font-mono text-sm">gradients only</p>
    {/if}
    <div class="mt-1.5 flex flex-wrap gap-1.5">
      {#each colors.slice(0, 10) as color (color)}
        <button
          type="button"
          onclick={() => copyValue(color)}
          title={`${color} — click to copy`}
          style={`background-color: ${color}`}
          class="size-4 cursor-pointer rounded-sm border border-neutral-300 dark:border-neutral-600"
        >
          <span class="sr-only">{color}</span>
        </button>
      {/each}
    </div>
  </div>
{/snippet}

{#snippet code()}
  <div>
    <div
      class="flex items-center justify-between gap-2 border-b border-neutral-200 px-3 py-1.5 dark:border-neutral-800"
    >
      <span class="font-mono text-xs text-neutral-500 dark:text-neutral-400">
        {formatBytes(byteSize(output))}
      </span>
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
  <div class={cn('flex flex-1 flex-col py-10', !hydrated && 'opacity-0')} data-landing>
    <div class="relative flex flex-1 flex-col justify-center">
      <div class="pointer-events-none absolute inset-0 -z-10 hero-glow" aria-hidden="true"></div>

      <section class="space-y-2 pb-8 text-center">
        <h1 class={cn('text-2xl font-semibold tracking-tight text-balance sm:text-4xl', heroEnter)}>
          Crop, pad and optimize your SVGs
        </h1>
        <p
          class={cn(
            'mx-auto max-w-2xl text-sm text-neutral-500 text-pretty sm:text-base dark:text-neutral-400',
            heroEnter,
            !hasAnimatedHero && 'delay-100'
          )}
        >
          Measures the real painted bounding box and rewrites the
          <code class="font-mono">viewBox</code> to fit the artwork. Add padding, optimize with SVGO and
          copy it in the format you need.
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

    <History
      onSelect={openHistoryEntry}
      class={cn(heroEnter, !hasAnimatedHero && 'delay-[400ms]')}
    />
  </div>
{:else if result}
  <div class="space-y-5 pt-6 animate-in fade-in-0 duration-300">
    <!-- Toolbar -->
    <div
      class="sticky top-16 z-40 flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white/90 p-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800 dark:bg-neutral-900/90"
    >
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center">
          <Button onclick={copy} class="rounded-r-none">
            <CopyIcon size={15} strokeWidth={1.5} />
            <span>Copy</span>
          </Button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              class={cn(buttonVariants(), 'rounded-l-none border-l border-neutral-700 px-2')}
              title="Copy as another format"
            >
              <ChevronDownIcon size={15} strokeWidth={1.5} />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="start">
              <DropdownMenu.Item onclick={() => copyAs('svg', 'SVG')}>
                <CodeIcon size={15} strokeWidth={1.5} />
                <span>SVG</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item onclick={() => copyAs('dataUri', 'data URI')}>
                <LinkIcon size={15} strokeWidth={1.5} />
                <span>Data URI</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item onclick={() => copyAs('css', 'CSS')}>
                <Css size={15} />
                <span>CSS background</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item onclick={() => copyAs('react', 'React')}>
                <React size={15} />
                <span>React component</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
        <Button variant="outline" onclick={save}>
          <DownloadIcon size={15} strokeWidth={1.5} />
          <span>Download</span>
        </Button>
        <Button variant="outline" onclick={() => fileInput?.click()}>
          <UploadIcon size={15} strokeWidth={1.5} />
          <span>New SVG</span>
        </Button>
      </div>
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2.5 text-sm">
          <Switch bind:checked={$settings.optimizeSvgs} />
          <span>Optimize with SVGO</span>
        </label>
        <Separator orientation="vertical" class="h-5" />
        <Button
          variant="outline"
          size="icon"
          onclick={reset}
          title="Back to start — this crop stays in Recent"
        >
          <XIcon size={16} strokeWidth={1.5} />
          <span class="sr-only">Back to start</span>
        </Button>
      </div>
    </div>

    <Tabs
      value={activeTab}
      onValueChange={(v) => (activeTab = (v || 'compare') as 'compare' | 'code')}
      class="gap-4"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="compare" class="gap-1.5">
            <ColumnsIcon size={14} strokeWidth={1.5} />
            <span>Compare</span>
          </TabsTrigger>
          <TabsTrigger value="code" class="gap-1.5">
            <CodeIcon size={14} strokeWidth={1.5} />
            <span>Code</span>
          </TabsTrigger>
        </TabsList>
        {#if activeTab === 'compare'}
          <div class="flex flex-wrap items-center gap-2">
            <label class="flex items-center gap-2.5 text-sm" title="Margin added around the crop">
              <span>Padding</span>
              <Slider bind:value={padding} min={0} max={25} step={1} class="w-24" />
              <span class="w-9 text-sm tabular-nums">{padding}%</span>
            </label>
            <Separator orientation="vertical" class="h-5" />
            <ToggleGroup bind:value={previewBackground} aria-label="Preview background">
              {#each backgroundOptions as option (option.value)}
                <ToggleGroupItem value={option.value} title={option.label}>
                  <option.icon size={15} strokeWidth={1.5} />
                  <span class="sr-only">{option.label}</span>
                </ToggleGroupItem>
              {/each}
            </ToggleGroup>
            <Separator orientation="vertical" class="h-5" />
            <label
              class="flex items-center gap-2.5 text-sm"
              title="Outline the bounding box and dim the empty space being removed"
            >
              <Switch bind:checked={showCropArea} />
              <span>Show crop area</span>
            </label>
          </div>
        {/if}
      </div>

      <TabsContent value="compare" class="animate-in fade-in-0 space-y-5 duration-300">
        <div class="grid gap-5 lg:grid-cols-2">
          {@render card(
            'Before',
            `${result.frame.width} × ${result.frame.height} · ${Math.round(result.trimmed * 100)}% empty`,
            before
          )}
          {@render card('After', box ? `${box.width} × ${box.height}` : '', after)}
        </div>

        <!-- Stats -->
        <div
          class="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="-mr-px -mb-px grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {@render stat('Original viewBox', result.originalViewBox ?? 'not defined', true)}
            {@render stat(
              'Cropped viewBox',
              box ? `${box.x} ${box.y} ${box.width} ${box.height}` : '-',
              true
            )}
            {@render stat('Empty space', `${Math.round(result.trimmed * 100)}% removed`)}
            {@render stat(
              'Trimmed sides',
              trim ? `${trim.top} / ${trim.right} / ${trim.bottom} / ${trim.left}` : '-'
            )}
            {@render stat('Aspect ratio', ratio)}
            {@render stat(
              'Complexity',
              `${result.elements} ${result.elements === 1 ? 'element' : 'elements'} · ${result.pathNodes} nodes`
            )}
            {@render colorStat(result.colors)}
            {@render stat(
              'Weight',
              stats
                ? `${formatBytes(stats.before)} → ${formatBytes(stats.after)} (-${Math.round(stats.saved * 100)}%)`
                : '-'
            )}
            {@render stat(
              'Saved by',
              stats ? `crop ${formatBytes(stats.byCrop)} · SVGO ${formatBytes(stats.bySvgo)}` : '-'
            )}
            {@render stat('Renders', scale)}
            {@render stat('Suggested size', suggestedSize, true)}
            {@render stat('Padding', appliedPadding)}
          </div>
        </div>

        {#if result.warnings.length}
          <div
            class="space-y-2 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <p
              class="flex items-center gap-2 text-sm font-medium text-neutral-500 dark:text-neutral-400"
            >
              <TriangleAlertIcon size={14} strokeWidth={1.5} />
              <span>Worth knowing</span>
            </p>
            <ul class="space-y-1">
              {#each result.warnings as warning (warning.title)}
                <li class="text-sm">
                  <span class="font-medium">{warning.title}</span>
                  <span class="text-neutral-500 dark:text-neutral-400"> — {warning.detail}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </TabsContent>

      <TabsContent value="code" class="animate-in fade-in-0 duration-300">
        {@render card('Result', filename, code)}
      </TabsContent>
    </Tabs>

    <p
      class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1 text-xs text-neutral-500 dark:text-neutral-400"
    >
      {#each shortcuts as shortcut (shortcut.keys)}
        <span class="flex items-center gap-1.5">
          <Kbd>{shortcut.keys}</Kbd>
          {shortcut.label}
        </span>
      {/each}
    </p>
  </div>
{/if}

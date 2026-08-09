<script lang="ts">
  import ClipboardIcon from '@lucide/svelte/icons/clipboard'
  import FileUpIcon from '@lucide/svelte/icons/file-up'
  import MousePointerClickIcon from '@lucide/svelte/icons/mouse-pointer-click'

  import MovingFileUpIcon from '@/components/ui/moving-icons/file-up-icon.svelte'
  import { cn } from '@/utils/cn'

  interface Props {
    onPickFile: () => void
    dragging?: boolean
  }

  let { onPickFile, dragging = false }: Props = $props()

  let hovered = $state(false)

  const hints = [
    { icon: FileUpIcon, label: 'Drop a .svg file' },
    { icon: ClipboardIcon, label: 'Paste the code (⌘/Ctrl + V)' },
    { icon: MousePointerClickIcon, label: 'Or click to browse' },
  ]
</script>

<button
  type="button"
  onclick={onPickFile}
  onmouseenter={() => (hovered = true)}
  onmouseleave={() => (hovered = false)}
  class={cn(
    'flex w-full cursor-pointer flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed p-10 text-center transition-colors sm:p-20',
    'border-neutral-300 bg-white/50 hover:border-neutral-400 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-neutral-700 dark:hover:bg-neutral-900',
    dragging && 'border-neutral-900 bg-white dark:border-neutral-100 dark:bg-neutral-900'
  )}
>
  <MovingFileUpIcon
    size={32}
    strokeWidth={1.5}
    isHovered={hovered || dragging}
    class="text-neutral-500 dark:text-neutral-400"
  />
  <div class="space-y-1.5">
    <p class="text-lg font-medium">Drop, paste or pick your SVG</p>
    <p class="text-sm text-neutral-500 dark:text-neutral-400">
      Cropped automatically. Nothing is uploaded: everything runs in your browser.
    </p>
  </div>
  <div
    class="flex flex-col items-center gap-2 text-sm text-neutral-500 sm:flex-row sm:gap-5 dark:text-neutral-400"
  >
    {#each hints as hint (hint.label)}
      <span class="flex items-center gap-2">
        <hint.icon size={15} strokeWidth={1.5} />
        {hint.label}
      </span>
    {/each}
  </div>
</button>

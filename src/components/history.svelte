<script lang="ts">
  import HistoryIcon from '@lucide/svelte/icons/history'
  import XIcon from '@lucide/svelte/icons/x'

  import SvgPreview from '@/components/svgPreview.svelte'
  import { Button } from '@/components/ui/button'
  import {
    clearHistory,
    history,
    type HistoryEntry,
    removeFromHistory,
  } from '@/stores/history.store'
  import { cn } from '@/utils/cn'

  interface Props {
    onSelect: (entry: HistoryEntry) => void
  }

  let { onSelect }: Props = $props()
</script>

{#if $history.length}
  <section class="mt-10 space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="flex items-center gap-2 text-sm font-medium">
        <HistoryIcon size={15} strokeWidth={1.5} />
        <span>Recent crops</span>
      </h2>
      <Button variant="ghost" size="sm" onclick={clearHistory}>Clear all</Button>
    </div>

    <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {#each $history as entry (entry.id)}
        <li class="group relative">
          <button
            type="button"
            onclick={() => onSelect(entry)}
            title={`${entry.name} · ${entry.width} × ${entry.height}`}
            class={cn(
              'flex w-full cursor-pointer flex-col rounded-md border text-left transition-colors',
              'border-neutral-200 bg-white hover:bg-neutral-100/80 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/20'
            )}
          >
            <SvgPreview
              code={entry.code}
              viewBox={entry.crop}
              class="checkerboard h-24 rounded-t-md p-3"
            />
            <span class="truncate px-3 pt-2 text-xs font-medium">{entry.name}</span>
            <span
              class="truncate px-3 pt-0.5 pb-2 font-mono text-xs text-neutral-500 dark:text-neutral-400"
            >
              {entry.width} × {entry.height}
            </span>
          </button>
          <button
            type="button"
            onclick={() => removeFromHistory(entry.id)}
            title="Remove from history"
            class={cn(
              'absolute top-1.5 right-1.5 cursor-pointer rounded-md p-1 opacity-0 transition-opacity',
              'hover:bg-neutral-200 focus-visible:opacity-100 group-hover:opacity-100 dark:hover:bg-neutral-800'
            )}
          >
            <XIcon size={14} strokeWidth={1.5} />
            <span class="sr-only">Remove</span>
          </button>
        </li>
      {/each}
    </ul>
  </section>
{/if}

<script lang="ts">
  import type { Snippet } from 'svelte'

  import { cn } from '@/utils/cn'

  interface Props {
    class?: string
    children?: Snippet
  }

  let { class: className, children }: Props = $props()
</script>

<kbd
  class={cn(
    'inline-flex h-5 items-center rounded border border-neutral-200 bg-white px-1.5 font-mono text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400',
    className
  )}
>
  {@render children?.()}
</kbd>

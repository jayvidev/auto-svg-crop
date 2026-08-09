<script lang="ts">
  import { cn } from '@/utils/cn'
  import { highlightSvg } from '@/utils/shiki'

  interface Props {
    code: string
    class?: string
  }

  let { code, class: className }: Props = $props()

  let highlighted = $state('')

  $effect(() => {
    const current = code
    let cancelled = false

    highlightSvg(current)
      .then((html) => {
        if (!cancelled) highlighted = html
      })
      .catch(() => {
        if (!cancelled) highlighted = ''
      })

    return () => {
      cancelled = true
    }
  })
</script>

<div class={cn('shiki-block overflow-auto p-4 font-mono text-xs', className)}>
  {#if highlighted}
    {@html highlighted}
  {:else}
    <pre class="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{code}</pre>
  {/if}
</div>

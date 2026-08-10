<script lang="ts">
  import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui'
  import type { Snippet } from 'svelte'

  import { cn } from '@/utils/cn'

  interface Props {
    ref?: HTMLElement | null
    value?: string
    class?: string
    disabled?: boolean
    onValueChange?: (value: string) => void
    'aria-label'?: string
    children?: Snippet
  }

  let {
    ref = $bindable(null),
    value = $bindable(''),
    class: className,
    children,
    ...restProps
  }: Props = $props()
</script>

<ToggleGroupPrimitive.Root
  bind:ref
  bind:value
  type="single"
  data-slot="toggle-group"
  class={cn(
    'inline-flex h-9 items-center justify-center gap-1 rounded-md border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900',
    className
  )}
  {...restProps}
>
  {@render children?.()}
</ToggleGroupPrimitive.Root>

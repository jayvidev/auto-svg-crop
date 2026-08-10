<script lang="ts">
  import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui'

  import { cn } from '@/utils/cn'

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: ToggleGroupPrimitive.ItemProps = $props()
</script>

<ToggleGroupPrimitive.Item
  bind:ref
  data-slot="toggle-group-item"
  class={cn(
    'inline-flex cursor-pointer items-center justify-center size-7 shrink-0 rounded-sm text-sm font-medium transition-colors hover:bg-neutral-200 hover:text-black focus-visible:ring-1 focus-visible:ring-neutral-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-neutral-200 data-[state=on]:text-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-white dark:focus-visible:ring-neutral-700 dark:data-[state=on]:bg-neutral-800 dark:data-[state=on]:text-neutral-50',
    className
  )}
  {...restProps}
/>

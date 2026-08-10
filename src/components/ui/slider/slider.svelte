<script lang="ts">
  import { Slider as SliderPrimitive } from 'bits-ui'

  import { cn } from '@/utils/cn'

  interface Props {
    ref?: HTMLSpanElement | null
    value?: number
    min?: number
    max?: number
    step?: number
    disabled?: boolean
    class?: string
  }

  let {
    ref = $bindable(null),
    value = $bindable(0),
    class: className,
    ...restProps
  }: Props = $props()
</script>

<SliderPrimitive.Root
  bind:ref
  bind:value
  type="single"
  data-slot="slider"
  class={cn('relative flex w-full touch-none items-center select-none', className)}
  {...restProps}
>
  <span
    class="relative h-1 w-full grow overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
  >
    <SliderPrimitive.Range class="absolute h-full bg-neutral-900 dark:bg-neutral-100" />
  </span>
  <SliderPrimitive.Thumb
    index={0}
    class="block size-4 cursor-grab rounded-full border border-transparent bg-white shadow-sm ring-1 ring-neutral-300 transition-colors focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-900 dark:ring-neutral-600 dark:focus-visible:ring-neutral-500"
  />
</SliderPrimitive.Root>

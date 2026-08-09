<script lang="ts">
  import { mode } from 'mode-watcher'
  import { Toaster as Sonner, type ToasterProps as SonnerProps } from 'svelte-sonner'

  import { cn } from '@/utils/cn'

  let { ...restProps }: SonnerProps = $props()
</script>

<Sonner
  theme={mode.current}
  position="bottom-center"
  toastOptions={{
    unstyled: true,
    classes: {
      toast: cn(
        'w-full max-w-md',
        'flex items-center gap-3 p-3 sm:p-4 rounded-lg shadow-md font-sans',
        'bg-neutral-50 dark:bg-neutral-900',
        'border border-neutral-200 dark:border-neutral-800',
        'text-neutral-900 dark:text-neutral-100'
      ),
      title: 'text-sm font-medium sm:text-base',
      description: 'text-xs text-pretty text-neutral-600 sm:text-sm dark:text-neutral-400',
    },
  }}
  {...restProps}
/>

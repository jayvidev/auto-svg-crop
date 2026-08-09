<script lang="ts">
  import ScissorsIcon from '@lucide/svelte/icons/scissors'

  import Github from '@/components/logos/github.svelte'
  import ModeToggle from '@/components/modeToggle.svelte'
  import { buttonVariants } from '@/components/ui/button'
  import ExternalLink from '@/components/ui/links/external-link.svelte'
  import { Separator } from '@/components/ui/separator'
  import { cn } from '@/utils/cn'
</script>

<header
  class="sticky top-0 z-50 w-full bg-neutral-100 px-2 py-3 md:px-4 md:py-4 dark:bg-neutral-950"
>
  <nav class="mx-auto flex w-full max-w-6xl items-center justify-between">
    <a href="/" class="flex items-center space-x-2 font-medium">
      <ScissorsIcon size={20} strokeWidth={1.5} />
      <span>Auto SVG Crop</span>
    </a>
    <div class="flex h-5 items-center space-x-2.5">
      <ExternalLink
        href="https://github.com/jayvidev/auto-svg-crop"
        title="View on GitHub"
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'hover:bg-neutral-200 dark:hover:bg-neutral-800'
        )}
      >
        <Github size={18} />
      </ExternalLink>
      <Separator orientation="vertical" />
      <ModeToggle
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'relative hover:bg-neutral-200 dark:hover:bg-neutral-800'
        )}
      />
    </div>
  </nav>
</header>

<script lang="ts">
  import ScissorsIcon from '@lucide/svelte/icons/scissors'

  import GithubLink from '@/components/githubLink.svelte'
  import ModeToggle from '@/components/modeToggle.svelte'
  import { buttonVariants } from '@/components/ui/button'
  import { cn } from '@/utils/cn'
</script>

<header class="sticky top-0 z-50 w-full bg-neutral-100 py-3 md:py-4 dark:bg-neutral-950">
  <nav class="mx-auto flex w-full max-w-6xl items-center justify-between px-4">
    <a href="/" class="flex items-center space-x-2 text-base sm:text-lg font-medium tracking-tight">
      <ScissorsIcon size={20} strokeWidth={1.5} />
      <span>Auto SVG Crop</span>
    </a>
    <div class="flex h-5 items-center space-x-1">
      <GithubLink />
      <ModeToggle
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'relative hover:bg-neutral-200 dark:hover:bg-neutral-800'
        )}
      />
    </div>
  </nav>
</header>

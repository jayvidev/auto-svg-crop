<script lang="ts">
  // Providers:
  import { ModeWatcher } from 'mode-watcher'
  import type { Snippet } from 'svelte'

  // Layout:
  import Footer from '@/components/layout/footer.svelte'
  import Header from '@/components/layout/header.svelte'
  import Sonner from '@/components/ui/sonner/sonner.svelte'

  // Styles:
  import '@/styles/globals.css'

  let { children }: { children?: Snippet } = $props()
</script>

<div
  class="pointer-events-none fixed inset-0 -z-10 ambient-spotlight"
  aria-hidden="true"
></div>
<div
  class="pointer-events-none fixed inset-0 -z-10 bg-grid text-neutral-200 dark:text-neutral-800/60"
  aria-hidden="true"
></div>

<ModeWatcher />
<Sonner />
<Header />
<main class="mx-auto w-full max-w-6xl px-4">
  {@render children?.()}
</main>
<Footer />

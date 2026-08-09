<script lang="ts">
  // Providers:
  import { ModeWatcher } from 'mode-watcher'
  import type { Snippet } from 'svelte'

  // Layout:
  import Header from '@/components/layout/header.svelte'
  import Sonner from '@/components/ui/sonner/sonner.svelte'

  // Styles:
  import '@/styles/globals.css'

  let { children }: { children?: Snippet } = $props()
</script>

<ModeWatcher />
<Sonner />
<Header />
<main class="mx-auto w-full max-w-6xl px-4 pb-16">
  {@render children?.()}
</main>

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

<ModeWatcher />
<Sonner />
<div class="flex min-h-svh flex-col">
  <Header />
  <div class="flex flex-1 flex-col px-4 w-full">
    <main class="mx-auto flex w-full max-w-6xl flex-1 flex-col">
      {@render children?.()}
    </main>
  </div>
  <Footer />
</div>

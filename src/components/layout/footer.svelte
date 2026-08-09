<script lang="ts">
  import HeartIcon from '@lucide/svelte/icons/heart'

  import ExternalLink from '@/components/ui/links/external-link.svelte'
</script>

<footer class="w-full py-8">
  <div
    class="mx-auto flex w-full max-w-6xl items-center justify-center gap-1.5 px-4 text-sm text-neutral-500 dark:text-neutral-400"
  >
    <span>Built with</span>
    <HeartIcon size={14} strokeWidth={1.5} class="text-red-500" fill="currentColor" />
    <span>by</span>
    <ExternalLink
      href="https://github.com/jayvidev"
      title="jayvidev on GitHub"
      className="font-medium text-black underline-offset-4 hover:underline dark:text-white"
    >
      jayvidev
    </ExternalLink>
  </div>
</footer>

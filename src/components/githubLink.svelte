<script lang="ts">
  import { onMount } from 'svelte'

  import Github from '@/components/logos/github.svelte'
  import { buttonVariants } from '@/components/ui/button'
  import ExternalLink from '@/components/ui/links/external-link.svelte'
  import { globals } from '@/globals'
  import { cn } from '@/utils/cn'

  async function getGithubStarCount() {
    try {
      const res = await fetch(globals.apiGithub.url)
      const data = await res.json()
      return (data?.stargazers_count as number) ?? globals.apiGithub.fallback
    } catch (error) {
      console.error(error)
      return globals.apiGithub.fallback
    }
  }

  let stars = $state(globals.apiGithub.fallback)

  onMount(async () => {
    stars = await getGithubStarCount()
  })
</script>

<ExternalLink
  title={`View on GitHub (${stars.toLocaleString()} stars)`}
  href={globals.githubUrl}
  className={cn(
    buttonVariants({ variant: 'ghost' }),
    'w-fit gap-2 px-2.5 hover:bg-neutral-200 dark:hover:bg-neutral-800'
  )}
>
  <Github size={18} />
  {#if stars > 0}
    <span class="font-mono text-sm tracking-tight text-neutral-600 dark:text-neutral-400">
      {stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars.toLocaleString()}
    </span>
  {/if}
</ExternalLink>

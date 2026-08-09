<script lang="ts">
  import SvgCropper from '@/components/svgCropper.svelte'
</script>

<svelte:head>
  <title>Auto SVG Crop - Trim the empty space around your SVGs</title>
</svelte:head>

<section class="space-y-2 py-10 text-center sm:py-14">
  <h1 class="text-3xl font-medium tracking-tight text-balance sm:text-4xl">
    Trim the empty space around your SVGs
  </h1>
  <p class="text-neutral-500 text-pretty dark:text-neutral-400">
    Measures the real bounding box with
    <code class="font-mono">getBBox()</code> and rewrites the
    <code class="font-mono">viewBox</code> to fit the visible content.
  </p>
</section>

<SvgCropper />

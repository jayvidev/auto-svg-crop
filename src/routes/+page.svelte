<script lang="ts">
  import SvgCropper from '@/components/svgCropper.svelte'
</script>

<svelte:head>
  <title>Auto SVG Crop - Trim the empty space around your SVGs</title>
  <meta
    name="description"
    content="Trim the empty space around your SVGs automatically. Measures the real bounding box with getBBox() and rewrites the viewBox directly in your browser."
  />
  <meta property="og:title" content="Auto SVG Crop - Trim the empty space around your SVGs" />
  <meta
    property="og:description"
    content="Trim the empty space around your SVGs automatically. Measures the real bounding box with getBBox() and rewrites the viewBox directly in your browser."
  />
  <meta property="og:image" content="https://auto-svg-crop.jayvi.dev/images/readme.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Auto SVG Crop - Trim the empty space around your SVGs" />
  <meta
    name="twitter:description"
    content="Trim the empty space around your SVGs automatically. Measures the real bounding box with getBBox() and rewrites the viewBox directly in your browser."
  />
  <meta name="twitter:image" content="https://auto-svg-crop.jayvi.dev/images/readme.jpg" />
</svelte:head>

<SvgCropper />

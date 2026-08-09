<div align="center">
  <a href="https://auto-svg-crop.jayvi.dev">
    <img src="./static/images/readme.jpg" alt="Preview">
  </a>
  <p></p>
</div>

<div align="center">

![Svelte](https://img.shields.io/badge/SvelteKit-FF3E00?style=flat&logo=svelte&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white&style=flat)
![shadcn-svelte](https://img.shields.io/badge/shadcn--svelte-000000?style=flat&logo=shadcnui&logoColor=white)

</div>

## Auto SVG Crop

Trims the empty space around an SVG: it measures the real bounding box with
`getBBox()` and rewrites the `viewBox`. Everything runs in the browser, nothing
is uploaded.

- Drop a `.svg` anywhere on the page.
- Paste the code or the file with `⌘/Ctrl + V` anywhere.
- Or click the dropzone to browse for the file.
- Optional optimization with [SVGO](https://svgo.dev) (remembered in `localStorage`).
- Copy, download and before / after preview, with light and dark mode.

## Development

```bash
pnpm install
pnpm dev
```

| Command        | Description                    |
| -------------- | ------------------------------ |
| `pnpm dev`     | Development server (Vite).     |
| `pnpm build`   | Production build.              |
| `pnpm preview` | Preview the production build.  |
| `pnpm check`   | Type-check with `svelte-check`.|
| `pnpm lint`    | ESLint over `./src`.           |
| `pnpm format`  | Prettier over `./src`.         |

## Stack

SvelteKit 2 + Svelte 5, Tailwind CSS 4, [shadcn-svelte](https://shadcn-svelte.com)
components (bits-ui + tailwind-variants), `mode-watcher`, `svelte-sonner` and
`svgo`. Prettier, ESLint, Tailwind and the component library are aligned with
[svgl](https://github.com/pheralb/svgl).

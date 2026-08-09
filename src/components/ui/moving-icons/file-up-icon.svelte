<script lang="ts">
  interface Props {
    color?: string
    size?: number
    strokeWidth?: number
    isHovered?: boolean
    class?: string
  }

  let {
    color = 'currentColor',
    size = 24,
    strokeWidth = 2,
    isHovered = $bindable(false),
    class: className = '',
  }: Props = $props()

  function handleMouseEnter() {
    isHovered = true
  }

  function handleMouseLeave() {
    isHovered = false
  }
</script>

<div
  class={className}
  aria-label="file-up"
  role="img"
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
    class="file-up-icon"
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <g class="arrow" class:animate={isHovered}>
      <path d="M12 12v6" />
      <path d="m15 15-3-3-3 3" />
    </g>
  </svg>
</div>

<style>
  div {
    display: inline-block;
  }

  .file-up-icon {
    overflow: hidden;
  }

  .arrow {
    transform-origin: center;
  }

  .arrow.animate {
    animation: fileUpAnimation 1.2s ease-in-out infinite;
  }

  @keyframes fileUpAnimation {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    40% {
      transform: translateY(-30%);
      opacity: 0;
    }
    41% {
      transform: translateY(35%);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .arrow.animate {
      animation: none;
    }
  }
</style>

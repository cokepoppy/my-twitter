<template>
  <img
    :src="finalSrc"
    :alt="alt"
    class="rounded-full overflow-hidden select-none bg-gray-100"
    :style="{ width: sizePx, height: sizePx }"
    loading="lazy"
    decoding="async"
    referrerpolicy="no-referrer"
    crossorigin="anonymous"
    draggable="false"
    @error="onError"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  src?: string | null
  alt?: string
  size?: number // px
  styleName?: 'adventurer' | 'avataaars' | 'micah' | 'bottts'
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  alt: 'avatar',
  size: 48,
  styleName: 'adventurer',
})

const sizePx = computed(() => `${props.size}px`)

const dicebearUrl = computed(() => {
  const seed = encodeURIComponent((props.alt || 'avatar').toString())
  const size = Math.max(32, Math.min(480, Math.round(props.size)))
  return `https://api.dicebear.com/7.x/${props.styleName}/png?size=${size}&seed=${seed}`
})

const finalSrc = computed(() => props.src || dicebearUrl.value)

const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="100%" height="100%" rx="999" fill="#F2F4F7"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#98A2B3" font-family="Arial, sans-serif" font-size="12">avatar</text></svg>`)

function onError(e: Event) {
  const t = e.target as HTMLImageElement
  if (t && t.src !== FALLBACK) t.src = FALLBACK
}
</script>

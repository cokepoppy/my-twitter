<template>
  <component :is="src ? 'img' : 'div'"
             :src="src || undefined"
             :alt="alt"
             class="rounded-full bg-gray-200 overflow-hidden select-none"
             :style="{ width: sizePx, height: sizePx }">
    <svg v-if="!src" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="60" cy="60" r="60" fill="#EFF3F4"/>
      <circle cx="60" cy="48" r="22" fill="#AAB8C2"/>
      <path d="M20 102c6-22 25-34 40-34s34 12 40 34" fill="#AAB8C2"/>
    </svg>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  src?: string | null
  alt?: string
  size?: number // px
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  alt: 'avatar',
  size: 48,
})

const sizePx = computed(() => `${props.size}px`)
</script>


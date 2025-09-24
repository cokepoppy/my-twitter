<template>
  <!-- 1 image -->
  <div v-if="media.length === 1" class="mt-2 overflow-hidden rounded-2xl border border-[color:var(--twitter-border)]">
    <img :src="media[0]" alt="media" class="w-full h-auto max-h-[560px] object-cover"
         loading="lazy" referrerpolicy="no-referrer" crossorigin="anonymous" @error="onError($event)" />
  </div>

  <!-- 2 images -->
  <div v-else-if="media.length === 2" class="mt-2 grid grid-cols-2 gap-[2px] overflow-hidden rounded-2xl border border-[color:var(--twitter-border)]">
    <div v-for="(m, i) in media" :key="i" class="relative h-64 bg-black/5">
      <img :src="m" alt="media" class="absolute inset-0 w-full h-full object-cover"
           loading="lazy" referrerpolicy="no-referrer" crossorigin="anonymous" @error="onError($event)" />
    </div>
  </div>

  <!-- 3 images (tall left, two stacked right) -->
  <div v-else-if="media.length === 3" class="mt-2 grid grid-cols-2 grid-rows-2 gap-[2px] overflow-hidden rounded-2xl border border-[color:var(--twitter-border)] h-80">
    <div class="relative row-span-2 bg-black/5">
      <img :src="media[0]" alt="media" class="absolute inset-0 w-full h-full object-cover"
           loading="lazy" referrerpolicy="no-referrer" crossorigin="anonymous" @error="onError($event)" />
    </div>
    <div v-for="(m, i) in media.slice(1)" :key="i" class="relative bg-black/5">
      <img :src="m" alt="media" class="absolute inset-0 w-full h-full object-cover"
           loading="lazy" referrerpolicy="no-referrer" crossorigin="anonymous" @error="onError($event)" />
    </div>
  </div>

  <!-- 4 images (2x2) -->
  <div v-else-if="media.length >= 4" class="mt-2 grid grid-cols-2 grid-rows-2 gap-[2px] overflow-hidden rounded-2xl border border-[color:var(--twitter-border)] h-80">
    <div v-for="(m, i) in firstFour" :key="i" class="relative bg-black/5">
      <img :src="m" alt="media" class="absolute inset-0 w-full h-full object-cover"
           loading="lazy" referrerpolicy="no-referrer" crossorigin="anonymous" @error="onError($event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  media: string[]
}

const props = defineProps<Props>()

const firstFour = props.media.slice(0, 4)

const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#F2F4F7"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#98A2B3" font-family="Arial, sans-serif" font-size="24">image unavailable</text></svg>`)

function onError(e: Event) {
  const t = e.target as HTMLImageElement
  if (t && t.src !== FALLBACK) t.src = FALLBACK
}
</script>

<template>
  <!-- 1 image -->
  <div v-if="media.length === 1" class="mt-2 overflow-hidden rounded-2xl border border-[color:var(--twitter-border)]">
    <img :src="media[0]" alt="media" class="w-full h-auto max-h-[560px] object-cover" />
  </div>

  <!-- 2 images -->
  <div v-else-if="media.length === 2" class="mt-2 grid grid-cols-2 gap-[2px] overflow-hidden rounded-2xl border border-[color:var(--twitter-border)]">
    <div v-for="(m, i) in media" :key="i" class="relative h-64 bg-black/5">
      <img :src="m" alt="media" class="absolute inset-0 w-full h-full object-cover" />
    </div>
  </div>

  <!-- 3 images (tall left, two stacked right) -->
  <div v-else-if="media.length === 3" class="mt-2 grid grid-cols-2 grid-rows-2 gap-[2px] overflow-hidden rounded-2xl border border-[color:var(--twitter-border)] h-80">
    <div class="relative row-span-2 bg-black/5">
      <img :src="media[0]" alt="media" class="absolute inset-0 w-full h-full object-cover" />
    </div>
    <div v-for="(m, i) in media.slice(1)" :key="i" class="relative bg-black/5">
      <img :src="m" alt="media" class="absolute inset-0 w-full h-full object-cover" />
    </div>
  </div>

  <!-- 4 images (2x2) -->
  <div v-else-if="media.length >= 4" class="mt-2 grid grid-cols-2 grid-rows-2 gap-[2px] overflow-hidden rounded-2xl border border-[color:var(--twitter-border)] h-80">
    <div v-for="(m, i) in firstFour" :key="i" class="relative bg-black/5">
      <img :src="m" alt="media" class="absolute inset-0 w-full h-full object-cover" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  media: string[]
}

const props = defineProps<Props>()

const firstFour = props.media.slice(0, 4)
</script>


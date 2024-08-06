<template>
  <div
    :class="{ 'button-container': true, is_running: isRunning }"
    :style="{ transform: `translateX(${position}px)` }"
  >
    <div class="timeline"></div>

    <div class="marker">
      <div class="icon" v-if="isRunning">
        ▶
      </div>
      <div class="icon" v-else>
        ⏸
      </div>
      <div class="time">{{ paddedValue(minutes) }}:{{ paddedValue(seconds) }}</div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  position: Number,
  minutes: Number,
  seconds: Number,
  isRunning: Boolean 
})

const paddedValue = (v) => {
  return String(v).padStart(2, '0')
}

const emit = defineEmits(['toggleTimer'])

const emitToggleTimer = () => {
  emit('toggleTimer')
}
</script>

<style scoped>
.button-container {
  position: absolute;
  top: -100px;
  transition: transform 1s linear;
  cursor: pointer;
  border-color: gray;
  color: gray;
}

.button-container.is_running {
  color: #6CCB92;
}

.timeline {
  height: 100px;
  border-left: 2px dashed gray;
  pointer-events: none;
}

.is_running .timeline {
  border-color: #6CCB92;
  border-left-style: solid;
}


button {
  font-size: 1.5em;
  cursor: pointer;
}

.marker {
  border-radius: 10px;
}
.icon {
  display: inline-block;
}
.time {
  margin-left: 10px;
  display: inline-block;
  font-weight: bold;
}
</style>


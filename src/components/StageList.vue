<template>
  <div ref="stagesDiv" class="stages">
    <div
      v-for="(stage, index) in stages"
      :key="index"
      :style="{ width: stage.time * minToPx + 'px' }"
      :class="{ stage: true, current: index === currentStageIndex }"
    >
      <div contenteditable @keydown.enter.prevent="updateStageTime(index, $event)" @blur="updateStageTime(index, $event)" v-text="stage.time"></div>
      <div contenteditable @keydown.enter.prevent="updateStageText(index, $event)" @blur="updateStageText(index, $event)" v-text="stage.text"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, nextTick } from 'vue'

const props = defineProps({
  stages: {
    type: Array,
    required: true
  },
  timerId: {
    type: String,
    required: true
  },
  totalSeconds: {
    type: Number,
    required: true
  },
  saveStagesToDatabase: {
    type: Function,
    required: true
  },
  modelValue: {
    type: Number,
    required: true
  }

})


const emit = defineEmits(['update:modelValue'])


const stagesDiv = ref(null)
const stagesWidth = ref(props.modelValue)

const stages = ref([...props.stages])
const minToPx = 10

const currentStageIndex = computed(() => {
  let accumulatedTime = 0
  for (let i = 0; i < stages.value.length; i++) {
    accumulatedTime += stages.value[i].time * 60
    if (props.totalSeconds < accumulatedTime) {
      return i
    }
  }
  return stages.value.length - 1
})

const updateStageTime = async (index, event) => {
  const newValue = parseInt(event.target.innerText, 10)
  if (!isNaN(newValue)) {
    stages.value[index].time = newValue
    await props.saveStagesToDatabase(stages.value)
  }
}

const updateStageText = async (index, event) => {
  stages.value[index].text = event.target.innerText
  await props.saveStagesToDatabase(stages.value)
}

watchEffect(async () => {
  stages.value = [...props.stages]
  await nextTick()
  if (stagesDiv.value) {
    stagesWidth.value = stagesDiv.value.offsetWidth
    emit('update:modelValue', stagesWidth.value)
    
  }
})
</script>

<style scoped>
.stages {
  display: inline-flex;
  height: 100px;
}
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
  transition: background-color 0.5s ease;
  text-align: center;
}
.stage.current {
  background-color: #456;
}
.stage-time, .stage-text {
  padding: 5px;
}
.stage-time {
  color: lightgray;
  margin-right: 5px;
}
.stage-text {
  color: lightblue;
}
</style>


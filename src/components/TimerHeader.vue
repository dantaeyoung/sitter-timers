<template>
  <div class="header">
    <div class="personname" contenteditable @keydown.enter.prevent="savePersonName" @blur="savePersonName">{{ personname }}</div>
    <div class="roomname" contenteditable @keydown.enter.prevent="saveRoomName" @blur="saveRoomName">{{ roomname }}</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../supabase'

const props = defineProps({
  initialPersonname: {
    type: String,
    required: true
  },
  initialRoomname: {
    type: String,
    required: true
  },
  timerId: {
    type: String,
    required: true
  }
})

const personname = ref(props.initialPersonname)
const roomname = ref(props.initialRoomname)

const savePersonName = async (event) => {
  personname.value = event.target.innerText
  await savePersonRoomNamesToDatabase()
}

const saveRoomName = async (event) => {
  roomname.value = event.target.innerText
  await savePersonRoomNamesToDatabase()
}

const savePersonRoomNamesToDatabase = async () => {
  const { error } = await supabase
    .from('timers')
    .update({ roomname: roomname.value, personname: personname.value })
    .eq('id', props.timerId)
  if (error) {
    console.error('Error saving person or room name:', error)
  }
}

watch(() => props.initialPersonname, (newVal) => {
  personname.value = newVal
})

watch(() => props.initialRoomname, (newVal) => {
  roomname.value = newVal
})
</script>

<style scoped>
.header {}
.personname {
  color: white;
  font-weight: bold;
}
.roomname {
  color: white;
}
</style>


<template>
  <div>
    <h1>~ Timers For Sitters ~</h1>
    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>
    <div v-if="!loading && !error">
      <SitterTimer
        v-for="timer in timers"
        :key="timer.id"
        :timer="timer"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from './supabase'
import SitterTimer from './components/SitterTimer.vue'

const timers = ref([])
const loading = ref(true)
const error = ref(null)

const fetchTimers = async () => {
  const { data, error: fetchError } = await supabase.from('timers').select('*').order('id', { ascending: true })
  if (fetchError) {
    error.value = fetchError.message
  } else {
    timers.value = data
  }
  loading.value = false
}

const subscribeToChanges = () => {
  const subscription = supabase
    .channel('public:timers')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'timers' }, payload => {
      const updatedTimer = payload.new
      const index = timers.value.findIndex(timer => timer.id === updatedTimer.id)
      if (index !== -1) {
        timers.value[index] = updatedTimer
      }
    })
    .subscribe()
  
  return subscription
}

onMounted(async () => {
  await fetchTimers()
  subscribeToChanges()
})

onUnmounted(() => {
  supabase.removeAllChannels()
})
</script>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>


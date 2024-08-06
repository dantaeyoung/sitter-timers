<template>
    <div class="timer-container">

        <!--
        {{ isRunning }} j
        {{ stagesWidth }}
        {{ totalSeconds }}
        {{ maxSeconds }}
        {{ position }}
        {{ intervalId }} -->

        <button @click="restartTimer">restart</button>

        <TimerHeader
            :initialPersonname="personname"
            :initialRoomname="roomname"
            :timerId="String(props.timer.id)"
        />
        <StageList
            v-model="stagesWidth"
            :stages="stages"
            :timerId="String(props.timer.id)"
            :totalSeconds="totalSeconds"
            :saveStagesToDatabase="saveStagesToDatabase"
        />
        <div class="playpausetrack">
            <PlayPauseButton
                :minutes="minutes"
                :seconds="seconds"
                :position="position"
                :isRunning="isRunning"
                @click="toggleTimer"
            />
        </div>
    </div>
</template>

<script setup>
import {
    ref,
    computed,
    onMounted,
    onUnmounted,
    watchEffect,
    nextTick,
    watch,
} from "vue";
import PlayPauseButton from "./PlayPauseButton.vue";
import TimerHeader from "./TimerHeader.vue";
import StageList from "./StageList.vue";
import { supabase } from "../supabase";

const props = defineProps({
    timer: {
        type: Object,
        required: true,
    },
});

const stagesDiv = ref(null);
const stages = ref([...props.timer.stages]);
const roomname = ref(props.timer.roomname);
const personname = ref(props.timer.personname);
const isRunning = ref(false); // Initialize isRunning as false
const maxSeconds = computed(
    () => stages.value.reduce((acc, curr) => acc + curr.time, 0) * 60
);
const minToPx = 10;
const minutes = ref(0);
const seconds = ref(0);
const totalSeconds = ref(0);
const stagesWidth = ref(0);
const intervalId = ref(null);
const startTime = ref(new Date(props.timer.start_time).getTime());
const currentStageIndex = computed(() => {
    let accumulatedTime = 0;
    for (let i = 0; i < stages.value.length; i++) {
        accumulatedTime += stages.value[i].time * 60;
        if (totalSeconds.value < accumulatedTime) {
            return i;
        }
    }
    return stages.value.length - 1;
});

const paddedValue = (v) => String(v).padStart(2, "0");

const calculateElapsedTime = () => {
    if (startTime.value) {
        const now = new Date().getTime();
        totalSeconds.value = Math.floor((now - startTime.value) / 1000);
    }
};

const setupTimer = () => {
    minutes.value = Math.floor(totalSeconds.value / 60);
    seconds.value = totalSeconds.value % 60;
    if(isRunning.value) startTimer();
};

const restartTimer = () => {
    startTime.value = new Date().getTime();
    totalSeconds.value = 0;
    saveStartTimeToDatabase();
    setupTimer();
};

const startTimer = () => {
    console.log("startTimer");
    if (!startTime.value) {
        startTime.value = new Date().getTime();
        saveStartTimeToDatabase();
    }

    if (totalSeconds.value >= maxSeconds.value) {
        totalSeconds.value = 0;
    }

    console.log(isRunning.value);
    isRunning.value = true;
    console.log(isRunning.value);
    saveIsRunningToDatabase(true);

    if (!intervalId.value) {
        calculateElapsedTime();
        intervalId.value = setInterval(() => {
            calculateElapsedTime();
            minutes.value = Math.floor(totalSeconds.value / 60);
            seconds.value = totalSeconds.value % 60;
            //  if (totalSeconds.value >= maxSeconds.value) stopTimer()
        }, 1000);
    }
};

const stopTimer = () => {
    console.log("yo");
    if (intervalId.value) {
        clearInterval(intervalId.value);
        intervalId.value = null;
    }
    isRunning.value = false;
    saveIsRunningToDatabase(false);
};

const toggleTimer = () => {
    console.log("clicked");
    console.log(isRunning.value);
    isRunning.value ? stopTimer() : startTimer();
};

const position = computed(
    () => stagesWidth.value * (totalSeconds.value / maxSeconds.value)
);

const saveStagesToDatabase = async (updatedStages) => {
    const { error } = await supabase
        .from("timers")
        .update({ stages: updatedStages })
        .eq("id", props.timer.id);
    if (error) {
        console.error("Error saving stages:", error);
    } else {
        stages.value = updatedStages;
    }
};

const saveIsRunningToDatabase = async (isRunningStatus) => {
    const { error } = await supabase
        .from("timers")
        .update({ is_running: isRunningStatus })
        .eq("id", props.timer.id);
    if (error) {
        console.error("Error saving isRunning status:", error);
    }
};

const saveStartTimeToDatabase = async () => {
    const { error } = await supabase
        .from("timers")
        .update({ start_time: new Date(startTime.value).toISOString() })
        .eq("id", props.timer.id);
    if (error) {
        console.error("Error saving start time:", error);
    }
};

const fetchDataFromSupabase = async () => {
    const { data, error } = await supabase
        .from("timers")
        .select("*")
        .eq("id", String(props.timer.id))
        .single();
    if (error) {
        console.error("Error fetching timer data:", error);
    } else {
        console.log(data);
        stages.value = data.stages;
        roomname.value = data.roomname;
        personname.value = data.personname;
        isRunning.value = data.is_running;
        startTime.value = new Date(data.start_time).getTime();
        calculateElapsedTime();
    }
};

onMounted(async () => {
    await nextTick();
    await fetchDataFromSupabase();
    stagesWidth.value = stagesDiv.value ? stagesDiv.value.offsetWidth : 0;
    console.log(startTime.value);
    setupTimer();
});

onUnmounted(() => stopTimer());

watchEffect(() => {
    stages.value = [...props.timer.stages];
    roomname.value = props.timer.roomname;
    personname.value = props.timer.personname;
    startTime.value = new Date(props.timer.start_time).getTime();
    //if (isRunning.value) startTimer();
});

// Watch for changes in props.timer to ensure reactivity
watch(
    () => props.timer,
    (newTimer) => {
        stages.value = [...newTimer.stages];
        roomname.value = newTimer.roomname;
        personname.value = newTimer.personname;
        //  isRunning.value = newTimer.isRunning
        startTime.value = new Date(newTimer.start_time).getTime();
    },
    { deep: true }
);
</script>

<style scoped>
.timer-container {
    margin-bottom: 20px;
    padding: 10px;
}

.playpausetrack {
    width: 100%;
    position: relative;
    height: 50px;
}
</style>

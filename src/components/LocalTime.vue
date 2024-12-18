<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import sunIcon from '../assets/sun.svg';
import moonIcon from '../assets/moon.svg';


const currentTime = ref(new Date().toLocaleTimeString('en-US'));

let intervalId = null;

onMounted(() => {
    intervalId = setInterval(() => {
        currentTime.value = new Date().toLocaleTimeString('en-US');
    }, 1000);
});

onUnmounted(() => {
    clearInterval(intervalId);
});

const setTimeIcon = computed(() => {
    if (currentTime.value.includes('AM')) {
        return {
            src: sunIcon.src,
            alt: 'Sun icon',
        };
    } else {
        return {
            src: moonIcon.src,
            alt: 'Moon icon',
        };
    }
});
</script>

<template>
    <article class="bg-black text-accent rounded-32 w-fit px-20 py-10 h-fit inline-flex gap-10 break-inside-avoid">
        <time :datetime="currentTime">
            {{ currentTime }}
        </time>
        <img :src="setTimeIcon.src" :alt="setTimeIcon.alt" class="w-20 fill-accent">
    </article>
</template>

<script setup>
import { gsap } from "gsap";
import warning from "../assets/warning.svg";
import { ref } from "vue";

const buttonRef = ref(null);
const articlesVisible = ref(true);

const handleClick = () => {
    const articles = document.querySelectorAll("article");
    const links = document.querySelectorAll("[data-js='icon-button']");
    const backdrop = document.querySelector("[data-js='backdrop']");

    gsap.to([articles, links], {
        opacity: articlesVisible.value ? 0 : 1,
        stagger: {
            amount: 0.3,
            from: "random",
        },
    });

    backdrop.classList.toggle('backdrop-blur-sm')
    articlesVisible.value = !articlesVisible.value;
};
</script>


<template>
    <button ref="buttonRef" @click="handleClick"
        class="bg-black text-accent rounded-32 w-fit p-10 h-fit inline-flex gap-10 break-inside-avoid active:scale-95 [&>img]:w-20 max-lg:hidden">
        <img :src="warning.src" alt="warning" />
    </button>
</template>
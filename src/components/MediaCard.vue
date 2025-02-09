<script setup>
import link from '../assets/link.svg';

defineProps({
    className: String,
    type: String,
    href: String,
    title: String,
    src: String,
    srcAlt: String,
    previewSrc: String,
    previewAlt: String
});

const loadIframe = (e) => {
    const iframe = e.target.querySelector('iframe')

    if (!iframe.src) {
        const previewImg = e.target.querySelector('.preview-img')

        iframe.src = iframe.dataset.src

        iframe.onload = () => {
            previewImg.style.display = 'none'
        }
    }

}
</script>

<template>
    <article @mouseenter="loadIframe"
        :class="[className, 'break-inside-avoid bg-darkgray rounded-[.75rem] overflow-hidden inline-flex my-5 group relative']">
        <template v-if="type === 'iframe'">
            <img v-if="previewSrc" :src="previewSrc" :alt="previewAlt" loading="lazy"
                class="preview-img w-full absolute left-0 top-0 h-full z-50 object-cover" />
            <iframe v-if="previewSrc" :data-src="src" :title="title" loading="lazy"
                class="w-full overflow-hidden"></iframe>
            <iframe v-if="!previewSrc" :src="src" :title="title" loading="lazy" class="w-full overflow-hidden"></iframe>
        </template>
        <template v-else-if="type === 'img'">
            <img :src="src" :alt="srcAlt" loading="lazy" class="w-full object-cover" />
        </template>
        <template v-if="href">
            <a :href="href" target="_blank" rel="noopener noreferrer"
                class="bg-black text-accent rounded-[.75rem] w-fit p-10 h-fit inline-flex gap-10 active:scale-95 [&>img]:w-20 group-hover:bottom-20 group-hover:opacity-100 opacity-0 absolute bottom-0 right-20 ease-in-out duration-300 z-[51]">
                <img :src="link.src" alt="External link icon" />
            </a>
        </template>
    </article>
</template>

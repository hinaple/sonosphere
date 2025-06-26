<script>
import { onMount } from "svelte";
import Landing from "./Landing.svelte";
import "./lib/socket";
import { connected } from "./lib/socket";
import Editor from "./components/Editor.svelte";
import ContextMenu from "./lib/ContextMenu.svelte";

let showLanding = $state(true);
let isConnected = $state(false);
let landingTimeOver = false;
connected.subscribe((c) => {
    isConnected = c;
    if (!landingTimeOver) return;
    if (c && !showLanding) showLanding = false;
});

onMount(() => {
    setTimeout(() => {
        landingTimeOver = true;
        if (!isConnected) return;
        showLanding = false;
    }, 3000);
});

window.addEventListener("contextmenu", (evt) => evt.preventDefault());
</script>

<ContextMenu />
{#if showLanding}
    <Landing />
{/if}
<Editor />

<style>
</style>

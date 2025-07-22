<script>
import { onMount } from "svelte";
import Landing from "./Landing.svelte";
import "./lib/socket";
import "./lib/globalKey";
import { connected } from "./lib/socket";
import Editor from "./components/Editor.svelte";
import ContextMenu from "./lib/ContextMenu.svelte";
import Dragging from "./lib/Dragging.svelte";

let showLanding = $state(true);
let isConnected = $state(false);
let neverConnected = $state(true);
let landingTimeOver = false;
connected.subscribe((c) => {
    isConnected = c;
    if (c) neverConnected = false;
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

<Dragging />
<ContextMenu />
{#if showLanding}
    <Landing />
{/if}
{#if !neverConnected}
    <Editor />
{/if}

<style>
</style>

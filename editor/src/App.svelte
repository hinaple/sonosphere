<script>
import { onMount } from "svelte";
import Landing from "./Landing.svelte";
import "./lib/socket";
import { connected } from "./lib/socket";

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
</script>

{#if showLanding}
    <Landing />
{/if}

<style>
</style>

<script>
    import { tick } from "svelte";
    import { draggingThing, registerNode } from "./draggable";
    import { fade } from "svelte/transition";
    import Svg from "./Svg.svelte";
    import Colors from "./colors.json";

    let dragging = $state(null);
    let el = $state(null);
    draggingThing.subscribe((dt) => {
        dragging = dt;
    });
    $effect(() => {
        if (!el) return;
        registerNode(el);
    });
</script>

{#if dragging}
    <div class="dragging" bind:this={el} transition:fade={{ duration: 100 }}>
        {#if dragging.type === "soundFile"}
            <div class="sound-file">{dragging.data.filename}</div>
        {:else if dragging.type === "segment"}
            <div class="segment">
                <span>
                    {dragging.data.url}
                </span>

                <Svg
                    type={dragging.data.loop ? "loop" : "noloop"}
                    color={Colors.white}
                />
            </div>
        {:else if dragging.type === "sequence"}
            <div class="sequence">
                {dragging.data.alias}
            </div>
        {/if}
    </div>
{/if}

<style>
    .dragging {
        position: fixed;
        z-index: 30;
        pointer-events: none;
        opacity: 0.7;
        transform: translate(calc(-100% + 10px), calc(-100% + 10px));
        width: fit-content;
        height: fit-content;
        overflow: visible;
        white-space: pre;
    }
    .sound-file {
        background-color: var(--theme-dark);
        color: #fff;
        padding: 5px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: var(--semi-bold);
    }
    .segment {
        height: 30px;
        display: flex;
        gap: 5px;
        flex-direction: row;
        background-color: var(--theme-dark);
        color: var(--white);
        padding-inline: 10px;
        border-radius: 10px;
        font-size: 16px;
        font-weight: var(--semi-bold);
        align-items: center;
        flex-wrap: nowrap;
        transition: opacity 100ms;
    }
    .sequence {
        font-size: 20px;
        font-weight: var(--semi-bold);
        color: var(--theme-dark);
        background-color: var(--white);
        height: 50px;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding-inline: 20px;
        min-width: 200px;
        border-block: solid var(--theme-dark) 2px;
    }
</style>

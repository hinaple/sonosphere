<script>
    import { fade } from "svelte/transition";
    import { getSoundFileUrl } from "../utils";
    import { playingSound, stopPlayingSound } from "./localSoundPlay.svelte";
    import Svg from "../Svg.svelte";
    import Colors from "../colors.json";

    let audioEl = $state();

    $effect(() => {
        if (audioEl) audioEl.focus();
    });

    function onkeydown(evt) {
        if (evt.key === "Escape") stopPlayingSound();
    }
</script>

{#if playingSound.soundName}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="sound-player"
        transition:fade={{ duration: 200 }}
        onclick={() => audioEl.focus?.()}
    >
        <div class="info">
            <div class="sound-name">{playingSound.soundName}</div>
            <button
                class="svg"
                onclick={(evt) => {
                    evt.stopPropagation();
                    stopPlayingSound();
                }}
            >
                <Svg type="close" color={Colors.white} />
            </button>
        </div>
        {#key playingSound.soundName}
            <audio
                bind:this={audioEl}
                src={getSoundFileUrl(playingSound.soundName)}
                autoplay
                controls
                onended={stopPlayingSound}
                {onkeydown}
            ></audio>
        {/key}
    </div>
{/if}

<style>
    .sound-player {
        z-index: 9;
        width: 400px;
        height: fit-content;
        position: fixed;
        right: 35px;
        bottom: 30px;
        box-sizing: border-box;
        padding: 10px;
        padding-top: 5px;
        border-radius: 20px;
        background-color: var(--theme-light);
        box-shadow: rgba(0, 0, 0, 0.5) 0 5px 10px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        border: solid transparent 2px;
    }
    .sound-player:has(audio:focus) {
        border-color: var(--theme-feedback);
    }
    .info {
        width: 100%;
        flex: 0 0 auto;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        color: var(--white);
        padding-left: 10px;
        box-sizing: border-box;
    }
    button {
        width: 30px;
        height: 30px;
        border-radius: 50%;
    }
    button:hover {
        background-color: rgba(0, 0, 0, 0.2);
    }
    audio {
        width: 100%;
        display: block;
    }
</style>

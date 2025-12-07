<script>
    import { fade } from "svelte/transition";
    import { getSoundFileUrl } from "../utils";
    import { playingSound, stopPlayingSound } from "./localSoundPlay.svelte";
    import Svg from "../Svg.svelte";
    import Colors from "../colors.json";
</script>

{#if playingSound.soundName}
    <div class="sound-player" transition:fade={{ duration: 200 }}>
        <div class="info">
            <div class="sound-name">{playingSound.soundName}</div>
            <button class="svg" onclick={stopPlayingSound}>
                <Svg type="close" color={Colors.white} />
            </button>
        </div>
        <audio
            src={getSoundFileUrl(playingSound.soundName)}
            autoplay
            controls
            onended={stopPlayingSound}
        ></audio>
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
        border-radius: 20px;
        background-color: var(--theme-light);
        box-shadow: rgba(0, 0, 0, 0.5) 0 5px 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .info {
        width: 100%;
        flex: 0 0 auto;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        color: var(--white);
        padding-inline: 10px 3px;
        box-sizing: border-box;
    }
    button {
        width: 20px;
        height: 20px;
    }
    audio {
        width: 100%;
        display: block;
    }
</style>

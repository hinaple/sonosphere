<script>
    import { get } from "svelte/store";
    import LOGO from "../assets/logo_typo.svg";
    import Chains from "./Chains.svelte";
    import Sequences from "./Sequences.svelte";
    import Sounds from "./Sounds.svelte";
    import { unsaved } from "../lib/stores";
    import { broadcast, playSequence } from "../lib/socket";
    import SoundPlayer from "../lib/localSoundPlay/SoundPlayer.svelte";

    const rightBlockTabs = {
        sequences: Sequences,
        chains: Chains,
    };

    let currentBlock = $state("sequences");
    let RightBlock = $derived(rightBlockTabs[currentBlock]);

    function selectTab(tab) {
        currentBlock = tab;
    }

    let broadcastEvt = $state("");
    function boradcastKeyDown(evt) {
        if (evt.key === "Enter" && broadcastEvt) {
            (evt.ctrlKey ? playSequence : broadcast)(broadcastEvt);
            broadcastEvt = "";
        }
    }
</script>

<SoundPlayer />
<div class="blocks column editor">
    <div class="blocks header">
        <div class="block logo">
            <img src={LOGO} alt="sonosphere" />
        </div>
        <div class="block fill tabs">
            {#each Object.keys(rightBlockTabs) as tab}
                <button
                    class={["tab", tab === currentBlock && "current"]}
                    onclick={() => selectTab(tab)}>{tab}</button
                >
            {/each}
            <input
                type="text"
                class="broadcast"
                bind:value={broadcastEvt}
                onkeydown={boradcastKeyDown}
                placeholder="broadcast"
            />
        </div>
    </div>
    <div class="blocks fill body">
        <Sounds />
        <RightBlock />
    </div>
</div>

<style>
    .editor {
        width: 100%;
        height: 100%;
        padding: 20px;
        overflow: hidden;
    }
    .header {
        height: 50px;
        display: flex;
        flex-direction: row;
    }
    .logo {
        padding: 15px;
    }
    .logo > img {
        height: 100%;
        width: auto;
        transform: translateY(3px);
    }
    .body {
        overflow: hidden;
    }
    .tabs {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        padding-inline: 10px;
        box-sizing: border-box;
    }
    .tabs > button {
        font-size: 18px;
        font-weight: var(--semi-bold);
        padding: 5px 15px;
        border-radius: 10px;
        color: var(--theme-dark);
    }
    .tabs > button:hover,
    .tabs > button:focus {
        background-color: var(--theme-feedback);
    }
    .tabs > .current {
        background-color: var(--theme-light) !important;
        color: var(--white);
    }

    .broadcast {
        margin-left: auto;
        border: solid var(--theme-dark) 2px;
        font-size: 18px;
        width: 200px;
        border-radius: 5px;
        padding-inline: 5px;
        background-color: var(--white);
    }
</style>

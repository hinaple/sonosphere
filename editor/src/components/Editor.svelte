<script>
import LOGO from "../assets/logo_typo.svg";
import Chains from "./Chains.svelte";
import Sequences from "./Sequences.svelte";
import Sounds from "./Sounds.svelte";

const rightBlockTabs = {
    sequences: Sequences,
    chains: Chains
}

let currentBlock = $state("sequences");
let RightBlock = $derived(rightBlockTabs[currentBlock]);
</script>

<div class="blocks column editor">
    <div class="blocks header">
        <div class="block logo">
            <img src={LOGO} alt="sonosphere" />
        </div>
        <div class="block fill tabs">
            {#each Object.keys(rightBlockTabs) as tab}
                <button class={["tab", tab === currentBlock && "current"]} onclick={() => currentBlock = tab}>{tab}</button>
            {/each}
        </div>
    </div>
    <div class="blocks fill body">
        <Sounds />
        <RightBlock/>
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
.tabs > button:hover, .tabs > button:focus  {
    background-color: var(--theme-feedback);
}
.tabs > .current {
    background-color: var(--theme-dark) !important;
    color: var(--white);
}
</style>

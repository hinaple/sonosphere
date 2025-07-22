<script>
import SequenceWorks from "../lib/sequenceWorks";
import SequenceWorkOpt from "./SequenceWorkOpt.svelte";

let { opts = SequenceWorks, select } = $props();
let myOpt = $state(null);
</script>

<div class={["options", myOpt && "not-last"]}>
    {#each Object.keys(opts) as opt}
        {#if opt !== "options"}
            <button
                class={["opt", opt === myOpt && "selected"]}
                onclick={() => {
                    if (opts[opt].options) myOpt = opt;
                    else select([opt], opts[opt]);
                }}>{opt}</button
            >
        {/if}
    {/each}
</div>
{#if myOpt}
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="21"
        height="12"
        viewBox="0 0 21 12"
        fill="none"
    >
        <path
            d="M1 1L10.5 10.5L20 1"
            stroke="#E4E4E4"
            stroke-width="2"
            stroke-linecap="round"
        />
    </svg>
    {#key myOpt}
        <SequenceWorkOpt
            opts={opts[myOpt]}
            select={(arr, obj) => select([myOpt, ...arr], obj)}
        />
    {/key}
{/if}

<style>
.options {
    max-width: 170px;
    padding: 3px 5px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 5px;
    justify-content: center;
}
.opt {
    padding: 2px 4px;
    background-color: var(--white);
    font-size: 16px;
    color: var(--theme-dark);
    font-weight: var(--semi-bold);
    border-radius: 5px;
}
.opt:hover {
    background-color: var(--theme-feedback);
}
.opt.selected {
    background-color: var(--theme-dark);
    color: var(--white);
}
</style>

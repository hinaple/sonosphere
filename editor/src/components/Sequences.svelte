<script>
import { get } from "svelte/store";
import { block } from "../lib/blockManager";
import { sequences, unsaved } from "../lib/stores";
import Svg from "../lib/Svg.svelte";
import { tick } from "svelte";
import Sequence from "./Sequence.svelte";

let seqArr = $state(get(sequences));

let seqListEl;
async function addSequence() {
    let tempAliasNum;
    for (
        tempAliasNum = seqArr.length;
        seqArr.some(([alias]) => alias.trim() === `sequence${tempAliasNum}`);
        tempAliasNum++
    );
    seqArr.push([
        `sequence${tempAliasNum}`,
        { autoLoad: true, works: [], folded: false },
    ]);
    editted();
    await tick();
    seqListEl.scrollTo({ top: seqListEl.scrollHeight, behavior: "smooth" });
}

function setAlias(idx, newAlias) {
    newAlias = newAlias.trim();
    if (!newAlias.length) return;
    let addNum;
    for (
        addNum = 0;
        seqArr.some(
            ([alias], i) =>
                i !== idx && alias === newAlias + (addNum ? `(${addNum})` : "")
        );
        addNum++
    );
    const final = newAlias + (addNum ? `(${addNum})` : "");
    seqArr[idx][0] = final;
    editted();
    return final;
}

function editted() {
    unsaved.set(true);
    sequences.set(seqArr);
}

function removeSequence(idx) {
    seqArr.splice(idx, 1);
    editted();
}
</script>

<div class="block fill sequences" use:block={{ name: "sequences" }}>
    <div class="toolbar">
        <div class="title">Sequences</div>
        <button onclick={addSequence}>
            <Svg type="plus" color="#fff" />
        </button>
    </div>
    <div class="sequences-list" bind:this={seqListEl}>
        {#each seqArr as seq, idx}
            <Sequence
                alias={seq[0]}
                data={seq[1]}
                setAlias={(newAlias) => setAlias(idx, newAlias)}
                {editted}
                remove={() => removeSequence(idx)}
            />
        {/each}
    </div>
</div>

<style>
.sequences {
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
}
.sequences-list {
    height: 100%;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow-y: scroll;
}
</style>

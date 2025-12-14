<script>
import { block } from "../lib/blockManager";
import { reset, showContextmenu } from "../lib/contextmenu";
import { chains, unsaved } from "../lib/stores";
import Svg from "../lib/Svg.svelte";
import Chain from "./Chain.svelte";
import { get } from "svelte/store";
import { tick } from "svelte";
import { autoscroller } from "../lib/draggable";

let chainArr = $state(get(chains));

let chainListEl;
async function addChain() {
    let tempAliasNum;
    for (
        tempAliasNum = chainArr.length;
        chainArr.some(([alias]) => alias.trim() === `chain${tempAliasNum}`);
        tempAliasNum++
    );
    chainArr.push([`chain${tempAliasNum}`, []]);
    editted();
    await tick();
    chainListEl.scrollTo({
        top: chainListEl.scrollHeight,
        behavior: "smooth",
    });
}

function editted() {
    unsaved.set(true);
    chains.set(chainArr);
}

function setAlias(idx, newAlias) {
    newAlias = newAlias.trim();
    if (!newAlias.length) return;
    let addNum;
    for (
        addNum = 0;
        chainArr.some(
            ([alias], i) =>
                i !== idx && alias === newAlias + (addNum ? `(${addNum})` : "")
        );
        addNum++
    );
    const final = newAlias + (addNum ? `(${addNum})` : "");
    chainArr[idx][0] = final;
    editted();
    return final;
}
function setSegments(idx, newSegments) {
    chainArr[idx][1] = newSegments;
    editted();
}

function removeChain(idx) {
    chainArr = chainArr.toSpliced(idx, 1);
    editted();
}
function chainContextMenu(idx, evt) {
    if (evt.target.tagName === "INPUT") return;
    showContextmenu(
        [
            {
                label: "delete",
                cb: async () => {
                    removeChain(idx);
                    return true;
                },
            },
        ],
        evt,
        "chain"
    );
}
</script>

<div class="block fill chain" use:block={{ name: "chains" }}>
    <div class="toolbar">
        <div class="title">Chains</div>
        <button onclick={addChain}>
            <Svg type="plus" color="#fff" />
        </button>
    </div>
    <div
        class="chains-list"
        bind:this={chainListEl}
        onscroll={() => reset("chain")}
        use:autoscroller={{ scroll: { y: { detectSize: 10 } } }}
    >
        {#each chainArr as [alias, segmentsArr], idx}
            <Chain
                {alias}
                {segmentsArr}
                setAlias={(newAlias) => setAlias(idx, newAlias)}
                setSegments={(newSegments) => setSegments(idx, newSegments)}
                {editted}
                oncontextmenu={(evt) => chainContextMenu(idx, evt)}
            />
        {/each}
    </div>
</div>

<style>
.chain {
    display: flex;
    flex-direction: column;
}
.chains-list {
    height: 100%;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    padding: 20px 10px 20px 20px;
    box-sizing: border-box;
    overflow-y: scroll;
    gap: 20px;
}
</style>

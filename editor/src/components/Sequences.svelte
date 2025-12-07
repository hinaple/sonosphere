<script>
    import { get } from "svelte/store";
    import { block } from "../lib/blockManager";
    import { sequences, unsaved } from "../lib/stores";
    import Svg from "../lib/Svg.svelte";
    import { tick } from "svelte";
    import Sequence from "./Sequence.svelte";
    import Colors from "../lib/colors.json";

    let seqArr = $state(get(sequences));

    let seqElsArr = $state([]);
    function seqsLengthChanged() {
        seqElsArr = new Array(seqArr.length).fill(null);
    }
    seqsLengthChanged();

    let seqListEl;
    function insertSequence(before, alias, data) {
        seqArr.splice(before, 0, [alias, data]);
        editted();
    }
    async function addSequence() {
        let tempAliasNum;
        for (
            tempAliasNum = seqArr.length;
            seqArr.some(
                ([alias]) => alias.trim() === `sequence${tempAliasNum}`
            );
            tempAliasNum++
        );
        seqArr.push([
            `sequence${tempAliasNum}`,
            { autoLoad: true, works: [], folded: false },
        ]);
        seqsLengthChanged();
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
                    i !== idx &&
                    alias === newAlias + (addNum ? `(${addNum})` : "")
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
        seqsLengthChanged();
        editted();
    }

    let searchStr = $state();
    let searchedSequenceIdxs = $state([]);
    let searchingIdx = $state(0);
    function searchInputHandler() {
        searchedSequenceIdxs = [];
        if (!searchStr) return;
        for (let i = 0; i < seqArr.length; i++) {
            if (seqArr[i][0].toLowerCase().includes(searchStr.toLowerCase()))
                searchedSequenceIdxs.push(i);
        }
        scrollToSearchedSequence();
    }
    function searchKeyDown(evt) {
        if (evt.key === "Enter") scrollToSearchedSequence(searchingIdx + 1);
    }
    function scrollToSearchedSequence(idx = 0) {
        if (
            !searchedSequenceIdxs.length ||
            idx >= searchedSequenceIdxs.length
        ) {
            searchingIdx = 0;
            return;
        }
        searchingIdx = idx;
        seqElsArr[searchedSequenceIdxs[idx]]?.scrollIntoView?.({
            behavior: "smooth",
            block: "center",
        });
    }

    let searchInputEl;
</script>

<div
    class="block fill sequences"
    use:block={{
        name: "sequences",
        jobs: {
            search: () => {
                searchInputEl.focus?.();
                searchInputEl.select?.();
            },
        },
    }}
>
    <div class="toolbar">
        <div class="title">Sequences</div>
        <div class="search-box">
            <input
                bind:this={searchInputEl}
                type="text"
                placeholder="Search"
                bind:value={searchStr}
                oninput={searchInputHandler}
                onkeydown={searchKeyDown}
            />
            {#if searchStr}
                <span class="search-index">
                    {searchingIdx} / {searchedSequenceIdxs.length}
                </span>
                <button
                    class={[
                        "svg search-index-button up",
                        searchingIdx <= 0 && "disabled",
                    ]}
                >
                    <Svg type="right" color={Colors.dark} />
                </button>
                <button
                    class={[
                        "svg search-index-button down",
                        searchingIdx + 1 >= searchedSequenceIdxs.length &&
                            "disabled",
                    ]}
                >
                    <Svg type="right" color={Colors.dark} />
                </button>
            {/if}
        </div>
        <button onclick={() => addSequence()}>
            <Svg type="plus" color="#fff" />
        </button>
    </div>
    <!-- <div class="search-bar"> -->
    <!-- </div> -->
    <div class="sequences-list" bind:this={seqListEl}>
        {#each seqArr as seq, idx}
            <Sequence
                bind:el={seqElsArr[idx]}
                alias={seq[0]}
                bind:data={seq[1]}
                searched={searchedSequenceIdxs.includes(idx)}
                setAlias={(newAlias) => setAlias(idx, newAlias)}
                {editted}
                remove={() => removeSequence(idx)}
                dropHere={({ alias, data }) => insertSequence(idx, alias, data)}
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
    .search-box {
        flex: 1 1 auto;
        background-color: var(--white);
        max-width: 300px;
        box-sizing: border-box;
        border-radius: 10px;
        height: 30px;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding-right: 8px;
        color: var(--theme-dark);
    }
    .search-box:has(input:focus) {
        outline: solid var(--theme-dark) 2px;
    }
    .search-box > input {
        border: none;
        color: var(--theme-dark);
        font-weight: var(--regular);
        font-size: 16px;
        background-color: transparent;
        padding: 0;
        padding-left: 10px;
        height: 100%;
        flex: 1 1 auto;
        width: 10px;
    }
    .search-box > input:focus {
        outline: none;
    }
    .search-index {
        font-size: 14px;
        flex: 0 0 auto;
        margin-right: 5px;
    }
    .search-index-button {
        cursor: pointer;
        width: 20px;
        height: 100%;
        flex: 0 0 auto;

        :global(svg) {
            width: 8px;
            height: 100%;
        }
    }
    .search-index-button.disabled {
        pointer-events: none;
        opacity: 0.3;
    }
    .search-index-button.up > :global(svg) {
        transform: rotate(-90deg);
    }
    .search-index-button.down > :global(svg) {
        transform: rotate(90deg);
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

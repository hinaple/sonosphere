<script>
    import Svg from "../lib/Svg.svelte";
    import ChainSegment from "./ChainSegment.svelte";
    import Colors from "../lib/colors.json";
    import { dropzone } from "../lib/draggable";
    import { showContextmenu } from "../lib/contextmenu";

    let { alias, segmentsArr, setAlias, setSegments, editted, ...props } =
        $props();

    let readyToDropAt = $state(-1);

    function hoverStartAt(idx) {
        readyToDropAt = idx;
    }
    function hoverEnd() {
        readyToDropAt = -1;
    }
    function dropped(idx, data) {
        const target =
            data.type === "segment"
                ? data.data
                : { url: data.data.filename, loop: false, when: "afterLoop" };
        let newSegments;
        if (idx === segmentsArr.length) newSegments = [...segmentsArr, target];
        else newSegments = segmentsArr.toSpliced(idx, 0, target);
        setSegments(newSegments);
        readyToDropAt = -1;
    }

    function removeSegment(idx) {
        setSegments(segmentsArr.toSpliced(idx, 1));
    }

    function segmentContextMenu(idx, evt) {
        evt.stopPropagation();
        evt.preventDefault();
        showContextmenu(
            [
                {
                    label: "delete",
                    cb: async () => {
                        removeSegment(idx);
                        return true;
                    },
                },
            ],
            evt,
            "chain"
        );
    }
</script>

<button class="chain" {...props}>
    <div class="head">
        <input
            type="text"
            class="name"
            value={alias}
            onblur={(evt) => {
                if (!evt.target?.value?.length) evt.target.value = alias;
                else evt.target.value = setAlias(evt.target?.value ?? "chain");
            }}
            onkeydown={(evt) => {
                if (evt.key === "Enter" || evt.key === "Escape")
                    evt.target.blur?.();
            }}
        />
    </div>
    <div class="segments">
        <div class="start-point">
            <Svg type="right" color={Colors.dark} />
        </div>
        <div class="segments-list">
            {#each segmentsArr as seg, idx}
                <div
                    class={[
                        "segment",
                        seg.loop && "loop",
                        !idx && "first",
                        idx && segmentsArr[idx - 1].loop && "after-loop",
                    ]}
                    use:dropzone={{ accepts: ["soundFile", "segment"] }}
                    onhoverstart={() => hoverStartAt(idx)}
                    onhoverend={hoverEnd}
                    onhoverdrop={({ detail }) => dropped(idx, detail)}
                >
                    {#if readyToDropAt === idx}
                        <div class="drop-guide"></div>
                    {/if}
                    <ChainSegment
                        {seg}
                        isFirst={!idx}
                        afterLoop={idx &&
                            segmentsArr[idx - 1].loop &&
                            "after-loop"}
                        {editted}
                        remove={() => removeSegment(idx)}
                        oncontextmenu={(evt) => segmentContextMenu(idx, evt)}
                    />
                </div>
                {#if seg.loop}
                    <div class="loop-space"></div>
                {/if}
            {/each}
            {#if readyToDropAt === segmentsArr.length}
                <div class="drop-guide last"></div>
            {/if}
            <div
                class="dummy-zone"
                use:dropzone={{ accepts: ["soundFile", "segment"] }}
                onhoverstart={() => hoverStartAt(segmentsArr.length)}
                onhoverend={hoverEnd}
                onhoverdrop={({ detail }) =>
                    dropped(segmentsArr.length, detail)}
            ></div>
        </div>
    </div>
</button>

<style>
    .chain {
        border-radius: 10px;
        border: 2px solid var(--theme-dark, #004f51);
        background: var(--white, #e4e4e4);
        padding: 10px 15px 15px 15px;
        gap: 10px;
        display: flex;
        flex-direction: column;
        gap: 7px;
        cursor: default;
    }
    .chain:focus {
        outline: solid var(--theme-dark) 4px;
        outline-offset: -4px;
    }
    .head {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .name {
        background: none;
        border: none;
        font-size: 24px;
        color: var(--theme-dark);
        font-weight: var(--semi-bold);
        width: 100%;
    }
    .name:focus {
        outline: none;
        font-weight: var(--bold);
    }
    .start-point {
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .segments {
        display: flex;
        flex-direction: row;
        min-height: 30px;
        gap: 20px;
        padding-left: 5px;
        position: relative;
        width: 100%;
    }
    .segments-list {
        display: flex;
        flex-direction: row;
        position: relative;
        flex: 1 1 auto;
        height: 100%;
        flex-wrap: wrap;
        align-items: center;
        row-gap: 5px;
    }
    .drop-guide {
        margin-inline: 3px;
        width: 3px;
        height: 30px;
        background-color: var(--theme-light);
    }
    .drop-guide.last {
        margin-left: 8px;
    }
    .dummy-zone {
        flex: 1 0 auto;
        min-width: 50px;
        height: 30px;
    }
    .segment {
        justify-content: start;
        display: flex;
        flex-direction: row;
        align-items: center;
        flex: 0 0 auto;
    }
    .segment.after-loop {
        margin-left: -15px;
    }
    .segment.first {
        margin-left: -10px;
    }
    .loop-space {
        margin-left: -10px;
        width: 100%;
        flex: 1 0 auto;
        height: 0;
        border-bottom: dashed 2px var(--theme-light);
    }
</style>

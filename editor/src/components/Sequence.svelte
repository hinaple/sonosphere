<script>
import { tick } from "svelte";
import Svg from "../lib/Svg.svelte";
import Colors from "../lib/colors.json";
import outclick from "../lib/outclick";
import SequenceWork from "./SequenceWork.svelte";
import SequenceWorkOpt from "./SequenceWorkOpt.svelte";
import { showContextmenu } from "../lib/contextmenu";
import { executeSequence, playSequence } from "../lib/socket";
import draggable, { dropzone } from "../lib/draggable";
import softclick, { cancelSoftClick } from "../lib/softclick";

let { alias, data, setAlias, editted, remove, dropHere, ...props } = $props();
let adding = $state(false);

let worksEl;

$effect(() => {
    if (data.folded) adding = false;
});

async function goToEndOfWorks() {
    await tick();
    worksEl.scrollBy({ left: worksEl.scrollWidth, behavior: "smooth" });
}

function addWork(arr, obj) {
    adding = false;
    data.works.push({ type: arr.join(" "), data: obj });
    goToEndOfWorks();
    editted();
}

function removeWork(idx) {
    data.works.splice(idx, 1);
    editted();
}

function oncontextmenu(evt) {
    showContextmenu(
        [
            {
                label: "execute",
                cb: async () => {
                    executeSequence(data);
                    return true;
                },
            },
            {
                label: "play",
                cb: async () => {
                    playSequence(alias);
                    return true;
                },
            },
            {
                label: "delete",
                cb: async () => {
                    remove();
                    return true;
                },
            },
        ],
        evt,
        "chain"
    );
}

let isHovering = $state(false);
</script>

<div
    class={["sequence", isHovering && "ready-to-drop"]}
    use:dropzone={{ accepts: ["sequence"] }}
    onhoverstart={() => (isHovering = true)}
    onhoverend={() => (isHovering = false)}
    onhoverdrop={({ detail }) => {
        isHovering = false;
        dropHere(detail.data);
    }}
    {...props}
>
    <button
        class="head"
        {oncontextmenu}
        use:softclick
        onsoftclick={() => {
            data.folded = !data.folded;
            editted();
        }}
        use:draggable={{
            type: "sequence",
            data: () => ({ alias, data: { ...data } }),
            className: "dragged",
        }}
        ondragstart={(evt) => cancelSoftClick(evt.target)}
        ondragdrop={remove}
    >
        <input
            type="text"
            class="name"
            value={alias}
            onblur={(evt) => {
                if (!evt.target?.value?.length) evt.target.value = alias;
                else
                    evt.target.value = setAlias(
                        evt.target?.value ?? "sequence"
                    );
            }}
            onkeydown={(evt) => {
                if (evt.key === "Enter" || evt.key === "Escape")
                    evt.target.blur?.();
            }}
            data-softclick-exception
            data-undraggable
        />
        <div class={["arrow", !data.folded && "down"]}>
            <Svg type="right" color={Colors.dark} />
        </div>
    </button>
    {#if !data.folded}
        <div class="works" bind:this={worksEl}>
            {#each data.works as work, idx}
                <SequenceWork
                    type={work.type}
                    data={work.data}
                    {editted}
                    remove={() => removeWork(idx)}
                />
            {/each}
            {#if adding}
                <div
                    class="adding"
                    use:outclick
                    onoutclick={() => (adding = false)}
                >
                    <SequenceWorkOpt select={addWork} />
                </div>
            {:else}
                <button
                    class="add"
                    aria-label="add"
                    onclick={() => {
                        adding = true;
                        goToEndOfWorks();
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="36"
                        height="36"
                        viewBox="0 0 36 36"
                        fill="none"
                    >
                        <path
                            d="M17.9999 2V34M34.0049 17.995L2.00488 17.995"
                            stroke="#004F51"
                            stroke-width="4"
                            stroke-linecap="round"
                        />
                    </svg>
                </button>
            {/if}
        </div>
        <div class="footer">
            <button
                class={["auto-load", !data.autoLoad && "off"]}
                onclick={() => (data.autoLoad = !data.autoLoad)}
                >auto-load</button
            >
        </div>
    {/if}
    <div class="bottom-line">
        <div class="line"></div>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="23"
            viewBox="0 0 56 23"
            fill="none"
        >
            <path
                d="M1 1L27.8468 21.25C38.3311 13.3419 44.2092 8.90812 54.6936 1"
                stroke="#004F51"
                stroke-width="2"
                stroke-linecap="round"
            />
        </svg>
        <div class="line"></div>
    </div>
</div>

<style>
.sequence {
    width: 100%;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;

    transition: margin-top 200ms ease;
}
.sequence.ready-to-drop:not(:has(.head:global(.dragged))) {
    margin-top: 30px;
}
.sequence:has(.head:global(.dragged)) {
    opacity: 0.4;
}
.head {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 10px 30px;
    align-items: center;
    height: 50px;
    box-sizing: border-box;
}
.name {
    border: none;
    background: none;
    font-size: 20px;
    font-weight: var(--semi-bold);
    color: var(--theme-dark);
    width: 50%;
    max-width: 200px;
    padding: 0;
}
.name:focus {
    font-weight: var(--bold);
    outline: none;
}
.arrow {
    display: flex;
    align-items: center;
    justify-content: center;
}
.arrow.down {
    transform: rotate(90deg);
}
.works {
    width: 100%;
    padding: 15px 30px 0px;
    background-color: var(--theme-feedback);
    display: flex;
    flex-direction: row;
    overflow-x: scroll;
    box-sizing: border-box;
    gap: 15px;
    --background: var(--theme-feedback);
}
.adding,
.add {
    flex: 0 0 auto;
    min-height: 150px;
    background-color: var(--theme-light);
    display: flex;
    border-radius: 10px;
    align-items: center;
}
.adding {
    flex-direction: column;
    justify-content: center;
    gap: 10px;
}
.add {
    width: 80px;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
}
.footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: end;
    padding: 6px 8px;
}
.auto-load {
    font-size: 14px;
    font-weight: var(--semi-bold);
    color: var(--white);
    background-color: var(--theme-dark);
    padding: 3px 9px;
    border-radius: 5px;
}
.auto-load.off {
    opacity: 0.5;
}

.bottom-line {
    width: 100%;
    display: flex;
    flex-direction: row;
    pointer-events: none;
    margin-bottom: -20px;

    .line {
        flex: 1 1 auto;
        height: 100%;
        border-top: solid var(--theme-dark) 2px;
    }
    svg {
        flex: 0 0 auto;
        margin-inline: -1px;
    }
}
</style>

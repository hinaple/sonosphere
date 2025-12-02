<script>
import { dropzone } from "../lib/draggable";
import Svg from "../lib/Svg.svelte";
import Colors from "../lib/colors.json";
import { get } from "svelte/store";
import { chains } from "../lib/stores";
import { showContextmenu } from "../lib/contextmenu";
import Checkbox from "./Checkbox.svelte";
import autoResizeTextarea from "../lib/autoResizeTextarea";

let { type, data, editted, remove } = $props();

const NUM_FIELDS = ["duration", "speed", "volume"];
const STR_FIELDS = ["channel"];
const BOOL_FIELDS = [];
const CODE_FIELDS = ["object"];

function oncontextmenu(evt) {
    showContextmenu(
        [
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
</script>

<div class="sequence-work">
    <button class="title" {oncontextmenu}>{type}</button>
    <div class="body">
        {#each Object.entries(data) as [key, value]}
            <div class="field">
                {#if key === "loop"}
                    <button
                        class={["loop svg", !value && "off"]}
                        onclick={() => {
                            data[key] = !value;
                            editted();
                        }}
                    >
                        <Svg
                            type={value ? "loop" : "noloop"}
                            color={Colors.white}
                        />
                    </button>
                {:else}
                    <div class="label">{key}</div>
                    {#if key === "file"}
                        <div
                            class="file-zone input"
                            use:dropzone={{ accepts: ["soundFile"] }}
                            onhoverdrop={({ detail }) => {
                                data[key] = detail.data.filename;
                                editted();
                            }}
                        >
                            {value}
                        </div>
                    {:else if key === "chain"}
                        <select
                            class="input"
                            {value}
                            onchange={(evt) => {
                                data[key] = evt.target.value;
                                if (data.from !== undefined) data.from = null;
                                editted();
                            }}
                        >
                            <option value={null} hidden selected
                                >select chain</option
                            >
                            {#each get(chains) as [chain]}
                                <option value={chain}>{chain}</option>
                            {/each}
                        </select>
                    {:else if key === "from"}
                        <select
                            class="input"
                            disabled={!data.chain}
                            {value}
                            onchange={(evt) => {
                                data[key] = evt.target.value;
                                editted();
                            }}
                        >
                            <option value={null} hidden selected
                                >select clip</option
                            >
                            {#if data.chain}
                                {#each new Map(get(chains)).get(data.chain) as clip, idx}
                                    <option value={clip.url}>{clip.url}</option>
                                {/each}
                            {/if}
                        </select>
                    {:else if STR_FIELDS.includes(key)}
                        <input
                            type="text"
                            class="input"
                            {value}
                            onblur={(evt) => {
                                data[key] = evt.target.value;
                                editted();
                            }}
                            onkeydown={(evt) => {
                                if (evt.key === "Enter" || evt.key === "Escape")
                                    evt.target.blur();
                            }}
                        />
                    {:else if NUM_FIELDS.includes(key)}
                        <input
                            type="number"
                            class="input short"
                            {value}
                            onblur={(evt) => {
                                data[key] = evt.target.value;
                                editted();
                            }}
                            onkeydown={(evt) => {
                                if (evt.key === "Enter" || evt.key === "Escape")
                                    evt.target.blur();
                            }}
                        />
                    {:else if CODE_FIELDS.includes(key)}
                        <textarea
                            {value}
                            onblur={(evt) => {
                                data[key] = evt.target.value;
                                editted();
                            }}
                            onkeydown={(evt) => {
                                if (
                                    evt.key === "Escape" ||
                                    (evt.key === "Enter" && evt.shiftKey)
                                )
                                    evt.target.blur();
                            }}
                            use:autoResizeTextarea={{ minHeight: 0 }}
                        ></textarea>
                    {:else if BOOL_FIELDS.includes(key)}
                        <Checkbox
                            checked={value}
                            onchange={(evt) => {
                                data[key] = evt.target.value;
                                editted();
                            }}
                        />
                    {/if}
                {/if}
            </div>
        {/each}
    </div>
</div>

<style>
.sequence-work {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    background-color: var(--theme-light);
    min-height: 150px;
    height: fit-content;
}
.title {
    min-width: 70px;
    border-radius: 10px 10px 0 0;
    background-color: var(--theme-dark);
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--white);
    font-size: 16px;
    font-weight: var(--semi-bold);
}
.body {
    display: flex;
    height: fit-content;
    flex-direction: column;
    padding: 10px 15px 20px 15px;
    gap: 10px;
}
.field {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 0 0 auto;
}
.input,
textarea {
    background-color: var(--white);
    border-radius: 5px;
    height: 24px;
    min-width: 170px;
    padding: 2px 6px;
    color: var(--theme-dark);
    font-size: 14px;
    font-weight: var(--semi-bold);
    border: none;
    box-sizing: border-box;
}
textarea {
    resize: none;
    background-color: var(--theme-dark);
    color: var(--white);
    padding-block: 5px;
}
div.input {
    display: flex;
    flex-direction: row;
    align-items: center;
}
.input.short {
    min-width: 70px;
}
input.input:focus,
select.input:focus,
textarea:focus {
    outline: none;
}
.label {
    color: var(--white);
    font-size: 14px;
    font-weight: var(--semi-bold);
}
.loop {
    width: 30px;
    height: 30px;
    border-radius: 5px;
    margin-left: auto;
    background-color: var(--theme-dark);
    margin-top: 10px;
}
.loop.off {
    opacity: 0.7;
}
</style>

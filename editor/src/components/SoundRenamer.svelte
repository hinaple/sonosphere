<script>
import { onMount } from "svelte";
import outclick from "../lib/outclick";

let { originalName, done, cancel } = $props();
const withoutExt = originalName.replace(/^(.+)\.(?:.+?)$/, "$1");
const extName = originalName.replace(/^.+(\..+?)$/, "$1");
let newName = $state(withoutExt);

let el = null;

onMount(() => {
    el.focus();
});

function change() {
    done((newName || withoutExt) + extName);
}
function keydown(evt) {
    if (evt.key === "Escape") {
        cancel();
        return;
    }
    if (evt.key === "Enter") {
        change();
    }
}
</script>

<div class="sound" use:outclick onoutclick={change}>
    <input
        type="text"
        class="no-focus"
        bind:value={newName}
        placeholder={withoutExt}
        bind:this={el}
        onkeydown={keydown}
        onblur={cancel}
    />
</div>

<style>
.sound {
    flex: 0 0 auto;
    width: 100%;
    height: 35px;
    padding-inline: 10px;
    box-sizing: border-box;
    border: solid var(--theme-dark) 2px;
    display: flex;
    flex-direction: row;
    align-items: center;
    border-radius: 10px;
    background-color: var(--theme-light);
}
input {
    font-size: 16px;
    color: #fff;
    font-weight: var(--semi-bold);
    border: none;
    background-color: transparent;
    width: 100%;
    padding: 0;
}
input::placeholder {
    color: #fff;
    opacity: 0.5;
}
</style>

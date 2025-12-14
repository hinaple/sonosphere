<script>
import Svg from "../lib/Svg.svelte";
import Colors from "../lib/colors.json";
import draggable from "../lib/draggable.ts";

let { seg, isFirst, afterLoop, editted, remove, ...props } = $props();
</script>

{#if !isFirst}
    {#if afterLoop}
        <button
            class="link svg"
            onclick={() => {
                seg.when = seg.when === "afterLoop" ? null : "afterLoop";
                editted();
            }}
        >
            <Svg
                type={seg.when === "afterLoop" ? "clock" : "right"}
                color={Colors.dark}
            />
        </button>
    {:else}
        <div class="link">
            <Svg type="link" color={Colors.dark} />
        </div>
    {/if}
{/if}
<div
    class={["clip", seg.loop && "loop"]}
    use:draggable={{
        type: "segment",
        data: () => ({ ...seg }),
        className: "dragged",
    }}
    ondragdrop={remove}
    tabindex="0"
    role="button"
    {...props}
>
    <span class="clip-name">{seg.url}</span>
    <button
        class="svg loop-or-not"
        onclick={() => {
            seg.loop = !seg.loop;
            editted();
        }}
    >
        <Svg type={seg.loop ? "loop" : "noloop"} color={Colors.white} />
    </button>
</div>

<style>
.link {
    padding-inline: 5px;
}
button.link {
    width: 30px;
    height: 30px;
    padding-inline: 0;
    border-radius: 50%;
}
button.link:hover {
    background-color: var(--theme-feedback);
}
.clip {
    height: 30px;
    display: flex;
    gap: 5px;
    flex-direction: row;
    background-color: var(--theme-dark);
    color: var(--white);
    padding-inline: 10px;
    border-radius: 10px;
    font-size: 16px;
    font-weight: var(--semi-bold);
    align-items: center;
    flex-wrap: nowrap;
    cursor: grab;
    flex: 0 0 auto;
}
.clip:global(.dragged) {
    opacity: 0.5;
}
</style>

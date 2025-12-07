<script>
    // @ts-nocheck

    import { onDestroy, tick } from "svelte";
    import { currentContextmenu, reset } from "./contextmenu";
    import outclick from "./outclick";

    let menu = $state(null);
    let pos = $state(null);

    const unsub = currentContextmenu.subscribe(async (cm) => {
        if (!cm) {
            menu = null;
            pos = null;
            return;
        }
        menu = cm.menu;
        pos = cm.pos;
        await tick();
        el.style.left = `${pos[0]}px`;
        el.style.top = `${pos[1]}px`;
    });
    onDestroy(unsub);

    let el = null;
</script>

{#if menu}
    <div
        class="contextmenu"
        bind:this={el}
        use:outclick
        onoutclick={() => reset()}
    >
        {#each menu as m}
            <button
                class="menu"
                onclick={() => {
                    if (m.cb()) reset();
                }}
            >
                <span>{m.label}</span>
            </button>
        {/each}
    </div>
{/if}

<style>
    .contextmenu {
        position: fixed;
        z-index: 40;
        left: 0;
        top: 0;
        background-color: var(--white);
        display: flex;
        flex-direction: column;
        min-width: 200px;
        padding-block: 5px;
        border-radius: 5px;
        box-shadow: var(--theme-dark) 3px 3px 15px;
    }
    .menu {
        padding: 3px 10px;
        font-size: 18px;
        font-weight: var(--regular);
        cursor: default;
        color: var(--theme-dark);
    }
    .menu:hover {
        font-weight: var(--semi-bold);
        background-color: var(--theme-feedback);
    }
</style>

<script>
    import { fly } from "svelte/transition";
    import { closeToast, toast } from "./toast.svelte";
    import { quadOut, quintOut } from "svelte/easing";
</script>

{#key toast.symbol}
    <div class="toast-container">
        {#if toast.show}
            <div
                class="toast"
                in:fly|global={{ duration: 400, y: -100, easing: quintOut }}
                out:fly={{ duration: 200, y: -100, easing: quadOut }}
            >
                {#if toast.title}
                    <div class="title">{toast.title}</div>
                {/if}
                {#if toast.content}
                    <div class="content">{toast.content}</div>
                {/if}
                {#if toast.btns && toast.btns.length}
                    <div class="btns">
                        {#each toast.btns as btn}
                            <button
                                class={btn.classes ?? null}
                                onclick={() => btn.onclick?.() && closeToast()}
                            >
                                {btn.label}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
    </div>
{/key}

<style>
    .toast-container {
        position: fixed;
        z-index: 20;
        left: 50%;
        transform: translateX(-50%);
        top: 0;
        pointer-events: none;
    }
    .toast {
        pointer-events: all;
        display: flex;
        flex-direction: column;
        padding: 15px 20px;
        border-radius: 0 0 20px 20px;
        background-color: var(--theme-light);
        box-shadow: rgba(0, 0, 0, 0.5) 0 5px 10px;
        outline: solid var(--theme-feedback) 2px;
        color: #fff;
        gap: 5px;
        min-width: 100px;
        max-width: 30vw;
    }
    .title,
    .content,
    .btns {
        flex: 0 0 auto;
    }
    .title {
        font-weight: var(--bold);
        font-size: 20px;
        white-space: pre-wrap;
    }
    .content {
        white-space: pre-wrap;
    }
    .btns {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 10px;
    }
    button {
        padding: 3px 8px;
        background-color: var(--theme-dark);
        color: var(--white);
        font-weight: var(--semi-bold);
        border-radius: 5px;
    }
    button.confirm {
        background-color: var(--white);
        color: var(--theme-dark);
    }
</style>

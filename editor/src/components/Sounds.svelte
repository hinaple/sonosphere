<script>
    import { onDestroy } from "svelte";
    import {
        deleteSounds,
        renameSound,
        requestSoundsList,
        updateSoundsList,
        url,
    } from "../lib/socket";
    import { sounds } from "../lib/stores";
    import Svg from "../lib/Svg.svelte";
    import { selectAndUploadSounds } from "../lib/uploadSounds";
    import SoundThumbnail from "./SoundThumbnail.svelte";
    import { reset, showContextmenu } from "../lib/contextmenu";
    import SoundRenamer from "./SoundRenamer.svelte";
    import { block } from "../lib/blockManager.js";
    import { getSoundFileUrl } from "../lib/utils";
    import { playSound } from "../lib/localSoundPlay/localSoundPlay.svelte";

    let loading = $state(false);

    let soundsArr = $state([]);
    let selectedSounds = $state([]);
    let lastSelect = null;
    let renaming = $state(null);
    const unsub = sounds.subscribe((s) => {
        if (renaming) return;
        soundsArr = s;
        selectedSounds = selectedSounds.filter((before) => s.includes(before));
        lastSelect = null;
    });

    let searchStr = $state();
    let displaySounds = $derived(
        searchStr
            ? soundsArr.filter((name) =>
                  name.replace(/\s/g, "").includes(searchStr.replace(/\s/g, ""))
              )
            : soundsArr
    );

    onDestroy(unsub);

    async function del(sounds) {
        loading = true;
        await deleteSounds(sounds);
        await updateSoundsList();
        loading = false;
    }

    function soundContextMenu(idx, evt) {
        const indexInSelected = selectedSounds.indexOf(displaySounds[idx]);
        if (indexInSelected !== -1 && selectedSounds.length > 1) {
            showContextmenu(
                [
                    {
                        label: "delete",
                        cb: async () => {
                            del(selectedSounds);
                            return true;
                        },
                    },
                ],
                evt,
                "sounds"
            );
            return;
        }
        select(displaySounds[idx], true);

        showContextmenu(
            [
                {
                    label: "download",
                    cb: () => {
                        const el = document.createElement("a");
                        el.href = getSoundFileUrl(displaySounds[idx]);
                        el.download = displaySounds[idx];
                        document.body.appendChild(el);
                        el.click();
                        document.body.removeChild(el);
                        return true;
                    },
                },
                {
                    label: "rename",
                    cb: () => {
                        selectedSounds = [];
                        renaming = displaySounds[idx];
                        return true;
                    },
                },
                {
                    label: "delete",
                    cb: () => {
                        del([displaySounds[idx]]);
                        return true;
                    },
                },
            ],
            evt,
            "sounds"
        );
        return;
    }

    let doubleClickTimeout = null;
    let doubleClicking = null;
    function clearDoubleClick() {
        if (doubleClickTimeout) clearTimeout(doubleClickTimeout);
        doubleClicking = null;
    }

    function detectDoubleClick(idx) {
        const displayName = displaySounds[idx];

        if (doubleClicking === displayName) {
            playSound(displayName);
            clearDoubleClick();
        } else {
            clearDoubleClick();
            doubleClicking = displayName;
            doubleClickTimeout = setTimeout(clearDoubleClick, 400);
        }
    }

    function clickSound(idx, shiftKey, ctrlKey, evt) {
        const displayName = displaySounds[idx];

        const indexInSelected = selectedSounds.indexOf(displayName);

        if (shiftKey && lastSelect !== null) {
            for (
                let i = Math.min(lastSelect, idx);
                i <= Math.max(lastSelect, idx);
                i++
            ) {
                const currentIdxInSel =
                    i === idx
                        ? indexInSelected
                        : selectedSounds.indexOf(displaySounds[i]);
                if (indexInSelected === -1 && currentIdxInSel === -1)
                    select(displaySounds[i]);
                else if (indexInSelected !== -1 && currentIdxInSel !== -1)
                    unselectByIdx(currentIdxInSel);
            }
            lastSelect = idx;
            return;
        }
        lastSelect = idx;
        if (!ctrlKey) {
            select(displayName, true);
        }
        if (ctrlKey) {
            if (indexInSelected !== -1) unselectByIdx(indexInSelected);
            else select(displayName);
        }
    }
    function select(soundName, only = false) {
        if (only) selectedSounds = [soundName];
        else selectedSounds.push(soundName);
    }
    function unselectByIdx(idx) {
        if (idx < 0) return;
        selectedSounds.splice(idx, 1);
    }

    let searchEl;
</script>

<div
    class="block"
    use:block={{
        name: "sounds",
        jobs: {
            search: () => {
                searchEl.focus?.();
                searchEl.select?.();
            },
        },
    }}
>
    {#if loading}
        <div class="loading"></div>
    {/if}
    <div class="toolbar">
        <div class="title">Sounds</div>
        <button
            onclick={async () => {
                loading = true;
                const didUpload = await selectAndUploadSounds();
                if (didUpload) await requestSoundsList();
                loading = false;
            }}><Svg type="upload"></Svg></button
        >
        <button
            onclick={async () => {
                loading = true;
                await updateSoundsList();
                loading = false;
            }}><Svg type="reload"></Svg></button
        >
    </div>
    <div class="search">
        <input
            bind:this={searchEl}
            type="text"
            placeholder="Search"
            bind:value={searchStr}
        />
    </div>
    <div class="sound-list" onscroll={() => reset("sounds")}>
        {#if soundsArr}
            {#each displaySounds as s, idx (s)}
                {#if renaming === s}
                    <SoundRenamer
                        originalName={s}
                        done={async (newName) => {
                            loading = true;
                            renaming = null;
                            await renameSound(s, newName);
                            await updateSoundsList();
                            loading = false;
                            select(newName, true);
                        }}
                        cancel={() => (renaming = null)}
                    />
                {:else}
                    <SoundThumbnail
                        filename={s}
                        oncontextmenu={(evt) => soundContextMenu(idx, evt)}
                        onmousedown={(evt) => {
                            if (evt.button !== 0) return;
                            evt.stopPropagation();
                            clickSound(idx, evt.shiftKey, evt.ctrlKey, evt);
                        }}
                        onclick={() => detectDoubleClick(idx)}
                        selected={selectedSounds.includes(s)}
                    />
                {/if}
            {/each}
        {/if}
    </div>
</div>

<style>
    .loading {
        position: absolute;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: var(--theme-dark);
        opacity: 0.5;
        cursor: progress;
    }
    .block {
        flex-basis: 30%;
        min-width: 400px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .search {
        width: 100%;
        padding: 0 13px 15px 13px;
        box-sizing: border-box;
        background-color: var(--theme-light);
    }
    .search > input {
        border: none;
        background-color: var(--white);
        color: var(--theme-dark);
        font-weight: var(--regular);
        font-size: 16px;
        padding: 6px 10px;
        width: 100%;
        box-sizing: border-box;
        border: none;
        border-radius: 10px;
    }
    .sound-list {
        height: 100%;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        padding: 10px 0 10px 10px;
        box-sizing: border-box;
        overflow-y: scroll;
        gap: 5px;
    }
</style>

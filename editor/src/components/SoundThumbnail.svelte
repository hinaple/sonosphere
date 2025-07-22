<script>
import draggable from "../lib/draggable";
let { filename, selected = false, ...props } = $props();
</script>

<button
    class={["sound", selected && "selected"]}
    {...props}
    use:draggable={{ type: "soundFile", data: { filename } }}
>
    <div class="filename">{filename}</div>
</button>

<style>
.sound {
    flex: 0 0 auto;
    width: 100%;
    height: 35px;
    padding-inline: 10px;
    box-sizing: border-box;
    border: solid var(--theme-dark) 2px;
    color: var(--theme-dark);
    font-size: 16px;
    font-weight: var(--semi-bold);
    display: flex;
    flex-direction: row;
    align-items: center;
    border-radius: 10px;
    cursor: pointer;
    overflow: hidden;
}
.filename {
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre;
}
.sound:hover {
    background-color: var(--theme-feedback);
}
.sound:focus {
    outline: solid var(--theme-dark) 1px;
}
.sound.selected {
    background-color: var(--theme-light);
    color: #fff;
}
</style>

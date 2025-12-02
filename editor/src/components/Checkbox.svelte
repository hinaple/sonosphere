<script>
let { checked = $bindable(false), ...props } = $props();
</script>

<input type="checkbox" bind:checked {...props} />

<style>
input {
    margin-right: auto;
}
</style>

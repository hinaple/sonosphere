<script>
import LOGO from "../assets/logo_typo.svg";
    import Sequences from "./Sequences.svelte";
import Sounds from "./Sounds.svelte";
</script>

<div class="blocks column editor">
    <div class="blocks header">
        <div class="block logo">
            <img src={LOGO} alt="sonosphere" />
        </div>
        <div class="block fill"></div>
    </div>
    <div class="blocks fill body">
        <Sounds />
        <Sequences/>
    </div>
</div>

<style>
.editor {
    width: 100%;
    height: 100%;
    padding: 20px;
    overflow: hidden;
}
.header {
    height: 50px;
    display: flex;
    flex-direction: row;
}
.logo {
    padding: 15px;
}
.logo > img {
    height: 100%;
    width: auto;
    transform: translateY(3px);
}
.body {
    overflow: hidden;
}
</style>

<script>
import LOGO from "/logo.svg";
import TYPO_TOP from "./assets/logo_typo.svg";
import TYPO_BOTTOM from "./assets/by_typo.svg";
import { fade, fly } from "svelte/transition";
import { quintOut } from "svelte/easing";
</script>

<div class="landing" out:fade={{ duration: 1000, easing: quintOut }}>
    <img
        transition:fly|global={{ duration: 800, easing: quintOut, y: 100 }}
        class="first"
        src={LOGO}
        alt="sonosphere"
    />
    <img
        transition:fly|global={{
            duration: 800,
            easing: quintOut,
            delay: 200,
            y: 100,
        }}
        class="second"
        src={TYPO_TOP}
        alt="sonosphere"
    />
    <img
        transition:fly|global={{
            duration: 800,
            easing: quintOut,
            delay: 400,
            y: 100,
        }}
        class="third"
        src={TYPO_BOTTOM}
        alt="by beyondspace"
    />
</div>

<style>
.landing {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: radial-gradient(100% 50% at 50% 50%, #fff 0%, #676767 100%);
    position: fixed;
    left: 0;
    top: 0;
    z-index: 999;
    gap: 10px;
}
.first {
    width: 300px;
    height: auto;
}
.second {
    width: 440px;
    height: auto;
}
.third {
    width: 200px;
    height: auto;
}
</style>

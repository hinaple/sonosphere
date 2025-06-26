<script>
const { type, color = "#fff" } = $props();
</script>

{#if type === "upload"}
    <svg
        width="16"
        height="17"
        viewBox="0 0 16 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M2.28557 6.36207L7.99986 2L13.7141 6.36207M0 16H16"
            stroke={color}
            stroke-width="2"
        />
        <path d="M8 13C8 13 8 6.29577 8 2" stroke={color} stroke-width="2" />
    </svg>
{:else if type === "reload"}
    <svg
        width="17"
        height="19"
        viewBox="0 0 17 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M13.8033 5.33616C10.8744 2.4391 6.12563 2.4391 3.1967 5.33615C0.267767 8.23321 0.267767 12.9303 3.1967 15.8273C6.12563 18.7244 10.8744 18.7244 13.8033 15.8273C15.1601 14.4852 15.8884 12.7569 15.9881 11.0001M13.8033 0.725433V6.77321H7.73802"
            stroke={color}
            stroke-width="2"
        />
    </svg>
{:else if type === "dots"}
    <svg
        width="21"
        height="5"
        viewBox="0 0 21 5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M4.2 2.49999C4.2 3.65979 3.2598 4.59999 2.1 4.59999C0.940202 4.59999 0 3.65979 0 2.49999C0 1.3402 0.940202 0.399994 2.1 0.399994C3.2598 0.399994 4.2 1.3402 4.2 2.49999Z"
            fill={color}
        />
        <path
            d="M12.6 2.49999C12.6 3.65979 11.6598 4.59999 10.5 4.59999C9.3402 4.59999 8.4 3.65979 8.4 2.49999C8.4 1.3402 9.3402 0.399994 10.5 0.399994C11.6598 0.399994 12.6 1.3402 12.6 2.49999Z"
            fill={color}
        />
        <path
            d="M21 2.49999C21 3.65979 20.0598 4.59999 18.9 4.59999C17.7402 4.59999 16.8 3.65979 16.8 2.49999C16.8 1.3402 17.7402 0.399994 18.9 0.399994C20.0598 0.399994 21 1.3402 21 2.49999Z"
            fill={color}
        />
    </svg>
{/if}

<style>
svg {
    width: var(--width, auto);
    height: var(--height, auto);
}
</style>

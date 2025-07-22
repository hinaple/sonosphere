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
{:else if type === "noloop"}
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="17"
        height="18"
        viewBox="0 0 17 18"
        fill="none"
    >
        <path
            d="M7.34615 4.14706C6.5395 4.14706 6.88668 4.14706 5.85294 4.14706C3.17274 4.14706 1 6.31979 1 9C1 10.6598 1.83324 12.1249 3.10423 13M7.34615 4.14706L4.69909 1.5M7.34615 4.14706L4.69909 6.79412M9.65385 13.8529C10.4605 13.8529 10.1133 13.8529 11.1471 13.8529C13.8273 13.8529 16 11.6802 16 9C16 7.38604 15.2121 5.95609 14 5.0738M9.65385 13.8529L12.3009 16.5M9.65385 13.8529L12.3009 11.2059M12.1471 1.5L4.85294 16.5"
            stroke={color}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
{:else if type === "loop"}
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="17"
        height="18"
        viewBox="0 0 17 18"
        fill="none"
    >
        <path
            d="M5.85294 13.8529C3.17274 13.8529 1 11.6802 1 9C1 6.31979 3.17274 4.14706 5.85294 4.14706C6.88668 4.14706 6.5395 4.14706 7.34615 4.14706M11.1471 4.14706C13.8273 4.14706 16 6.31979 16 9C16 11.6802 13.8273 13.8529 11.1471 13.8529C10.1133 13.8529 10.4605 13.8529 9.65385 13.8529M7.34615 4.14706L4.69909 1.5M7.34615 4.14706L4.69909 6.79412M9.65385 13.8529L12.3009 16.5M9.65385 13.8529L12.3009 11.2059"
            stroke={color}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
{:else if type === "link"}
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="21"
        height="10"
        viewBox="0 0 21 10"
        fill="none"
    >
        <path
            d="M8 1H5C2.79086 1 1 2.79086 1 5C1 7.20914 2.79086 9 5 9H8M13 9L16 9C18.2091 9 20 7.20914 20 5C20 2.79086 18.2091 1 16 1L13 1M7 5H14"
            stroke={color}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
{:else if type === "right"}
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="9"
        height="15"
        viewBox="0 0 9 15"
        fill="none"
    >
        <path
            d="M1 1L8 7.5L1 14"
            stroke={color}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
{:else if type === "clock"}
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
    >
        <path
            d="M10 5.5C10 5.5 10 7.85212 10 10L13 13M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z"
            stroke={color}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="bevel"
        />
    </svg>
{:else if type === "dots"}
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="4"
        viewBox="0 0 18 4"
        fill="none"
    >
        <path
            d="M4 2C4 3.10457 3.10457 4 2 4C0.89543 4 0 3.10457 0 2C0 0.89543 0.89543 0 2 0C3.10457 0 4 0.89543 4 2Z"
            fill={color}
        />
        <path
            d="M11 2C11 3.10457 10.1046 4 9 4C7.89543 4 7 3.10457 7 2C7 0.89543 7.89543 0 9 0C10.1046 0 11 0.89543 11 2Z"
            fill={color}
        />
        <path
            d="M18 2C18 3.10457 17.1046 4 16 4C14.8954 4 14 3.10457 14 2C14 0.89543 14.8954 0 16 0C17.1046 0 18 0.89543 18 2Z"
            fill={color}
        />
    </svg>
{:else if type === "plus"}
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
    >
        <path
            d="M16.0049 7.995L0.00488281 7.99499M7.99988 0L7.99988 16"
            stroke={color}
            stroke-width="2"
        />
    </svg>
{/if}

<style>
svg {
    width: var(--width, auto);
    height: var(--height, auto);
}
</style>

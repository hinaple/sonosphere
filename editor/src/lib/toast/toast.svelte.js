export const toast = $state({
    show: false,
    title: null,
    content: null,
    btns: [],
    closable: true,
    timeout: null,
    symbol: null,
    priority: null,
});

export function showToast({
    title = null,
    content = null,
    btns = [],
    // closable = true,
    duration = 500,
    priority = 1,
} = {}) {
    if (toast && toast.priority > priority) return;

    if (toast.show && toast.timeout) clearTimeout(toast.timeout);

    const symbol = Symbol();
    toast.symbol = symbol;
    toast.title = title;
    toast.content = content;
    toast.btns = btns;
    // toast.closable = closable;
    if (duration) toast.timeout = setTimeout(() => closeToast(false), duration);
    toast.show = true;

    return () => {
        if (toast.symbol === symbol) closeToast();
    };
}

export function closeToast(doClearTimeout = true) {
    toast.show = false;
    if (doClearTimeout && toast.timeout) clearTimeout(toast.timeout);
    toast.timeout = null;
}

// function toastTest() {
//     showToast({
//         title: "test",
//         content:
//             "this is a test toast. this is a test toast.this is a test toast. this is a test toast.",
//         duration: 2000,
//         btns: [
//             {
//                 label: "confirm",
//                 onclick: () => {
//                     setTimeout(toastTest, 1000);
//                     return true;
//                 },
//                 classes: ["confirm"],
//             },
//             { label: "cancel", onclick: () => {} },
//         ],
//     });
// }
// toastTest();

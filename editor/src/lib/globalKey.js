import { get } from "svelte/store";
import { unsaved } from "./stores";
import { storeServerData } from "./socket";

window.addEventListener(
    "keydown",
    (evt) => {
        if (evt.ctrlKey && evt.key.toLowerCase() === "s") {
            storeServerData()
                .then(() => {
                    unsaved.set(false);
                })
                .catch((err) => {
                    alert(
                        "An error occurred while storing data on the server."
                    );
                    console.error(err);
                });
            evt.preventDefault();
        }
    },
    true
);

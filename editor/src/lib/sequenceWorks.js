const SequenceWorks = {
    options: true,
    play: {
        options: true,
        clip: {
            file: null,
            channel: "default",
            loop: false,
        },
        chain: {
            chain: null,
            channel: "default",
            from: 0,
        },
    },
    load: {
        options: true,
        clip: {
            file: null,
        },
        chain: {
            chain: null,
        },
    },
    stop: {
        channel: "default",
    },
    fadeout: {
        channel: "default",
        speed: 0.5,
    },
    wait: {
        duration: 0,
    },
    reset: {},
};

export default SequenceWorks;

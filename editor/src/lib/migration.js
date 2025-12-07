import SequenceWorks from "./sequenceWorks";

export function migration(sequences) {
    sequences.forEach(([_, sequence]) => {
        sequence.works.forEach((work) => {
            const defaultWorkOpt = work.type
                .split(" ")
                .reduce(
                    (currentOpt, currentType) => currentOpt[currentType],
                    SequenceWorks
                );
            work.data = { ...defaultWorkOpt, ...work.data };
        });
    });
    return sequences;
}

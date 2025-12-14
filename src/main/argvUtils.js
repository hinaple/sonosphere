export function openedWithSnpp(argv) {
    if (argv.length < 2) return null;
    return argv.find((arg) => arg.endsWith(".snpp")) || null;
}

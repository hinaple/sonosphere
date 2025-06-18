let myContext = null;

export default function getContext() {
    if (!myContext) myContext = new AudioContext();
    return myContext;
}

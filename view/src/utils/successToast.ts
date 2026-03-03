type Listener = (message: string) => void;

const listeners: Set<Listener> = new Set();

export function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function showSuccess(message: string) {
    for (const l of Array.from(listeners)) {
        try {
            l(message);
        } catch (_) {
            // ignore listener errors
        }
    }
}

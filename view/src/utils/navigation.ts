export function normalizeScreenName(name?: string): string | undefined {
    if (!name) return undefined;

    // Add app-specific remapping here
    if (name === 'Centers') return 'CentersTab';

    return name;
}

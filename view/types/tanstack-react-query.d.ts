import * as React from 'react';

declare module '@tanstack/react-query' {
    export const QueryClient: any;
    export const QueryClientProvider: React.ComponentType<{
        client: any;
        children?: React.ReactNode;
    }>;
}

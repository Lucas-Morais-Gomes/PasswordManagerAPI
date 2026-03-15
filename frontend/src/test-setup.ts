import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock do matchMedia (exigido pelo SweetAlert2 e outros componentes)
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // depreciado
        removeListener: vi.fn(), // depreciado
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock do clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
    },
});

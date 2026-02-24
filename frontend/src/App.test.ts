import { describe, it, expect } from 'vitest';

describe('Teste Básico do Frontend', () => {
    it('deve somar dois números corretamente para validar o Vitest', () => {
        const soma = 10 + 20;
        expect(soma).toBe(30);
    });
});
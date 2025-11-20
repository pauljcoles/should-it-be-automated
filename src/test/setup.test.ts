import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

describe('Test Setup', () => {
    it('should run basic tests', () => {
        expect(true).toBe(true);
    });

    it('should run property-based tests with fast-check', () => {
        fc.assert(
            fc.property(fc.integer(), (n) => {
                return n + 0 === n;
            })
        );
    });
});

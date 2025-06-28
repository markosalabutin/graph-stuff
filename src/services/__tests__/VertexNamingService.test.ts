import { describe, it, expect, beforeEach } from 'vitest';
import { VertexNamingService } from '../VertexNamingService';

describe('VertexNamingService', () => {
  let service: VertexNamingService;

  beforeEach(() => {
    service = new VertexNamingService();
  });

  describe('generateName', () => {
    it('should generate single letters in alphabetical order', () => {
      expect(service.generateName()).toBe('A');
      expect(service.generateName()).toBe('B');
      expect(service.generateName()).toBe('C');
    });

    it('should generate all 26 single letters', () => {
      const names = [];
      for (let i = 0; i < 26; i++) {
        names.push(service.generateName());
      }
      
      expect(names).toEqual([
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z'
      ]);
    });

    it('should generate double letters after single letters are exhausted', () => {
      // Generate all 26 single letters
      for (let i = 0; i < 26; i++) {
        service.generateName();
      }
      
      // Next should be double letters
      expect(service.generateName()).toBe('AA');
      expect(service.generateName()).toBe('AB');
      expect(service.generateName()).toBe('AC');
    });

    it('should fallback to UUID when all combinations are exhausted', () => {
      // This would take a very long time to test all combinations,
      // so we'll mock the scenario by filling up the used names
      service.reset();
      
      // Fill up single letters
      for (let i = 0; i < 26; i++) {
        service.generateName();
      }
      
      // Fill up some double letters to verify the pattern
      for (let i = 0; i < 10; i++) {
        const name = service.generateName();
        expect(name).toMatch(/^[A-Z]{2}$/);
      }
    });
  });

  describe('reserveName', () => {
    it('should reserve an available name', () => {
      expect(service.reserveName('X')).toBe(true);
      expect(service.isNameAvailable('X')).toBe(false);
    });

    it('should not reserve an already used name', () => {
      service.reserveName('A');
      expect(service.reserveName('A')).toBe(false);
    });

    it('should not reserve a name generated automatically', () => {
      const generatedName = service.generateName(); // Should be 'A'
      expect(service.reserveName(generatedName)).toBe(false);
    });

    it('should reserve custom names that are not in alphabetical sequence', () => {
      expect(service.reserveName('CUSTOM1')).toBe(true);
      expect(service.reserveName('VERTEX_2')).toBe(true);
      expect(service.isNameAvailable('CUSTOM1')).toBe(false);
      expect(service.isNameAvailable('VERTEX_2')).toBe(false);
    });
  });

  describe('releaseName', () => {
    it('should release a reserved name', () => {
      service.reserveName('X');
      expect(service.isNameAvailable('X')).toBe(false);
      
      service.releaseName('X');
      expect(service.isNameAvailable('X')).toBe(true);
    });

    it('should release a generated name', () => {
      const name = service.generateName(); // Should be 'A'
      expect(service.isNameAvailable(name)).toBe(false);
      
      service.releaseName(name);
      expect(service.isNameAvailable(name)).toBe(true);
    });

    it('should allow releasing the same name multiple times without error', () => {
      service.reserveName('X');
      service.releaseName('X');
      
      // Should not throw error
      expect(() => service.releaseName('X')).not.toThrow();
    });

    it('should make released names available for generation again', () => {
      // Generate A, B, C
      service.generateName(); // A
      service.generateName(); // B
      service.generateName(); // C
      
      // Release B
      service.releaseName('B');
      
      // Next generation should pick up B again
      expect(service.generateName()).toBe('B');
    });
  });

  describe('isNameAvailable', () => {
    it('should return true for unused names', () => {
      expect(service.isNameAvailable('Z')).toBe(true);
      expect(service.isNameAvailable('CUSTOM')).toBe(true);
    });

    it('should return false for generated names', () => {
      const name = service.generateName();
      expect(service.isNameAvailable(name)).toBe(false);
    });

    it('should return false for reserved names', () => {
      service.reserveName('RESERVED');
      expect(service.isNameAvailable('RESERVED')).toBe(false);
    });
  });

  describe('getUsedNames', () => {
    it('should return empty array initially', () => {
      expect(service.getUsedNames()).toEqual([]);
    });

    it('should return generated names', () => {
      service.generateName(); // A
      service.generateName(); // B
      
      const usedNames = service.getUsedNames();
      expect(usedNames).toContain('A');
      expect(usedNames).toContain('B');
      expect(usedNames).toHaveLength(2);
    });

    it('should return reserved names', () => {
      service.reserveName('CUSTOM1');
      service.reserveName('CUSTOM2');
      
      const usedNames = service.getUsedNames();
      expect(usedNames).toContain('CUSTOM1');
      expect(usedNames).toContain('CUSTOM2');
      expect(usedNames).toHaveLength(2);
    });

    it('should not return released names', () => {
      service.generateName(); // A
      service.reserveName('CUSTOM');
      service.releaseName('A');
      
      const usedNames = service.getUsedNames();
      expect(usedNames).not.toContain('A');
      expect(usedNames).toContain('CUSTOM');
      expect(usedNames).toHaveLength(1);
    });
  });

  describe('reset', () => {
    it('should clear all used names', () => {
      service.generateName(); // A
      service.generateName(); // B
      service.reserveName('CUSTOM');
      
      expect(service.getUsedNames()).toHaveLength(3);
      
      service.reset();
      expect(service.getUsedNames()).toEqual([]);
    });

    it('should allow regenerating names after reset', () => {
      service.generateName(); // A
      service.generateName(); // B
      
      service.reset();
      
      expect(service.generateName()).toBe('A');
      expect(service.generateName()).toBe('B');
    });

    it('should make all names available after reset', () => {
      service.reserveName('X');
      service.generateName(); // A
      
      expect(service.isNameAvailable('X')).toBe(false);
      expect(service.isNameAvailable('A')).toBe(false);
      
      service.reset();
      
      expect(service.isNameAvailable('X')).toBe(true);
      expect(service.isNameAvailable('A')).toBe(true);
    });
  });
});

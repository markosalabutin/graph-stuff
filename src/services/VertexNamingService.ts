import type { VertexId } from "../domain/Graph";

export class VertexNamingService {
  private usedNames = new Set<string>();

  reset(): void {
    this.usedNames.clear();
  }

  generateName(): VertexId {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (const letter of alphabet) {
      if (!this.usedNames.has(letter)) {
        this.usedNames.add(letter);
        return letter;
      }
    }

    for (let i = 0; i < alphabet.length; i++) {
      for (let j = 0; j < alphabet.length; j++) {
        const doubleLetter = alphabet[i] + alphabet[j];
        if (!this.usedNames.has(doubleLetter)) {
          this.usedNames.add(doubleLetter);
          return doubleLetter;
        }
      }
    }

    return crypto.randomUUID();
  }

  reserveName(name: VertexId): boolean {
    if (this.usedNames.has(name)) return false;

    this.usedNames.add(name);
    return true;
  }

  releaseName(name: VertexId): void {
    this.usedNames.delete(name);
  }

  isNameAvailable(name: VertexId): boolean {
    return !this.usedNames.has(name);
  }

  getUsedNames(): VertexId[] {
    return Array.from(this.usedNames);
  }
}

export const defaultNamingService = new VertexNamingService();

'use client';

import type { Pet } from '@/types';

interface PetSelectorProps {
  pets: Pet[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function PetSelector({ pets, selectedId, onSelect }: PetSelectorProps) {
  if (pets.length === 0) return null;

  return (
    <select
      value={selectedId}
      onChange={(e) => onSelect(e.target.value)}
      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium focus:border-primary-500 focus:outline-none"
    >
      {pets.map((pet) => (
        <option key={pet._id} value={pet._id}>
          {pet.isSenior ? '🧓' : '🐾'} {pet.name}
        </option>
      ))}
    </select>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";

interface PokemonData {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
  };
  height: number;
  weight: number;
  types: { type: { name: string } }[];
}

export default function PokemonViewer() {
  const [currentId, setCurrentId] = useState(1);
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPokemon = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!response.ok) {
        throw new Error(`Pokemon with id ${id} not found`);
      }
      const data: PokemonData = await response.json();
      setPokemon(data);
    } catch {
      setError("Failed to load pokemon data.");
      setPokemon(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentId > 1) {
      const newId = currentId - 1;
      setCurrentId(newId);
      fetchPokemon(newId);
    }
  };

  const handleNext = () => {
    const newId = currentId + 1;
    setCurrentId(newId);
    fetchPokemon(newId);
  };

  if (!pokemon && !loading && !error) {
    fetchPokemon(currentId);
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h2 className="text-3xl font-[var(--font-fredoka)] text-[#F4977E]">
        Pokemon Explorer
      </h2>

      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-xl bg-white p-6 shadow-lg">
        {loading && <p className="py-12 text-lg text-gray-400">Loading...</p>}

        {error && (
          <div className="flex flex-col items-center gap-2 py-8">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => fetchPokemon(currentId)}
              className="rounded-lg bg-[#F4977E] px-4 py-2 text-white transition hover:bg-[#e8856a]"
            >
              Retry
            </button>
          </div>
        )}

        {pokemon && (
          <>
            <p className="text-sm text-gray-500">#{String(pokemon.id).padStart(3, "0")}</p>
            {pokemon.sprites.front_default && (
              <Image
                src={pokemon.sprites.front_default}
                alt={pokemon.name}
                width={192}
                height={192}
                className="h-48 w-48 object-contain"
              />
            )}
            <h3 className="text-2xl font-[var(--font-fredoka)] capitalize text-gray-800">
              {pokemon.name}
            </h3>
            <div className="flex gap-2">
              {pokemon.types.map(({ type }) => (
                <span
                  key={type.name}
                  className="rounded-full bg-gray-200 px-3 py-1 text-sm capitalize text-gray-700"
                >
                  {type.name}
                </span>
              ))}
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <p>Height: {(pokemon.height / 10).toFixed(1)} m</p>
              <p>Weight: {(pokemon.weight / 10).toFixed(1)} kg</p>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentId <= 1}
          className="rounded-lg bg-[#F4977E] px-6 py-2 text-white transition disabled:opacity-50 hover:disabled:bg-[#F4977E] hover:bg-[#e8856a]"
        >
          Previous
        </button>
        <span className="self-center text-sm text-gray-500">{currentId}</span>
        <button
          onClick={handleNext}
          className="rounded-lg bg-[#F4977E] px-6 py-2 text-white transition hover:bg-[#e8856a]"
        >
          Next
        </button>
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { useUsersQuery } from "../../my-new-user/_components/use-users-query";

/**
 * Torres del conjunto, deducidas de las relaciones usuario–conjunto.
 *
 * No hay endpoint de torres: la torre es un campo libre de cada relación, así
 * que la lista real es el conjunto de valores que alguien tiene escritos. Se
 * deducen aquí, igual que `useWorkersOptions` deduce los colaboradores, en vez
 * de pedirle al administrador que escriba el nombre de la torre a mano y se
 * arriesgue a no acertar con el que está guardado.
 */
export default function useTowerOptions() {
  const { data, isLoading } = useUsersQuery(1, 1000);

  const towerOptions = useMemo(() => {
    const towers = new Map<string, string>();

    for (const relation of data?.data ?? []) {
      const tower = relation.tower?.trim();
      if (!tower) continue;

      // "Torre A" y "torre a " son la misma torre: se agrupan por su forma
      // normalizada y se muestra la primera escritura encontrada.
      const key = tower.toLowerCase();
      if (!towers.has(key)) towers.set(key, tower);
    }

    return Array.from(towers.values())
      .sort((a, b) => a.localeCompare(b))
      .map((tower) => ({ value: tower, label: tower }));
  }, [data]);

  return { towerOptions, isLoadingTowers: isLoading };
}

export function groupToArray<T>(iterable: Iterable<T>, getIndex: (item: T) => number): T[][] {
  /* Build an array of groups. This array is sparse, which means that each index that had no corresponding group
   * elements will be an empty slot. */
  const sparse = [...iterable].reduce<T[][]>((groups, item) => {
    const index = getIndex(item)
    const group = groups[index]

    if (group) {
      group.push(item)
    } else {
      groups[index] = [item]
    }

    return groups
  }, [])

  /* Expand the sparse array into a non-sparse array, filling in empty arrays for empty slots. */
  return Array.from(sparse, (group) => group || [])
}

export function groupToMap<T, U>(iterable: Iterable<T>, getGroupKey: (item: T) => U): Map<U, T[]> {
  return [...iterable].reduce((groups, item) => {
    const groupKey = getGroupKey(item)
    const group = groups.get(groupKey)

    if (group) {
      group.push(item)
    } else {
      groups.set(groupKey, [item])
    }

    return groups
  }, new Map<U, T[]>())
}

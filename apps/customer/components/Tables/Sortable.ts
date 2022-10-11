import React from "react";

/**
 * It takes an array of items and a sort configuration object, and returns a new array of items sorted according to the
 * sort configuration, as well as a function to update the sort configuration
 * @param {T[]} items - The array of items to sort.
 * @param [config=null] - The initial sort configuration.
 * @returns An object with three properties:
 * - items: sortedItems
 * - requestSort: a function that takes a key and sets the sortConfig state
 * - sortConfig: the current sortConfig state
 */
export default function useSortableData<T>(items: T[], config = null)
{
    const [sortConfig, setSortConfig] = React.useState<{
        key: string;
        direction: 'ascending' | 'descending';
    } | null>(config);

    const sortedItems = React.useMemo(() =>
    {
        const sortableItems = [...items];
        if (sortConfig !== null)
        {
            sortableItems.sort((a, b) =>
            {
                // @ts-ignore
                if (a[sortConfig.key] < b[sortConfig.key])
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                // @ts-ignore
                if (a[sortConfig.key] > b[sortConfig.key])
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    /**
     * If the key is the same as the current sort key, then change the direction to descending. Otherwise, set the
     * direction to ascending
     * @param key - The key of the column to sort by.
     */
    // @ts-ignore
    const requestSort = (key) =>
    {
        let direction = 'ascending';
        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === 'ascending'
        )
            direction = 'descending';
        // @ts-ignore
        setSortConfig({key, direction});
    };

    return {items: sortedItems, requestSort, sortConfig};
}
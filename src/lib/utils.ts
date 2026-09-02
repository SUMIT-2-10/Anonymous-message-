/**
 * =================================================================================================
 * FILE: utils.ts
 * =================================================================================================
 *
 * @description A utility function for conditionally combining and merging Tailwind CSS classes.
 *              This is a common pattern in projects using `shadcn/ui`.
 *
 * @layer lib
 *
 * @purpose This file provides a helper function `cn` that simplifies the process of building
 *          dynamic and conditional class strings for styling components. It leverages two key
 *          libraries: `clsx` and `tailwind-merge`.
 *
 * @how_it_works
 * 1. **`clsx`:** This library takes various arguments (strings, objects, arrays) and concatenates
 *    them into a single class string. It's particularly useful for applying classes
 *    conditionally. For example: `clsx('base', { 'is-active': true, 'is-hidden': false })`
 *    would produce `'base is-active'`.
 * 2. **`tailwind-merge`:** This library intelligently merges Tailwind CSS classes, resolving
 *    conflicts. For example, if you have `p-2` and later add `p-4`, `tailwind-merge` ensures
 *    that `p-4` overrides `p-2`, resulting in a clean class string like `'p-4'` instead of
 *    `'p-2 p-4'`. This is crucial for creating reusable components with overridable styles.
 *
 * The `cn` function chains these two, first using `clsx` to build the class string from inputs,
 * and then passing the result through `tailwind-merge` to de-duplicate and resolve conflicts.
 * =================================================================================================
 */

// =================================================================================================
// IMPORTS
// =================================================================================================
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// =================================================================================================
// FUNCTION
// =================================================================================================
/**
 * @function cn
 * @description A utility to conditionally join class names and merge Tailwind CSS classes.
 *
 * @param {...ClassValue[]} inputs - A list of class values to be combined. This can include
 *        strings, arrays of strings, or objects where keys are class names and values are
 *        booleans indicating if they should be included.
 *
 * @returns {string} A final, merged, and conflict-resolved class string.
 *
 * @example
 * // Combines a base class with a conditional class and a prop-based class.
 * const buttonClasses = cn(
 *   'px-4 py-2 rounded',
 *   { 'bg-blue-500': isActive },
 *   props.className // e.g., 'bg-red-500 text-white'
 * );
 * // If isActive is true and props.className is 'bg-red-500',
 * // tailwind-merge will resolve the conflict, likely resulting in 'px-4 py-2 rounded bg-red-500'.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

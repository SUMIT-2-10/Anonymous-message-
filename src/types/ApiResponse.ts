/**
 * =================================================================================================
 * FILE: ApiResponse.ts
 * =================================================================================================
 *
 * @description TypeScript interface for a standardized API response structure.
 *
 * @layer types
 *
 * @purpose This interface defines a consistent shape for all API responses across the application.
 *          By standardizing the response format, both the frontend and backend can work with a
 *          predictable data structure, which simplifies handling API calls and responses.
 *
 * @benefits
 * - **Consistency:** Every API endpoint returns an object with `success` and `message` fields,
 *   making client-side handling uniform.
 * - **Clarity:** The `success` boolean provides a clear, immediate indicator of the request's
 *   outcome.
 * - **Flexibility:** Optional properties (`isAcceptingMessages`, `messages`) allow specific
 *   endpoints to return additional data without breaking the standard structure for other routes.
 *
 * @example
 * // A successful response
 * const successResponse: ApiResponse = {
 *   success: true,
 *   message: "Operation completed successfully."
 * };
 *
 * // A failure response
 * const errorResponse: ApiResponse = {
 *   success: false,
 *   message: "An error occurred."
 * };
 *
 * // A response with additional data
 * const dataResponse: ApiResponse = {
 *   success: true,
 *   message: "Messages fetched.",
 *   messages: [...]
 * };
 * =================================================================================================
 */

// =================================================================================================
// IMPORTS
// =================================================================================================
import { Message } from '@/model/User';

// =================================================================================================
// INTERFACE
// =================================================================================================
/**
 * @interface ApiResponse
 * @description Defines the standard structure for API responses.
 *
 * @property {boolean} success - Indicates whether the API operation was successful.
 * @property {string} message - A human-readable message providing context about the outcome
 *           (e.g., a success confirmation or an error description).
 * @property {boolean} [isAcceptingMessages] - Optional. Used specifically by endpoints that
 *           deal with the user's message acceptance status.
 * @property {Message[]} [messages] - Optional. Used by endpoints that return a list of messages.
 */
export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Message[];
}
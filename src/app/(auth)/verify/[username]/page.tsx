/**
 * =================================================================================================
 * FILE: page.tsx
 * =================================================================================================
 *
 * @description The user interface for verifying an account with a 6-digit code.
 *
 * @layer app
 * @route /verify/[username]
 *
 * @purpose This page allows a newly registered user to finalize their account creation by
 *          submitting the verification code (OTP) they received via email.
 *
 * @rendering `use client` - This is a Client Component because it uses hooks like `useState`,
 *              `useForm`, `useParams`, and `useRouter` to manage interactive state and browser-side
 *              functionality.
 *
 * @data_fetching
 * - This component does not fetch data on render.
 * - It performs a POST request to the `/api/verify-code` endpoint when the user submits the form.
 *
 * @props
 * - `params`: The dynamic route parameter passed by Next.js, containing the `username`.
 *   - Example: For the URL `/verify/john-doe`, `params.username` will be `"john-doe"`.
 * =================================================================================================
 */

// =================================================================================================
// IMPORTS
// =================================================================================================
'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { verifySchema } from '@/Schemas/verifySchema';

// =================================================================================================
// COMPONENT
// =================================================================================================
export default function VerifyAccountPage() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * @hook useForm
   * @description Initializes `react-hook-form` for the verification form.
   *
   * @param {z.infer<typeof verifySchema>}
   * - `resolver`: Integrates Zod for schema-based validation. `zodResolver(verifySchema)`
   *   ensures that form data adheres to the `verifySchema`.
   * - `defaultValues`: Sets the initial value for the form field.
   */
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      verifycode: '',
    },
  });

  /**
   * @function onSubmit
   * @description Handles the form submission event.
   *
   * @param {z.infer<typeof verifySchema>} data - The validated form data.
   *
   * @flow
   * 1. **Prevent Double Submission:** Checks `isSubmitting` state to avoid multiple API calls.
   * 2. **Set Submitting State:** Sets `isSubmitting` to `true` to disable the button and show a
   *    loading state.
   * 3. **API Request:** Sends a POST request to `/api/verify-code` with the `username` from URL
   *    parameters and the `code` from the form.
   * 4. **Success Handling:**
   *    - On a successful response, displays a success toast.
   *    - Redirects the user to the `/sign-in` page using `router.replace()` so they can log in.
   * 5. **Error Handling:**
   *    - Catches any errors from the Axios request.
   *    - Displays a destructive toast with the error message from the API response, or a
   *      generic error if no message is available.
   * 6. **Final State Reset:** Resets `isSubmitting` to `false` in the `finally` block, re-enabling
   *    the form button regardless of the outcome.
   */
  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>(`/api/verify-code`, {
        username: params.username,
        code: data.verifycode,
      });

      toast({
        title: 'Success',
        description: response.data.message,
      });

      router.replace('/sign-in');
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Verification Failed',
        description:
          axiosError.response?.data.message ??
          'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="verifycode"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Verify'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
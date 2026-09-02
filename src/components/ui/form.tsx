/**
 * =================================================================================================
 * FILE: form.tsx
 * =================================================================================================
 *
 * @description A collection of reusable components for building accessible and type-safe forms,
 *              integrating `react-hook-form` with `shadcn/ui` styling.
 *
 * @layer components/ui
 *
 * @purpose This file provides a structured way to build forms. It abstracts away much of the
 *          boilerplate associated with `react-hook-form` and provides a clear, composable API
 *          for creating fields, labels, and error messages that are automatically linked
 *          together for accessibility and state management.
 *
 * @how_it_works
 * 1. **`Form` (`FormProvider`):** The root component that wraps the entire form and provides the
 *    `react-hook-form` context.
 * 2. **`FormField`:** A wrapper around `react-hook-form`'s `Controller` component. It registers
 *    a field with the form state.
 * 3. **`FormItem`:** A container for a single form field, including its label, input, description,
 *    and error message. It creates a unique ID for linking these elements.
 * 4. **`useFormField`:** A custom hook that allows child components (`FormLabel`, `FormControl`, etc.)
 *    to access the field's state (like `error`, `id`, `name`) from the context provided by
 *    `FormField` and `FormItem`.
 * 5. **`FormLabel`, `FormControl`, `FormDescription`, `FormMessage`:** These components consume the
 *    `useFormField` hook to automatically get the necessary props (`htmlFor`, `id`, `aria-invalid`,
 *    etc.) for accessibility and to display validation errors.
 *
 * @usage
 * <Form {...form}>
 *   <form onSubmit={form.handleSubmit(onSubmit)}>
 *     <FormField
 *       control={form.control}
 *       name="username"
 *       render={({ field }) => (
 *         <FormItem>
 *           <FormLabel>Username</FormLabel>
 *           <FormControl>
 *             <Input placeholder="shadcn" {...field} />
 *           </FormControl>
 *           <FormDescription>This is your public display name.</FormDescription>
 *           <FormMessage />
 *         </FormItem>
 *       )}
 *     />
 *     <Button type="submit">Submit</Button>
 *   </form>
 * </Form>
 * =================================================================================================
 */
'use client';

import * as React from 'react';
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from 'react-hook-form';
import { Slot } from '@radix-ui/react-slot';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// =================================================================================================
// FORM PROVIDER
// =================================================================================================
const Form = FormProvider;

// =================================================================================================
// FORM FIELD CONTEXT
// =================================================================================================
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

// =================================================================================================
// FORM FIELD COMPONENT
// =================================================================================================
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

// =================================================================================================
// FORM ITEM CONTEXT & HOOK
// =================================================================================================
type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

// =================================================================================================
// FORM ITEM COMPONENT
// =================================================================================================
const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn('space-y-2', className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

// =================================================================================================
// FORM LABEL COMPONENT
// =================================================================================================
const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(error && 'text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

// =================================================================================================
// FORM CONTROL COMPONENT
// =================================================================================================
const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

// =================================================================================================
// FORM DESCRIPTION COMPONENT
// =================================================================================================
const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

// =================================================================================================
// FORM MESSAGE COMPONENT
// =================================================================================================
const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};

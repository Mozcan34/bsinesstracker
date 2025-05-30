import { FieldValues, UseFormReturn } from "react-hook-form";

export type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends string = string
> = {
  name: TName;
};

export type FormItemContextValue = {
  id: string;
};

export type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends string = string
> = {
  name: TName;
  form: UseFormReturn<TFieldValues>;
}; 
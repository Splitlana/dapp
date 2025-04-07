"use client";

import { classed } from "@tw-classed/react";
import { Field as FormikField } from "formik";

export const Field = classed(
  FormikField,
  "w-full",
  "shadow focus:shadow-outline",
  "appearance-none focus:outline-none",
  "leading-tight text-black",
  "rounded border",
  "py-2 px-3"
);

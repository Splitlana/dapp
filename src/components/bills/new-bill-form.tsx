"use client";

import React from "react";
import { ErrorMessage, Form, Formik } from "formik";
import Button from "../button";
import { number, object, string, infer as zinfer } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { Field, Label } from "../form";
import { api } from "@/trpc/react";

const billFormSchema = object({
  name: string({
    required_error: "Please enter the bill name",
  }).max(25, "Max characters is 25"),
  amount: number({ required_error: "Fill in the amount" })
    .min(1, "Minimum amount is 1")
    .max(10000, "Maximum amount is 10000"),
  splitBy: number({ required_error: "Fill in this field" })
    .min(2, "Minimum is 2")
    .max(50, "Maximum is 50"),
});

type BillFormSchema = zinfer<typeof billFormSchema>;

// since we cant initialize numbers (amount and splitby) as undefined (input uncontrol to controlled warning), we hack any, and initialize as empty string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initialValues: any = {
  name: "",
  amount: "",
  splitBy: "",
};

export const NewBillForm = () => {
  const { data, isLoading } = api.user.testPublicEndpoint.useQuery();

  console.log("data:", data);
  console.log("isLoading:", isLoading);

  return (
    <div className="relative p-4 flex flex-col gap-y-6">
      <Formik<BillFormSchema>
        initialValues={initialValues}
        validationSchema={toFormikValidationSchema(billFormSchema)}
        onSubmit={(values) => {
          const submit = async () => {
            console.log("submit values:", values);
          };
          void submit();
        }}
      >
        {({ isSubmitting, isValid }) => (
          <Form className="flex flex-col gap-4">
            <div>
              <Label htmlFor="name">Bill name</Label>
              <Field type="text" name="name" id="name" />
              <ErrorMessage name="name" component="div" />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Field
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                name="amount"
                id="amount"
              />
              <ErrorMessage name="amount" component="div" />
            </div>
            <div>
              <Label htmlFor="splitBy">Split by</Label>
              <Field
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                name="splitBy"
                id="splitBy"
              />
              <ErrorMessage name="splitBy" component="div" />
            </div>

            <Button color="primary" disabled={!isValid || isSubmitting}>
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

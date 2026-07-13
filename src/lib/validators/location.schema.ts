import { z } from "zod";

/** All four fields are required by the API (empty → 400 "The City field is required."). */
export function locationSchema(t: (key: string) => string) {
  const required = (field: string) => z.string().trim().min(1, t(field));

  return z.object({
    city: required("cityRequired"),
    state: required("stateRequired"),
    zipCode: required("zipCodeRequired"),
    country: required("countryRequired"),
  });
}

export type LocationFormValues = z.infer<ReturnType<typeof locationSchema>>;

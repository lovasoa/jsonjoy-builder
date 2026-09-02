import type { JsonSchema } from "../../src/index.ts";

export const exampleSchema: JsonSchema = {
  $schema: "https://json-schema.org/draft-07/schema",
  type: "object",
  $defs: {
    address: {
      type: "object",
      description: "Address information",
      properties: {
        street: {
          type: "string",
          description: "Street address",
        },
        city: {
          type: "string",
          description: "City name",
        },
        zipCode: {
          type: "string",
          description: "Postal/ZIP code",
        },
      },
    },
  },
  properties: {
    person: {
      type: "object",
      description: "Personal information",
      properties: {
        firstName: {
          type: "string",
          description: "First name of the person",
        },
        lastName: {
          type: "string",
          description: "Last name of the person",
        },
        age: {
          type: "number",
          description: "Age in years",
        },
        isEmployed: {
          type: "boolean",
          description: "Whether the person is currently employed",
        },
      },
      required: ["firstName", "lastName"],
    },
    address: {
      $ref: "#/$defs/address",
    },
    hobbies: {
      type: "array",
      description: "List of hobbies",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the hobby",
          },
          yearsExperience: {
            type: "number",
            description: "Years of experience",
          },
        },
      },
    },
  },
  required: ["person"],
};

import * as z from "zod/mini";
import type { Translation } from "../i18n/translation-keys.ts";
import { baseSchema, type JsonSchema } from "./jsonSchema.ts";

function refineRangeConsistency(
  min: number | undefined,
  isMinExclusive: boolean,
  max: number | undefined,
  isMaxExclusive: boolean,
): boolean {
  if (min !== undefined && max !== undefined && min > max) {
    return false;
  }
  if (isMinExclusive && isMaxExclusive && max - min < 2) {
    return false;
  }
  if ((isMinExclusive || isMaxExclusive) && max - min < 1) {
    return false;
  }
  return true;
}

const getJsonStringType = (t: Translation) =>
  z
    .object({
      minLength: z.optional(
        z
          .number()
          .check(
            z.int({ error: t.typeValidationErrorIntValue }),
            z.minimum(0, { error: t.typeValidationErrorNegativeLength }),
          ),
      ),
      maxLength: z.optional(
        z
          .number()
          .check(
            z.int({ error: t.typeValidationErrorIntValue }),
            z.minimum(0, { error: t.typeValidationErrorNegativeLength }),
          ),
      ),
      pattern: baseSchema.shape.pattern,
      format: baseSchema.shape.format,
      enum: baseSchema.shape.enum,
      contentMediaType: baseSchema.shape.contentMediaType, // TODO
      contentEncoding: baseSchema.shape.contentEncoding, // TODO
    })
    .check(
      // If minLength and maxLength are both set, minLength must not be greater than maxLength.
      z.refine(
        ({
          minLength,
          maxLength,
        }: {
          minLength?: number;
          maxLength?: number;
        }) => refineRangeConsistency(minLength, false, maxLength, false),
        {
          error: t.stringValidationErrorLengthRange,
          path: ["length"],
        },
      ),
    );

const getJsonNumberType = (t: Translation) =>
  z
    .object({
      multipleOf: z.optional(
        z.number().check(z.positive({ error: t.typeValidationErrorPositive })),
      ),
      minimum: baseSchema.shape.minimum,
      maximum: baseSchema.shape.maximum,
      exclusiveMinimum: baseSchema.shape.exclusiveMinimum,
      exclusiveMaximum: baseSchema.shape.exclusiveMaximum,
      enum: baseSchema.shape.enum,
    })
    .check(
      // If both minimum (or exclusiveMinimum) and maximum (or exclusiveMaximum) are set, minimum must not be greater than maximum.
      z.refine(
        ({ minimum, exclusiveMinimum, maximum, exclusiveMaximum }) =>
          refineRangeConsistency(minimum, false, maximum, false) &&
          refineRangeConsistency(minimum, false, exclusiveMaximum, true) &&
          refineRangeConsistency(exclusiveMinimum, true, maximum, false) &&
          refineRangeConsistency(
            exclusiveMinimum,
            true,
            exclusiveMaximum,
            true,
          ),
        {
          error: t.numberValidationErrorMinMax,
          path: ["minMax"],
        },
      ),
      // cannot set both exclusiveMinimum and minimum
      z.refine(
        ({ minimum, exclusiveMinimum }) =>
          exclusiveMinimum === undefined || minimum === undefined,
        {
          error: t.numberValidationErrorBothExclusiveAndInclusiveMin,
          path: ["redundantMinimum"],
        },
      ),
      // cannot set both exclusiveMaximum and maximum
      z.refine(
        ({ maximum, exclusiveMaximum }) =>
          exclusiveMaximum === undefined || maximum === undefined,
        {
          error: t.numberValidationErrorBothExclusiveAndInclusiveMax,
          path: ["redundantMaximum"],
        },
      ),
      // check that the enums are within min/max if they are set
      z.refine(
        ({
          enum: enumValues,
          minimum,
          maximum,
          exclusiveMinimum,
          exclusiveMaximum,
        }) => {
          if (!enumValues || enumValues.length === 0) return true;
          return enumValues.every((val) => {
            if (typeof val !== "number") return false;
            if (minimum !== undefined && val < minimum) return false;
            if (maximum !== undefined && val > maximum) return false;
            if (exclusiveMinimum !== undefined && val <= exclusiveMinimum)
              return false;
            if (exclusiveMaximum !== undefined && val >= exclusiveMaximum)
              return false;
            return true;
          });
        },
        {
          error: t.numberValidationErrorEnumOutOfRange,
          path: ["enum"],
        },
      ),
    );

const getJsonArrayType = (t: Translation) =>
  z
    .object({
      minItems: z.optional(
        z
          .number()
          .check(
            z.int({ error: t.typeValidationErrorIntValue }),
            z.minimum(0, { error: t.typeValidationErrorNegativeLength }),
          ),
      ),
      maxItems: z.optional(
        z
          .number()
          .check(
            z.int({ error: t.typeValidationErrorIntValue }),
            z.minimum(0, { error: t.typeValidationErrorNegativeLength }),
          ),
      ),
      uniqueItems: z.optional(z.boolean()),
      minContains: z.optional(
        z
          .number()
          .check(
            z.int({ error: t.typeValidationErrorIntValue }),
            z.minimum(0, { error: t.typeValidationErrorNegativeLength }),
          ),
      ),
      maxContains: z.optional(
        z
          .number()
          .check(
            z.int({ error: t.typeValidationErrorIntValue }),
            z.minimum(0, { error: t.typeValidationErrorNegativeLength }),
          ),
      ),
    })
    .check(
      // If both minItems and maxItems are set, minItems must not be greater than maxItems.
      z.refine(
        ({ minItems, maxItems }) =>
          refineRangeConsistency(minItems, false, maxItems, false),
        {
          error: t.arrayValidationErrorMinMax,
          path: ["minmax"],
        },
      ),
      // If both minContains and maxContains are set, minContains must not be greater than maxContains.
      z.refine(
        ({ minContains, maxContains }) =>
          refineRangeConsistency(minContains, false, maxContains, false),
        {
          error: t.arrayValidationErrorContainsMinMax,
          path: ["minmaxContains"],
        },
      ),
    );

const getJsonObjectType = (t: Translation) =>
  z
    .object({
      minProperties: z.optional(
        z
          .number()
          .check(
            z.int({ error: t.typeValidationErrorIntValue }),
            z.minimum(0, { error: t.typeValidationErrorNegativeLength }),
          ),
      ),
      maxProperties: z.optional(
        z
          .number()
          .check(
            z.int({ error: t.typeValidationErrorIntValue }),
            z.minimum(0, { error: t.typeValidationErrorNegativeLength }),
          ),
      ),
    })
    .check(
      // If both minProperties and maxProperties are set, minProperties must not be greater than maxProperties.
      z.refine(
        ({ minProperties, maxProperties }) =>
          refineRangeConsistency(minProperties, false, maxProperties, false),
        {
          error: t.objectValidationErrorMinMax,
          path: ["minmax"],
        },
      ),
    );

export function getTypeValidation(type: string, t: Translation) {
  const jsonTypesValidation: Record<string, z.ZodMiniType> = {
    string: getJsonStringType(t),
    number: getJsonNumberType(t),
    array: getJsonArrayType(t),
    object: getJsonObjectType(t),
  };

  return jsonTypesValidation[type] || z.unknown();
}

export interface TypeValidationResult {
  success: boolean;
  errors?: z.core.$ZodIssue[];
}

export function validateSchemaByType(
  schema: unknown,
  type: string,
  t: Translation,
): TypeValidationResult {
  const zodSchema = getTypeValidation(type, t);
  const result = zodSchema.safeParse(schema);
  if (result.success) {
    return { success: true };
  } else {
    return { success: false, errors: result.error.issues };
  }
}

export interface ValidationTreeNode {
  name: string;
  validation: TypeValidationResult;
  children: Record<string, ValidationTreeNode>;
  cumulativeChildrenErrors: number; // Total errors in this node and all its descendants
}

export function buildValidationTree(
  schema: JsonSchema,
  t: Translation,
): ValidationTreeNode {
  // Helper to determine a concrete type string from a schema.type which may be string | string[] | undefined
  const deriveType = (sch: unknown): string | undefined => {
    if (!sch || typeof sch !== "object") return undefined;
    const declared = (sch as Record<string, unknown>).type;
    if (typeof declared === "string") return declared;
    if (
      Array.isArray(declared) &&
      declared.length > 0 &&
      typeof declared[0] === "string"
    )
      return declared[0];
    return undefined;
  };

  // TODO confirm assumption below:
  // Handle boolean schemas: true => always valid, false => always invalid
  if (typeof schema === "boolean") {
    const validation: TypeValidationResult =
      schema === true
        ? { success: true }
        : {
            success: false,
            errors: [
              {
                code: "custom",
                message: t.validatorErrorSchemaValidation,
                path: [],
              } as unknown as z.core.$ZodIssue,
            ],
          };

    const node: ValidationTreeNode = {
      name: String(schema),
      validation,
      children: {},
      cumulativeChildrenErrors: validation.success
        ? 0
        : (validation.errors?.length ?? 0),
    };

    return node;
  }

  // schema is an object-shaped JsonSchema
  const sch = schema as Record<string, unknown>;
  const currentType = deriveType(sch);

  const validation = validateSchemaByType(schema, currentType, t);

  const children: Record<string, ValidationTreeNode> = {};

  // Traverse object properties
  if (currentType === "object") {
    const properties = sch.properties;
    if (properties && typeof properties === "object") {
      for (const [propName, propSchema] of Object.entries(
        properties as Record<string, JsonSchema>,
      )) {
        children[propName] = buildValidationTree(propSchema, t);
      }
    }
    // handle dependentSchemas, patternProperties etc. if present (shallow support)
    if (sch.patternProperties && typeof sch.patternProperties === "object") {
      for (const [patternName, patternSchema] of Object.entries(
        sch.patternProperties as Record<string, JsonSchema>,
      )) {
        children[`pattern:${patternName}`] = buildValidationTree(
          patternSchema,
          t,
        );
      }
    }
  }

  // Traverse array items / prefixItems
  if (currentType === "array") {
    const items = sch.items;
    if (Array.isArray(items)) {
      items.forEach((it, idx) => {
        children[`items[${idx}]`] = buildValidationTree(it, t);
      });
    } else if (items) {
      children.items = buildValidationTree(items as JsonSchema, t);
    }

    if (Array.isArray(sch.prefixItems)) {
      (sch.prefixItems as JsonSchema[]).forEach((it, idx) => {
        children[`prefixItems[${idx}]`] = buildValidationTree(it, t);
      });
    }
  }

  // Handle combinators: allOf / anyOf / oneOf / not (shallow traversal)
  const combinators: Array<"allOf" | "anyOf" | "oneOf"> = [
    "allOf",
    "anyOf",
    "oneOf",
  ];
  for (const comb of combinators) {
    const arr = sch[comb];
    if (Array.isArray(arr)) {
      arr.forEach((subSchema, idx) => {
        children[[comb, idx].join(":")] = buildValidationTree(
          subSchema as JsonSchema,
          t,
        );
      });
    }
  }

  if (sch.not) {
    children.not = buildValidationTree(sch.not as JsonSchema, t);
  }

  // $defs / definitions / dependentSchemas (shallow)
  if (sch.$defs && typeof sch.$defs === "object") {
    for (const [defName, defSchema] of Object.entries(
      sch.$defs as Record<string, JsonSchema>,
    )) {
      children[`$defs:${defName}`] = buildValidationTree(defSchema, t);
    }
  }

  // definitions is the older name for $defs, so we support both
  const definitions = (sch as Record<string, unknown>).definitions;
  if (definitions && typeof definitions === "object") {
    for (const [defName, defSchema] of Object.entries(
      definitions as Record<string, JsonSchema>,
    )) {
      children[`definitions:${defName}`] = buildValidationTree(defSchema, t);
    }
  }

  // Compute cumulative error counts (own + all descendants)
  const ownErrors = validation.success ? 0 : (validation.errors?.length ?? 0);
  const childrenErrors = Object.values(children).reduce(
    (sum, child) => sum + child.cumulativeChildrenErrors,
    0,
  );

  return {
    name: currentType,
    validation,
    children,
    cumulativeChildrenErrors: ownErrors + childrenErrors,
  };
}

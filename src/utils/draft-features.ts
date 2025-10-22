/**
 * Draft-specific feature availability
 * Defines which advanced keywords are available in each JSON Schema draft
 */

export interface DraftFeatures {
  conditionals: boolean;      // if/then/else
  composition: boolean;        // allOf/anyOf/oneOf/not
  dependentSchemas: boolean;   // dependentSchemas keyword
  prefixItems: boolean;        // prefixItems for tuples
  dynamicRefs: boolean;        // $dynamicRef/$dynamicAnchor
  unevaluatedProps: boolean;   // unevaluatedProperties
  unevaluatedItems: boolean;   // unevaluatedItems
}

export const DRAFT_FEATURES: Record<string, DraftFeatures> = {
  'draft-07': {
    conditionals: true,        // if/then/else available in Draft-07+
    composition: true,         // allOf/anyOf/oneOf/not in all drafts
    dependentSchemas: false,   // Added in 2019-09
    prefixItems: false,        // Added in 2020-12
    dynamicRefs: false,        // Added in 2020-12 (uses $recursiveRef in 2019-09)
    unevaluatedProps: false,   // Enhanced in 2020-12
    unevaluatedItems: false    // Enhanced in 2020-12
  },
  '2019-09': {
    conditionals: true,
    composition: true,
    dependentSchemas: true,    // NEW in 2019-09
    prefixItems: false,        // Not yet available
    dynamicRefs: false,        // Uses $recursiveRef instead
    unevaluatedProps: true,    // Basic support in 2019-09
    unevaluatedItems: true     // Basic support in 2019-09
  },
  '2020-12': {
    conditionals: true,
    composition: true,
    dependentSchemas: true,
    prefixItems: true,         // NEW in 2020-12
    dynamicRefs: true,         // NEW in 2020-12 (replaces $recursiveRef)
    unevaluatedProps: true,    // Enhanced in 2020-12
    unevaluatedItems: true     // Enhanced in 2020-12
  }
};

/**
 * Get features available for a specific draft version
 */
export function getDraftFeatures(draft: string = '2020-12'): DraftFeatures {
  return DRAFT_FEATURES[draft] || DRAFT_FEATURES['2020-12'];
}

/**
 * Check if a specific feature is available in a draft
 */
export function isFeatureAvailable(
  draft: string,
  feature: keyof DraftFeatures
): boolean {
  const features = getDraftFeatures(draft);
  return features[feature];
}

/**
 * Get the draft version that introduced a feature
 */
export function getFeatureIntroducedIn(feature: keyof DraftFeatures): string {
  if (feature === 'prefixItems' || feature === 'dynamicRefs') {
    return '2020-12';
  }
  if (feature === 'dependentSchemas') {
    return '2019-09';
  }
  if (feature === 'unevaluatedProps' || feature === 'unevaluatedItems') {
    return '2019-09'; // Basic support, enhanced in 2020-12
  }
  if (feature === 'conditionals') {
    return 'draft-07';
  }
  return 'draft-07'; // Available in all drafts
}

/**
 * Get human-readable feature introduction version
 */
export function getFeatureVersionBadge(feature: keyof DraftFeatures): string | null {
  const version = getFeatureIntroducedIn(feature);
  if (version === '2020-12') {
    return 'Draft 2020-12';
  }
  if (version === '2019-09') {
    return 'Draft 2019-09+';
  }
  return null; // Don't show badge for draft-07 features
}
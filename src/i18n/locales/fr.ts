import type { Translation } from "../translation-keys.ts";

export const fr: Translation = {
  collapse: "Replier",
  expand: "Déplier",

  fieldDescriptionPlaceholder: "Décrivez le but de ce champ",
  fieldDelete: "Supprimer le champ",
  fieldDescription: "Description",
  fieldNameLabel: "Nom du champ",
  fieldNamePlaceholder: "ex. prenom, age, estActif",
  fieldNameUseRegex: "Utiliser une expression régulière",
  fieldNameUseExactName: "Utiliser un nom exact",
  fieldNameRegexLabel: "Expression régulière pour les noms de propriétés",
  fieldNameRegexPlaceholder: "ex. ^S_",
  fieldNameRegexHelp:
    "Autorise toute propriété dont le nom correspond à cette expression régulière. Les propriétés correspondantes doivent respecter ce schéma de champ. Utilisez ^ et $ pour cibler le nom entier.",
  fieldNameRegexError: "Saisissez une expression régulière valide.",
  fieldRequiredLabel: "Champ obligatoire",
  fieldType: "Type de champ",
  fieldTypeExample: "Exemple:",
  fieldAddNewButton: "Ajouter un champ",
  fieldAddNewBadge: "Constructeur de schéma",
  fieldAddNewCancel: "Annuler",
  fieldAddNewConfirm: "Ajouter un champ",
  fieldAddNewDescription: "Créez un nouveau champ pour votre schéma JSON",
  fieldAddNewLabel: "Ajouter un nouveau champ",

  fieldTypeTextLabel: "Texte",
  fieldTypeTextDescription:
    "Pour les valeurs textuelles comme les noms, descriptions, etc.",
  fieldTypeNumberLabel: "Nombre",
  fieldTypeNumberDescription: "Pour les nombres décimaux ou entiers",
  fieldTypeBooleanLabel: "Oui/Non",
  fieldTypeBooleanDescription: "Pour les valeurs vrai/faux",
  fieldTypeObjectLabel: "Groupe",
  fieldTypeObjectDescription: "Pour regrouper des champs connexes",
  fieldTypeArrayLabel: "Liste",
  fieldTypeArrayDescription: "Pour les collections d'éléments",

  propertyDescriptionPlaceholder: "Ajouter une description...",
  propertyDescriptionButton: "Ajouter une description...",
  propertyRequired: "Obligatoire",
  propertyNameRegexDescription:
    "Autorise et valide les propriétés dont le nom correspond à cette expression régulière.",
  propertyOptional: "Facultatif",
  propertyDelete: "Supprimer le champ",

  schemaEditorTitle: "Éditeur de schéma JSON",
  schemaEditorToggleFullscreen: "Basculer en plein écran",
  schemaEditorEditModeVisual: "Visuel",
  schemaEditorEditModeJson: "JSON",
  schemaEditorLoading: "Chargement de l'éditeur...",

  arrayNoConstraint: "Pas de constrainte",
  arrayMinimumLabel: "Éléments minimum",
  arrayMinimumPlaceholder: "Pas de minimum",
  arrayMaximumLabel: "Éléments maximum",
  arrayMaximumPlaceholder: "Pas de maximum",
  arrayForceUniqueItemsLabel: "Forcer les éléments uniques",
  arrayItemTypeLabel: "Type d'élément",
  arrayValidationErrorMinMax:
    "'minItems' ne peut pas être supérieur à 'maxItems'.",
  arrayValidationErrorContainsMinMax:
    "'minContains' ne peut pas être supérieur à 'maxContains'.",

  booleanNoConstraint: "Pas de constrainte",
  booleanAllowedValuesLabel: "Valeurs autorisées",
  booleanAllowFalseLabel: "Autoriser la valeur faux",
  booleanAllowTrueLabel: "Autoriser la valeur vrai",
  booleanNeitherWarning:
    "Avertissement : vous devez autoriser au moins une valeur.",

  numberNoConstraint: "Pas de constrainte",
  numberMinimumLabel: "Valeur minimale",
  numberMinimumPlaceholder: "Pas de minimum",
  numberMaximumLabel: "Valeur maximale",
  numberMaximumPlaceholder: "Pas de maximum",
  numberExclusiveMinimumLabel: "Minimum exclusif",
  numberExclusiveMinimumPlaceholder: "Pas de min exclusif",
  numberExclusiveMaximumLabel: "Maximum exclusif",
  numberExclusiveMaximumPlaceholder: "Pas de max exclusif",
  numberMultipleOfLabel: "Multiple de",
  numberMultipleOfPlaceholder: "Quelconque",
  numberAllowedValuesEnumLabel: "Valeurs autorisées (enum)",
  numberAllowedValuesEnumNone: "Aucune valeur restreinte définie",
  numberAllowedValuesEnumAddLabel: "Ajouter",
  numberAllowedValuesEnumAddPlaceholder: "Ajouter une valeur autorisée...",
  numberValidationErrorMinMax: "Minimum et maximum doivent être cohérents.",
  numberValidationErrorBothExclusiveAndInclusiveMin:
    "Les champs 'exclusiveMinimum' et 'minimum' ne peuvent pas être définis en même temps.",
  numberValidationErrorBothExclusiveAndInclusiveMax:
    "Les champs 'exclusiveMaximum' et 'maximum' ne peuvent pas être définis en même temps.",
  numberValidationErrorEnumOutOfRange:
    "Les valeurs d'énumération doivent être dans la plage définie.",

  objectPropertiesNone: "Aucune propriété définie",
  objectValidationErrorMinMax:
    "'minProperties' ne peut pas être supérieur à 'maxProperties'.",

  additionalPropertiesAllow: "Autoriser les propriétés additionnelles",
  additionalPropertiesForbid: "Interdire les propriétés additionnelles",

  stringNoConstraint: "Pas de constrainte",
  stringMinimumLengthLabel: "Longueur minimale",
  stringMinimumLengthPlaceholder: "Pas de minimum",
  stringMaximumLengthLabel: "Longueur maximale",
  stringMaximumLengthPlaceholder: "Pas de maximum",
  stringPatternLabel: "Motif (regex)",
  stringPatternPlaceholder: "^[a-zA-Z]+$",
  stringFormatLabel: "Format",
  stringFormatNone: "Aucun",
  stringFormatDateTime: "Date-Heure",
  stringFormatDate: "Date",
  stringFormatTime: "Heure",
  stringFormatEmail: "Email",
  stringFormatUri: "URI",
  stringFormatUuid: "UUID",
  stringFormatHostname: "Nom d'hôte",
  stringFormatIpv4: "Adresse IPv4",
  stringFormatIpv6: "Adresse IPv6",
  stringAllowedValuesEnumLabel: "Valeurs autorisées (enum)",
  stringAllowedValuesEnumNone: "Aucune valeur restreinte définie",
  stringAllowedValuesEnumAddPlaceholder: "Ajouter une valeur autorisée...",
  stringAllowedValuesEnumAddLabel: "Ajouter",
  stringFormatSelectPlaceholder: "Sélectionner le format",
  stringValidationErrorLengthRange:
    "'Longueur minimale' ne peut pas être supérieure à 'Longueur maximale'.",

  schemaTypeAnyOf: "Au moins un",
  anyOfAddOption: "Ajouter une option",
  anyOfRemoveOption: "Supprimer l'option",
  anyOfOptionLabel: "Option",
  anyOfDescription: "La valeur doit correspondre à au moins un de ces schémas",
  anyOfNoOptions: "Aucune option définie",

  schemaTypeOneOf: "Un seul",
  oneOfAddOption: "Ajouter une option",
  oneOfRemoveOption: "Supprimer l'option",
  oneOfOptionLabel: "Option",
  oneOfDescription:
    "La valeur doit correspondre à exactement un de ces schémas",
  oneOfNoOptions: "Aucune option définie",

  schemaTypeAllOf: "Tous",
  allOfAddSchema: "Ajouter un schéma",
  allOfRemoveSchema: "Supprimer le schéma",
  allOfSchemaLabel: "Schéma",
  allOfDescription: "La valeur doit correspondre à tous ces schémas",
  allOfNoSchemas: "Aucun schéma défini",

  schemaTypeRef: "Référence",
  refDescription: "Réutilise un autre schéma défini dans ce document",
  refTargetLabel: "Cible de la référence",
  refTargetPlaceholder: "#/$defs/exemple",
  refSelectTarget: "Choisir une définition",
  refRootLabel: "Racine du document",
  refNoDefinitions: "Aucune définition dans ce document pour l'instant",
  refBrokenWarning:
    "Cette référence ne correspond à aucun schéma de ce document",
  refExternalInfo: "Référence externe — aperçu impossible ici",
  refExternalLoading: "Chargement du schéma externe…",
  refExternalError: "Impossible de charger le schéma externe :",
  refPreviewShow: "Afficher le schéma référencé",
  refPreviewHide: "Masquer le schéma référencé",
  definitionsTitle: "Définitions",
  definitionsDescription:
    "Schémas réutilisables pouvant être référencés ailleurs avec $ref",
  definitionAddButton: "Ajouter une définition",
  definitionNamePlaceholder: "p. ex. adresse, vehicule",
  definitionNameExists: "Une définition portant ce nom existe déjà",
  definitionBadge: "définition",

  schemaTypeArray: "Liste",
  schemaTypeBoolean: "Oui/Non",
  schemaTypeNumber: "Nombre",
  schemaTypeObject: "Objet",
  schemaTypeString: "Texte",
  schemaTypeNull: "Vide",

  inferrerTitle: "Déduire le schéma JSON",
  inferrerDescription:
    "Collez votre document JSON ci-dessous pour en générer un schéma.",
  inferrerCancel: "Annuler",
  inferrerGenerate: "Générer le schéma",
  inferrerErrorInvalidJson:
    "Format JSON invalide. Veuillez vérifier votre saisie.",

  validatorTitle: "Valider le JSON",
  validatorDescription:
    "Collez votre document JSON pour le valider par rapport au schéma actuel. La validation se produit automatiquement pendant que vous tapez.",
  validatorCurrentSchema: "Schéma actuel :",
  validatorContent: "Votre JSON :",
  validatorValid: "Le JSON est valide selon le schéma !",
  validatorErrorInvalidSyntax: "Syntaxe JSON invalide",
  validatorErrorSchemaValidation: "Erreur de validation du schéma",
  validatorErrorCount: "{count} erreurs de validation détectées",
  validatorErrorPathRoot: "Élément racine",
  validatorErrorLocationLineAndColumn: "Ligne {line}, Col {column}",
  validatorErrorLocationLineOnly: "Ligne {line}",

  visualizerDownloadTitle: "Télécharger le schéma",
  visualizerDownloadFileName: "schema.json",
  visualizerSource: "Source du schéma JSON",

  visualEditorNoFieldsHint1: "Aucun champ défini pour le moment",
  visualEditorNoFieldsHint2: "Ajoutez votre premier champ pour commencer",

  typeValidationErrorNegativeLength:
    "Les valeurs de longueur ne peuvent pas être négatives.",
  typeValidationErrorIntValue: "La valeur doit être un nombre entier.",
  typeValidationErrorPositive: "La valeur doit être positive.",
};

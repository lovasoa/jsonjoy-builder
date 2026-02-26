import type { Translation } from "../translation-keys.ts";

export const uk: Translation = {
  collapse: "Згорнути",
  expand: "Розгорнути",

  fieldDescriptionPlaceholder: "Опишіть призначення цього поля",
  fieldDelete: "Видалити поле",
  fieldDescription: "Опис",
  fieldDescriptionTooltip: "Додайте контекст про те, що представляє це поле",
  fieldNameLabel: "Назва поля",
  fieldNamePlaceholder: "наприклад, ім'я, вік, активне",
  fieldNameTooltip:
    "Використовуйте camelCase для кращої читабельності (наприклад, firstName)",
  fieldRequiredLabel: "Обов'язкове поле",
  fieldType: "Тип поля",
  fieldTypeExample: "Приклад:",
  fieldTypeTooltipString: "string: Текст",
  fieldTypeTooltipNumber: "number: Число",
  fieldTypeTooltipBoolean: "boolean: Так/Ні",
  fieldTypeTooltipObject: "object: Вкладений JSON",
  fieldTypeTooltipArray: "array: Списки значень",
  fieldAddNewButton: "Додати поле",
  fieldAddNewBadge: "Конструктор схем",
  fieldAddNewCancel: "Скасувати",
  fieldAddNewConfirm: "Додати поле",
  fieldAddNewDescription: "Створіть нове поле для вашої JSON схеми",
  fieldAddNewLabel: "Додати нове поле",

  fieldTypeTextLabel: "Текст",
  fieldTypeTextDescription: "Для текстових значень, таких як імена, описи тощо",
  fieldTypeNumberLabel: "Число",
  fieldTypeNumberDescription: "Для дробових або цілих чисел",
  fieldTypeBooleanLabel: "Так/Ні",
  fieldTypeBooleanDescription: "Для значень істина/хиба",
  fieldTypeObjectLabel: "Група",
  fieldTypeObjectDescription: "Для групування пов'язаних полів",
  fieldTypeArrayLabel: "Список",
  fieldTypeArrayDescription: "Для колекцій елементів",

  propertyDescriptionPlaceholder: "Додати опис...",
  propertyDescriptionButton: "Додати опис...",
  propertyRequired: "Обов'язкове",
  propertyRequiredToggleDisabledTooltip:
    "Обов'язкове може бути включено тільки для властивостей, визначених у розділі 'Звичайні властивості'",
  propertyOptional: "Необов'язкове",
  propertyDelete: "Видалити поле",

  schemaEditorTitle: "Редактор JSON-схем",
  schemaEditorToggleFullscreen: "Перемкнути повноекранний режим",
  schemaEditorEditModeVisual: "Візуальний",
  schemaEditorEditModeJson: "JSON",
  schemaEditorLoading: "Завантаження редактора...",

  arrayNoConstraint: "Без обмежень",
  arrayMinimumLabel: "Мінімум елементів",
  arrayMinimumPlaceholder: "Немає мінімуму",
  arrayMaximumLabel: "Максимум елементів",
  arrayMaximumPlaceholder: "Немає максимуму",
  arrayForceUniqueItemsLabel: "Лише унікальні елементи",
  arrayItemTypeLabel: "Тип елемента",
  arrayValidationErrorMinMax: "'minItems' не може бути більше за 'maxItems'.",
  arrayValidationErrorContainsMinMax:
    "'minContains' не може бути більше за 'maxContains'.",

  booleanNoConstraint: "Без обмежень",
  booleanAllowedValuesLabel: "Дозволені значення",
  booleanAllowFalseLabel: "Дозволити значення хиба",
  booleanAllowTrueLabel: "Дозволити значення істина",
  booleanNeitherWarning: "Увага: потрібно дозволити хоча б одне значення.",

  numberNoConstraint: "Без обмежень",
  numberMinimumLabel: "Мінімальне значення",
  numberMinimumPlaceholder: "Немає мінімуму",
  numberMaximumLabel: "Максимальне значення",
  numberMaximumPlaceholder: "Немає максимуму",
  numberExclusiveMinimumLabel: "Виключне мінімальне",
  numberExclusiveMinimumPlaceholder: "Немає виключного мінімуму",
  numberExclusiveMaximumLabel: "Виключне максимальне",
  numberExclusiveMaximumPlaceholder: "Немає виключного максимуму",
  numberMultipleOfLabel: "Кратно",
  numberMultipleOfPlaceholder: "Будь-яке",
  numberAllowedValuesEnumLabel: "Дозволені значення (enum)",
  numberAllowedValuesEnumNone: "Обмежених значень не задано",
  numberAllowedValuesEnumAddLabel: "Додати",
  numberAllowedValuesEnumAddPlaceholder: "Додати дозволене значення...",
  numberValidationErrorMinMax:
    "Мінімальне та максимальне значення повинні узгоджуватися.",
  numberValidationErrorBothExclusiveAndInclusiveMin:
    "Поля 'exclusiveMinimum' і 'minimum' не можуть бути встановлені одночасно.",
  numberValidationErrorBothExclusiveAndInclusiveMax:
    "Поля 'exclusiveMaximum' і 'maximum' не можуть бути встановлені одночасно.",
  numberValidationErrorEnumOutOfRange:
    "Значення enum повинні бути в межах визначеного діапазону.",

  objectPropertiesNone: "Властивості не визначені",
  objectValidationErrorMinMax:
    "'minProperties' не може бути більше за 'maxProperties'.",

  patternPropertiesTitle: "Властивості за шаблоном",
  patternPropertiesTitleShort: "Шаблон",
  patternPropertyNamePlaceholder: "^[a-z]+$",

  regularPropertiesTitle: "Звичайні властивості",
  regularPropertiesTitleShort: "Звичайні",

  additionalPropertiesAllow: "Дозволити додаткові властивості",
  additionalPropertiesForbid: "Заборонити додаткові властивості",
  additionalPropertiesTooltip:
    "Контролює, чи дозволені властивості, не визначені в 'properties' або 'patternProperties'",

  stringNoConstraint: "Без обмежень",
  stringMinimumLengthLabel: "Мінімальна довжина",
  stringMinimumLengthPlaceholder: "Немає мінімуму",
  stringMaximumLengthLabel: "Максимальна довжина",
  stringMaximumLengthPlaceholder: "Немає максимуму",
  stringPatternLabel: "Шаблон (regex)",
  stringPatternPlaceholder: "^[a-zA-Z]+$",
  stringFormatLabel: "Формат",
  stringFormatNone: "Не заданий",
  stringFormatDateTime: "Дата-Час",
  stringFormatDate: "Дата",
  stringFormatTime: "Час",
  stringFormatEmail: "Email",
  stringFormatUri: "URI",
  stringFormatUuid: "UUID",
  stringFormatHostname: "Ім'я хоста",
  stringFormatIpv4: "Адреса IPv4",
  stringFormatIpv6: "Адреса IPv6",
  stringAllowedValuesEnumLabel: "Дозволені значення (enum)",
  stringAllowedValuesEnumNone: "Обмежених значень не задано",
  stringAllowedValuesEnumAddPlaceholder: "Додати дозволене значення...",
  stringAllowedValuesEnumAddLabel: "Додати",
  stringFormatSelectPlaceholder: "Виберіть формат",
  stringValidationErrorLengthRange:
    "'Мінімальна довжина' не може бути більшою за 'Максимальну довжину'.",

  schemaTypeArray: "Список",
  schemaTypeBoolean: "Так/Ні",
  schemaTypeNumber: "Число",
  schemaTypeObject: "Об'єкт",
  schemaTypeString: "Текст",
  schemaTypeNull: "Пусто",

  inferrerTitle: "Вивести JSON-схему",
  inferrerDescription:
    "Вставте свій JSON-документ нижче, щоб згенерувати з нього схему.",
  inferrerCancel: "Скасувати",
  inferrerGenerate: "Згенерувати схему",
  inferrerErrorInvalidJson:
    "Неправильний формат JSON. Перевірте, будь ласка, введені дані.",

  validatorTitle: "Перевірити JSON",
  validatorDescription:
    "Вставте свій JSON-документ для перевірки проти поточної схеми. Перевірка відбувається автоматично під час введення.",
  validatorCurrentSchema: "Поточна схема:",
  validatorContent: "Ваш JSON:",
  validatorValid: "JSON відповідає схемі!",
  validatorErrorInvalidSyntax: "Неправильний синтаксис JSON",
  validatorErrorSchemaValidation: "Помилка валідації за схемою",
  validatorErrorCount: "Виявлено {count} помилок валідації",
  validatorErrorPathRoot: "Корінь",
  validatorErrorLocationLineAndColumn: "Рядок {line}, стовпець {column}",
  validatorErrorLocationLineOnly: "Рядок {line}",

  visualizerDownloadTitle: "Завантажити схему",
  visualizerDownloadFileName: "schema.json",
  visualizerSource: "Джерело JSON-схеми",

  visualEditorNoFieldsHint1: "Поки що не визначено жодне поле",
  visualEditorNoFieldsHint2: "Додайте перше поле, щоб почати",

  typeValidationErrorNegativeLength:
    "Значення довжини не можуть бути від'ємними.",
  typeValidationErrorIntValue: "Значення має бути цілим числом.",
  typeValidationErrorPositive: "Значення має бути додатнім.",
};

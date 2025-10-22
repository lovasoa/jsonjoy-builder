<div dir="rtl" lang="he">

# מדריך מעבר: <span dir="ltr">JSON Schema Draft 2020-12</span>

מדריך זה יעזור לך להמיר את סכמות ה-<span dir="ltr">JSON</span> שלך מגרסאות קודמות (<span dir="ltr">Draft-07</span> או <span dir="ltr">2019-09</span>) ל-<span dir="ltr">Draft 2020-12</span>.

## תוכן עניינים

- [סקירה כללית](#סקירה-כללית)
- [מעבר מ-<span dir="ltr">Draft-07</span>](#מעבר-מ-draft-07)
- [מעבר מ-<span dir="ltr">Draft 2019-09</span>](#מעבר-מ-draft-2019-09)
- [תכונות חדשות ב-<span dir="ltr">2020-12</span>](#תכונות-חדשות-ב-2020-12)
- [שינויים מהותיים](#שינויים-מהותיים)
- [שיטות עבודה מומלצות](#שיטות-עבודה-מומלצות)

## סקירה כללית

<span dir="ltr">JSON Schema Draft 2020-12</span> מציג מספר שיפורים ושינויים לעומת גרסאות קודמות. מדריך זה יעזור לך להבין מה צריך לעדכן בעת המרת הסכמות שלך.

### רשימת בדיקה למעבר מהיר

- [ ] עדכן <span dir="ltr">`$schema` URI</span> ל-<span dir="ltr">`https://json-schema.org/draft/2020-12/schema`</span>
- [ ] החלף <span dir="ltr">`definitions`</span> ב-<span dir="ltr">`$defs`</span>
- [ ] עדכן אימות <span dir="ltr">tuple</span> מ-<span dir="ltr">`items` array</span> ל-<span dir="ltr">`prefixItems`</span>
- [ ] החלף <span dir="ltr">`$recursiveRef`</span> ב-<span dir="ltr">`$dynamicRef`</span> (אם עובר מ-<span dir="ltr">2019-09</span>)
- [ ] בדוק ועדכן שימוש ב-<span dir="ltr">`unevaluatedProperties`</span> ו-<span dir="ltr">`unevaluatedItems`</span>

---

## מעבר מ-<span dir="ltr">Draft-07</span>

### 1. עדכון מזהה Schema

**לפני (<span dir="ltr">Draft-07</span>)**:

<div dir="ltr">

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```

</div>

**אחרי (<span dir="ltr">2020-12</span>)**:

<div dir="ltr">

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema"
}
```

</div>

### 2. החלפת `definitions` ב-`$defs`

**לפני (<span dir="ltr">Draft-07</span>)**:

<div dir="ltr">

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "user": { "$ref": "#/definitions/User" }
  },
  "definitions": {
    "User": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "age": { "type": "number" }
      }
    }
  }
}
```

</div>

**אחרי (<span dir="ltr">2020-12</span>)**:

<div dir="ltr">

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "user": { "$ref": "#/$defs/User" }
  },
  "$defs": {
    "User": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "age": { "type": "number" }
      }
    }
  }
}
```

</div>

### 3. עדכון אימות <span dir="ltr">Tuple</span> (מערך עם סוגים שונים)

**לפני (<span dir="ltr">Draft-07</span>)** - השתמש בצורת <span dir="ltr">array</span> של `items`:

<div dir="ltr">

```json
{
  "type": "array",
  "items": [
    { "type": "string" },
    { "type": "number" },
    { "type": "boolean" }
  ],
  "additionalItems": false
}
```

</div>

**אחרי (<span dir="ltr">2020-12</span>)** - השתמש ב-`prefixItems`:

<div dir="ltr">

```json
{
  "type": "array",
  "prefixItems": [
    { "type": "string" },
    { "type": "number" },
    { "type": "boolean" }
  ],
  "items": false
}
```

</div>

**שינויים מרכזיים**:
- צורת <span dir="ltr">array</span> של <span dir="ltr">`items`</span> → <span dir="ltr">`prefixItems`</span>
- <span dir="ltr">`additionalItems`</span> → <span dir="ltr">`items`</span> (<span dir="ltr">boolean</span> או <span dir="ltr">schema</span>)
- סמנטיקה מפורשת וברורה יותר

---

## מעבר מ-<span dir="ltr">Draft 2019-09</span>

### 1. עדכון מזהה Schema

**לפני (<span dir="ltr">2019-09</span>)**:

<div dir="ltr">

```json
{
  "$schema": "https://json-schema.org/draft/2019-09/schema"
}
```

</div>

**אחרי (<span dir="ltr">2020-12</span>)**:

<div dir="ltr">

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema"
}
```

</div>

### 2. החלפת הפניות רקורסיביות

**לפני (<span dir="ltr">2019-09</span>)** - השתמש ב-<span dir="ltr">`$recursiveRef`</span> ו-<span dir="ltr">`$recursiveAnchor`</span>:

<div dir="ltr">

```json
{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "$id": "https://example.com/tree",
  "$recursiveAnchor": true,
  "type": "object",
  "properties": {
    "value": { "type": "number" },
    "children": {
      "type": "array",
      "items": { "$recursiveRef": "#" }
    }
  }
}
```

</div>

**אחרי (<span dir="ltr">2020-12</span>)** - השתמש ב-<span dir="ltr">`$dynamicRef`</span> ו-<span dir="ltr">`$dynamicAnchor`</span>:

<div dir="ltr">

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/tree",
  "$dynamicAnchor": "node",
  "type": "object",
  "properties": {
    "value": { "type": "number" },
    "children": {
      "type": "array",
      "items": { "$dynamicRef": "#node" }
    }
  }
}
```

</div>

**שינויים מרכזיים**:
- <span dir="ltr">`$recursiveAnchor: true`</span> → <span dir="ltr">`$dynamicAnchor: "name"`</span>
- <span dir="ltr">`$recursiveRef: "#"`</span> → <span dir="ltr">`$dynamicRef: "#name"`</span>
- שימוש מפורש יותר עם עוגנים דינמיים

---

## תכונות חדשות ב-<span dir="ltr">2020-12</span>

### 1. אימות <span dir="ltr">Tuple</span> משופר עם `prefixItems`

הגדר <span dir="ltr">schemas</span> למיקומים ספציפיים במערך:

<div dir="ltr">

```json
{
  "type": "array",
  "prefixItems": [
    { "type": "string", "description": "Name" },
    { "type": "number", "minimum": 0, "description": "Age" },
    { "type": "string", "format": "email", "description": "Email" }
  ],
  "items": { "type": "string" },
  "minItems": 3
}
```

</div>

**תקין**: <span dir="ltr">`["ישראל", 30, "israel@example.com", "extra", "strings", "allowed"]`</span>

**לא תקין**: <span dir="ltr">`["ישראל", "שלושים", "israel@example.com"]`</span> (פריט שני חייב להיות <span dir="ltr">number</span>)

### 2. הפניות דינמיות ל-<span dir="ltr">schemas</span> הניתנים להרחבה

צור <span dir="ltr">schemas</span> שניתן להרחיב:

<div dir="ltr">

```json
{
  "$id": "https://example.com/base-node",
  "$dynamicAnchor": "node",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "children": {
      "type": "array",
      "items": { "$dynamicRef": "#node" }
    }
  }
}
```

</div>

הרחב ב-<span dir="ltr">schema</span> אחר:

<div dir="ltr">

```json
{
  "$id": "https://example.com/extended-node",
  "$dynamicAnchor": "node",
  "allOf": [
    { "$ref": "https://example.com/base-node" }
  ],
  "properties": {
    "customField": { "type": "string" }
  }
}
```

</div>

### 3. `unevaluatedProperties` משופר

עובד נכון עם הרכבת <span dir="ltr">schema</span>:

<div dir="ltr">

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" }
  },
  "allOf": [
    {
      "properties": {
        "age": { "type": "number" }
      }
    }
  ],
  "unevaluatedProperties": false
}
```

</div>

**תקין**: <span dir="ltr">`{ "name": "ישראל", "age": 30 }`</span>

**לא תקין**: <span dir="ltr">`{ "name": "ישראל", "age": 30, "extra": "לא מותר" }`</span>

גם <span dir="ltr">`name`</span> וגם <span dir="ltr">`age`</span> מוערכים (על ידי <span dir="ltr">`properties`</span> ו-<span dir="ltr">`allOf`</span>), ולכן הם מותרים. אבל <span dir="ltr">`extra`</span> לא מוערך ואסור.

### 4. אימות מותנה (זמין ב-<span dir="ltr">Draft-07+</span>)

<div dir="ltr">

```json
{
  "type": "object",
  "properties": {
    "country": { "type": "string" },
    "postal_code": { "type": "string" }
  },
  "if": {
    "properties": {
      "country": { "const": "Israel" }
    }
  },
  "then": {
    "properties": {
      "postal_code": { "pattern": "^[0-9]{7}$" }
    }
  },
  "else": {
    "properties": {
      "postal_code": { "minLength": 4, "maxLength": 10 }
    }
  }
}
```

</div>

---

## שינויים מהותיים

### 1. התנהגות <span dir="ltr">keyword `items`</span>

ב-<span dir="ltr">Draft-07</span> וקודם, <span dir="ltr">`items`</span> יכול היה להיות:
- <span dir="ltr">schema</span> (חל על כל הפריטים)
- <span dir="ltr">array</span> של <span dir="ltr">schemas</span> (אימות <span dir="ltr">tuple</span>)

ב-<span dir="ltr">2020-12</span>, `items`:
- מקבל רק <span dir="ltr">schema</span> (לא <span dir="ltr">array</span>)
- חל רק על פריטים שלא מכוסים על ידי <span dir="ltr">`prefixItems`</span>

### 2. <span dir="ltr">Format Vocabulary</span>

ב-<span dir="ltr">Draft-07</span>, `format` היה <span dir="ltr">assertion</span> (אימות).

ב-<span dir="ltr">2020-12</span>, `format` הוא <span dir="ltr">annotation</span> כברירת מחדל (<span dir="ltr">metadata</span>).

כדי להפעיל <span dir="ltr">format</span> כ-<span dir="ltr">assertion</span>, הצהר על ה-<span dir="ltr">vocabulary</span>:

<div dir="ltr">

```json
{
  "$vocabulary": {
    "https://json-schema.org/draft/2020-12/vocab/format-assertion": true
  }
}
```

</div>

### 3. `$recursiveRef` הוסר

אם עובר מ-<span dir="ltr">2019-09</span>, החלף <span dir="ltr">`$recursiveRef`</span> ב-<span dir="ltr">`$dynamicRef`</span>.

---

## שיטות עבודה מומלצות

### 1. תמיד ציין `$schema`

<div dir="ltr">

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object"
}
```

</div>

### 2. השתמש ב-`prefixItems` ל-<span dir="ltr">Tuples</span>

כאשר לפריטי <span dir="ltr">array</span> יש <span dir="ltr">types</span> שונים או כללי אימות שונים:

<div dir="ltr">

```json
{
  "type": "array",
  "prefixItems": [
    { "type": "string" },
    { "type": "number" }
  ],
  "items": false
}
```

</div>

### 3. העדף `$defs` על `definitions`

<div dir="ltr">

```json
{
  "$defs": {
    "User": { "type": "object" }
  },
  "properties": {
    "user": { "$ref": "#/$defs/User" }
  }
}
```

</div>

### 4. השתמש ב-`unevaluatedProperties` עם הרכבה

<div dir="ltr">

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" }
  },
  "allOf": [
    {
      "properties": {
        "age": { "type": "number" }
      }
    }
  ],
  "unevaluatedProperties": false
}
```

</div>

זה חזק יותר מ-<span dir="ltr">`additionalProperties: false`</span> כי הוא מאפשר <span dir="ltr">properties</span> מהרכבה.

### 5. השתמש באימות מותנה

<div dir="ltr">

```json
{
  "if": { "properties": { "type": { "const": "personal" } } },
  "then": { "required": ["age"] },
  "else": { "required": ["company"] }
}
```

</div>

---

## דפוסי מעבר נפוצים

### דפוס 1: קואורדינטות (<span dir="ltr">Tuple</span>)

**<span dir="ltr">Draft-07</span>**:

<div dir="ltr">

```json
{
  "type": "array",
  "items": [
    { "type": "number" },
    { "type": "number" }
  ],
  "additionalItems": false
}
```

</div>

**<span dir="ltr">2020-12</span>**:

<div dir="ltr">

```json
{
  "type": "array",
  "prefixItems": [
    { "type": "number" },
    { "type": "number" }
  ],
  "items": false
}
```

</div>

### דפוס 2: אימות תלוי

**<span dir="ltr">Draft-07</span>** (משתמש ב-`dependencies`):

<div dir="ltr">

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "credit_card": { "type": "string" }
  },
  "dependencies": {
    "credit_card": ["billing_address"]
  }
}
```

</div>

**<span dir="ltr">2020-12</span>** (משתמש ב-`dependentSchemas`):

<div dir="ltr">

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "credit_card": { "type": "string" }
  },
  "dependentSchemas": {
    "credit_card": {
      "properties": {
        "billing_address": { "type": "string" },
        "cvv": { "type": "string", "pattern": "^[0-9]{3,4}$" }
      },
      "required": ["billing_address", "cvv"]
    }
  }
}
```

</div>

---

## מעבר אוטומטי

ניתן להשתמש ב-<span dir="ltr">UI</span> של <span dir="ltr">jsonjoy-builder</span> להמרה אוטומטית של <span dir="ltr">schemas</span>:

1. הדבק את ה-<span dir="ltr">schema</span> שלך מ-<span dir="ltr">Draft-07</span> או <span dir="ltr">2019-09</span>
2. בחר את גרסת היעד (<span dir="ltr">2020-12</span>)
3. ה-<span dir="ltr">schema</span> יעודכן אוטומטית

או השתמש בכלי ההמרה:

<div dir="ltr">

```typescript
import { migrateToSchema202012 } from 'jsonjoy-builder/utils/schema-migrator';

const oldSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": { ... },
  // ...
};

const newSchema = migrateToSchema202012(oldSchema, 'draft-07');
```

</div>

---

## בדיקת ה-<span dir="ltr">Schema</span> שהומר

לאחר ההמרה, אמת את ה-<span dir="ltr">schema</span> שלך:

### 1. אמת עם <span dir="ltr">Ajv</span>:

<div dir="ltr">

```typescript
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

const ajv = new Ajv2020();
addFormats(ajv);

const validate = ajv.compile(yourSchema);
const valid = validate(yourData);
```

</div>

### 2. השתמש ב-<span dir="ltr">validator</span> של <span dir="ltr">jsonjoy-builder</span>:

- הדבק את ה-<span dir="ltr">schema</span> שלך
- הדבק את נתוני הבדיקה שלך
- לחץ על "Validate JSON"
- ודא שהאימות עובד כצפוי

### 3. בדוק מקרי קצה:

- בדוק עם נתונים תקינים
- בדוק עם נתונים לא תקינים
- בדוק תנאי גבול
- בדוק עם שדות אופציונליים חסרים

---

## צריך עזרה?

- <span dir="ltr">[JSON Schema 2020-12 Specification](https://json-schema.org/draft/2020-12/json-schema-core.html)</span>
- <span dir="ltr">[Understanding JSON Schema](https://json-schema.org/understanding-json-schema/)</span>
- <span dir="ltr">[Ajv Documentation](https://ajv.js.org/)</span>
- <span dir="ltr">[jsonjoy-builder GitHub Issues](https://github.com/lovasoa/jsonjoy-builder/issues)</span>

---

**עודכן לאחרונה**: <span dir="ltr">2025-10-22</span>

**גרסה**: <span dir="ltr">1.0</span>

**מחבר ה-<span dir="ltr">fork</span> המשופר**: <span dir="ltr">[@usercourses63](https://github.com/usercourses63)</span>

</div>
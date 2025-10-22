<div dir="rtl" lang="he">

# בונה JSON Schema

[![image](https://github.com/user-attachments/assets/6be1cecf-e0d9-4597-ab04-7124e37e332d)](https://json.ophir.dev)

עורך ויזואלי מודרני מבוסס <span dir="ltr">React</span> ליצירה ועריכה של הגדרות <span dir="ltr">JSON Schema</span> עם ממשק אינטואיטיבי.

**נסה באינטרנט**: <span dir="ltr">https://json.ophir.dev</span>

## תכונות

- **עורך Schema ויזואלי**: עצב את ה-<span dir="ltr">JSON Schema</span> שלך דרך ממשק אינטואיטיבי מבלי לכתוב <span dir="ltr">JSON</span> ידנית
- **תצוגת JSON בזמן אמת**: ראה את ה-<span dir="ltr">schema</span> שלך בפורמט <span dir="ltr">JSON</span> בזמן שאתה בונה אותו ויזואלית
- **היסק Schema**: צור <span dir="ltr">schemas</span> אוטומטית מנתוני <span dir="ltr">JSON</span> קיימים
- **אימות JSON**: בדוק נתוני <span dir="ltr">JSON</span> מול ה-<span dir="ltr">schema</span> שלך עם משוב מפורט
- **עיצוב רספונסיבי**: ממשק מלא רספונסיבי שעובד על <span dir="ltr">desktop</span> ו-<span dir="ltr">mobile</span>
- **🆕 תמיכה ב-<span dir="ltr">JSON Schema Draft 2020-12</span>**: תמיכה מלאה במפרט ה-<span dir="ltr">JSON Schema</span> העדכני ביותר
- **🆕 תמיכה מרובת גרסאות**: מעבר בין <span dir="ltr">Draft-07, 2019-09,</span> ו-<span dir="ltr">2020-12</span>
- **🆕 <span dir="ltr">keywords</span> מתקדמים**: עורכים ויזואליים לאימות מותנה, הרכבה, הפניות דינמיות ועוד
- **🌍 בינלאומיות**: תמיכה באנגלית, עברית, גרמנית, צרפתית ורוסית

## תמיכה ב-<span dir="ltr">JSON Schema Draft 2020-12</span>

<span dir="ltr">fork</span> זה כולל תמיכה מלאה ב-<span dir="ltr">JSON Schema Draft 2020-12</span>, המפרט העדכני ביותר.

### תכונות חדשות ב-<span dir="ltr">2020-12</span>

#### ✨ אימות <span dir="ltr">Tuple</span> עם `prefixItems`

הגדר <span dir="ltr">schemas</span> למיקומים ספציפיים במערך:

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

#### ✨ הפניות דינמיות (<span dir="ltr">`$dynamicRef` & `$dynamicAnchor`</span>)

צור <span dir="ltr">schemas</span> הניתנים להרחבה עם הרכבה דינמית:

<div dir="ltr">

```json
{
  "$dynamicAnchor": "node",
  "type": "object",
  "properties": {
    "children": {
      "type": "array",
      "items": { "$dynamicRef": "#node" }
    }
  }
}
```

</div>

#### ✨ `unevaluatedProperties` משופר

עובד נכון עם הרכבת <span dir="ltr">schema</span> (<span dir="ltr">allOf/anyOf/oneOf</span>):

<div dir="ltr">

```json
{
  "properties": { "name": { "type": "string" } },
  "allOf": [
    { "properties": { "age": { "type": "number" } } }
  ],
  "unevaluatedProperties": false
}
```

</div>

#### ✨ אימות מותנה (<span dir="ltr">if/then/else</span>)

<div dir="ltr">

```json
{
  "if": { "properties": { "country": { "const": "Israel" } } },
  "then": { "properties": { "postal_code": { "pattern": "^[0-9]{7}$" } } },
  "else": { "properties": { "postal_code": { "minLength": 4 } } }
}
```

</div>

### גרסאות נתמכות

- **<span dir="ltr">Draft-07 (2018)</span>** - בסיס יציב עם <span dir="ltr">if/then/else</span>
- **<span dir="ltr">Draft 2019-09</span>** - מוסיף <span dir="ltr">dependentSchemas</span> ותמיכה בסיסית ב-<span dir="ltr">unevaluated</span>
- **<span dir="ltr">Draft 2020-12</span> (אחרון)** - מערך תכונות מלא כולל <span dir="ltr">prefixItems</span> והפניות דינמיות

עבור בין גרסאות באמצעות ה-<span dir="ltr">selector</span> בכותרת העורך.

### מדריכי מעבר

- 📄 <span dir="ltr">[English Migration Guide](./MIGRATION-GUIDE.md)</span>
- 📄 <span dir="ltr">[מדריך מעבר בעברית](./MIGRATION-GUIDE.he.md)</span>

### עורכים ויזואליים ל-<span dir="ltr">keywords</span> מתקדמים

- **אימות מותנה** - עורך <span dir="ltr">if/then/else</span>
- **הרכבת <span dir="ltr">Schema</span>** - עורך <span dir="ltr">allOf/anyOf/oneOf/not</span>
- **אימות <span dir="ltr">Tuple</span>** - עורך <span dir="ltr">prefixItems (2020-12)</span>
- **הפניות דינמיות** - עורך <span dir="ltr">$dynamicRef/$dynamicAnchor (2020-12)</span>
- **<span dir="ltr">Schemas</span> תלויים** - אימות תלוי-<span dir="ltr">property (2019-09+)</span>
- **<span dir="ltr">Properties/Items</span> לא מוערכים** - בקרת אימות מתקדמת <span dir="ltr">(2019-09+)</span>

כל העורכים המתקדמים תומכים במצבי עריכה <span dir="ltr">Visual</span> וגם <span dir="ltr">JSON</span>.

## התחלת עבודה

### התקנה

<div dir="ltr">

```bash
npm install jsonjoy-builder
```

</div>

התקן גם <span dir="ltr">react</span> אם עדיין לא עשית זאת.

אז השתמש כך:

<div dir="ltr">

```jsx
import "jsonjoy-builder/styles.css";
import { type JSONSchema, SchemaVisualEditor } from "jsonjoy-builder";
import { useState } from "react";

export function App() {
  const [schema, setSchema] = useState<JSONSchema>({});
  return (
    <div>
      <h1>JSONJoy Builder</h1>
      <SchemaVisualEditor schema={schema} onChange={setSchema}/>
    </div>
  );
}
```

</div>

### עיצוב

לעיצוב הקומפוננטה, הוסף <span dir="ltr">CSS</span> מותאם אישית. לעיצוב בסיסי, יש <span dir="ltr">properties</span> של <span dir="ltr">CSS</span> ("משתנים") שניתן להגדיר:

<div dir="ltr">

```css
.jsonjoy {
  --jsonjoy-background: #f8fafc;
  --jsonjoy-foreground: #020817;
  --jsonjoy-card: #fff;
  --jsonjoy-primary: #0080ff;
  /* ... */
}
.jsonjoy.dark {
  /* אותם משתנים, אבל למצב dark */
}
```

</div>

### לוקליזציה

כברירת מחדל, העורך משתמש באנגלית. ללוקליזציה, עליך להגדיר שפה דרך <span dir="ltr">`TranslationContext`</span>:

<div dir="ltr">

```jsx
import "jsonjoy-builder/styles.css";
import { type JSONSchema, SchemaVisualEditor, TranslationContext, he } from "jsonjoy-builder";
import { useState } from "react";

export function App() {
  const [schema, setSchema] = useState<JSONSchema>({});
  return (
    <TranslationContext value={he}>
      <SchemaVisualEditor schema={schema} onChange={setSchema}/>
    </TranslationContext>
  );
}
```

</div>

כרגע יש לנו לוקליזציות עבור:
- 🇬🇧 אנגלית <span dir="ltr">(en) - English</span>
- 🇮🇱 עברית <span dir="ltr">(he) - Hebrew</span>
- 🇩🇪 גרמנית <span dir="ltr">(de) - Deutsch</span>
- 🇫🇷 צרפתית <span dir="ltr">(fr) - Français</span>
- 🇷🇺 רוסית <span dir="ltr">(ru) - Русский</span>

ניתן להגדיר תרגום משלך כך. אם תעשה זאת, שקול לפתוח <span dir="ltr">PR</span> עם התרגומים!

<div dir="ltr">

```ts
import { type Translation } from "jsonjoy-builder";

const es: Translation = {
  // הוסף תרגומים כאן (ראה type Translation למפתחות הזמינים וערכי ברירת המחדל)
};
```

</div>

ראה גם את <span dir="ltr">[קובץ הלוקליזציה האנגלית](https://github.com/lovasoa/jsonjoy-builder/blob/main/src/i18n/locales/en.ts)</span> ללוקליזציות ברירת המחדל.

### פיתוח

<div dir="ltr">

```bash
git clone https://github.com/lovasoa/jsonjoy-builder.git
cd jsonjoy-builder
npm install
```

</div>

הפעל את שרת הפיתוח:

<div dir="ltr">

```bash
npm run dev
```

</div>

אפליקציית הדמו תהיה זמינה ב-<span dir="ltr">http://localhost:5173</span>

### בנייה לפרודקשן

בנה ספרייה זו לפרודקשן:

<div dir="ltr">

```bash
npm run build
```

</div>

הקבצים הבנויים יהיו זמינים בתיקיית <span dir="ltr">`dist`</span>.

## ארכיטקטורת הפרויקט

### קומפוננטות ליבה

- **<span dir="ltr">JsonSchemaEditor</span>**: הקומפוננטה הראשית המספקת <span dir="ltr">tabs</span> למעבר בין תצוגות ויזואלי ו-<span dir="ltr">JSON</span>
- **<span dir="ltr">SchemaVisualEditor</span>**: מטפל בייצוג ועריכה ויזואלית של <span dir="ltr">schemas</span>
- **<span dir="ltr">JsonSchemaVisualizer</span>**: מספק תצוגת <span dir="ltr">JSON</span> עם עורך <span dir="ltr">Monaco</span> לעריכה ישירה של <span dir="ltr">schema</span>
- **<span dir="ltr">SchemaInferencer</span>**: קומפוננטת דיאלוג ליצירת <span dir="ltr">schemas</span> מנתוני <span dir="ltr">JSON</span>
- **<span dir="ltr">JsonValidator</span>**: קומפוננטת דיאלוג לאימות <span dir="ltr">JSON</span> מול ה-<span dir="ltr">schema</span> הנוכחי

### תכונות מרכזיות

#### היסק Schema

קומפוננטת <span dir="ltr">`SchemaInferencer`</span> יכולה ליצור אוטומטית הגדרות <span dir="ltr">JSON Schema</span> מנתוני <span dir="ltr">JSON</span> קיימים. תכונה זו משתמשת במערכת היסק מבוססת רקורסיה לזיהוי:

- מבני <span dir="ltr">object</span> ו-<span dir="ltr">properties</span>
- סוגי <span dir="ltr">array</span> ו-<span dir="ltr">schemas</span> של הפריטים שלהם
- פורמטים של <span dir="ltr">string</span> (תאריכים, <span dir="ltr">emails</span>, <span dir="ltr">URIs</span>)
- סוגים מספריים (<span dir="ltr">integers</span> מול <span dir="ltr">floats</span>)
- שדות חובה

#### אימות JSON

אמת כל מסמך <span dir="ltr">JSON</span> מול ה-<span dir="ltr">schema</span> שלך עם:
- משוב בזמן אמת
- דיווח שגיאות מפורט
- אימות <span dir="ltr">format</span> עבור <span dir="ltr">emails</span>, תאריכים ופורמטים מיוחדים אחרים

## מחסנית טכנולוגית

- **<span dir="ltr">React</span>**: <span dir="ltr">framework UI</span>
- **<span dir="ltr">TypeScript</span>**: פיתוח <span dir="ltr">type-safe</span>
- **<span dir="ltr">Rsbuild / Rslib</span>**: כלי <span dir="ltr">build</span> ושרת פיתוח
- **<span dir="ltr">ShadCN UI</span>**: ספריית קומפוננטות
- **<span dir="ltr">Monaco Editor</span>**: עורך קוד לצפייה/עריכה של <span dir="ltr">JSON</span>
- **<span dir="ltr">Ajv</span>**: אימות <span dir="ltr">JSON Schema</span>
- **<span dir="ltr">Zod</span>**: ניתוח <span dir="ltr">json type-safe</span> ב-<span dir="ltr">ts</span>
- **<span dir="ltr">Lucide Icons</span>**: ספריית אייקונים
- **<span dir="ltr">Node.js Test Runner</span>**: בדיקות מובנות פשוטות

## סקריפטים לפיתוח

| פקודה | תיאור |
|---------|-------------|
| <span dir="ltr">`npm run dev`</span> | הפעל שרת פיתוח |
| <span dir="ltr">`npm run build`</span> | בנה לפרודקשן |
| <span dir="ltr">`npm run build:dev`</span> | בנה עם הגדרות פיתוח |
| <span dir="ltr">`npm run lint`</span> | הרץ <span dir="ltr">linter</span> |
| <span dir="ltr">`npm run format`</span> | פרמט קוד |
| <span dir="ltr">`npm run check`</span> | בדיקת <span dir="ltr">type</span> של הפרויקט |
| <span dir="ltr">`npm run fix`</span> | תקן בעיות <span dir="ltr">linting</span> |
| <span dir="ltr">`npm run typecheck`</span> | בדיקת <span dir="ltr">type</span> עם <span dir="ltr">TypeScript</span> |
| <span dir="ltr">`npm run preview`</span> | תצוגה מקדימה של <span dir="ltr">build</span> פרודקשן |
| <span dir="ltr">`npm run test`</span> | הרץ בדיקות |

## תיעוד

- 📖 <span dir="ltr">[English README](./README.md)</span>
- 📖 <span dir="ltr">[Hebrew README - קרא אותי בעברית](./README.he.md)</span> (קובץ זה)
- 📄 <span dir="ltr">[Migration Guide (English)](./MIGRATION-GUIDE.md)</span>
- 📄 <span dir="ltr">[מדריך מעבר (Hebrew)](./MIGRATION-GUIDE.he.md)</span>
- 📄 <span dir="ltr">[Feature Documentation](./README-features.md)</span>

## תרומה

תרומות יתקבלו בברכה! אנא אל תהסס להגיש <span dir="ltr">Pull Request</span>.

## מחברים

**מחבר מקורי**: <span dir="ltr">[@ophir.dev](https://ophir.dev) - [lovasoa/jsonjoy-builder](https://github.com/lovasoa/jsonjoy-builder)</span>

**<span dir="ltr">fork</span> משופר עם תמיכה ב-<span dir="ltr">JSON Schema 2020-12</span>**: <span dir="ltr">[@usercourses63](https://github.com/usercourses63) - [usercourses63/jsonjoy-builder](https://github.com/usercourses63/jsonjoy-builder)</span>

### תכונות ה-<span dir="ltr">fork</span> המשופר
- ✅ תמיכה מלאה ב-<span dir="ltr">JSON Schema Draft 2020-12</span>
- ✅ אימות רב-גרסאות (<span dir="ltr">Draft-07, 2019-09, 2020-12</span>)
- ✅ 7 עורכי <span dir="ltr">keywords</span> מתקדמים עם מעבר <span dir="ltr">Visual/JSON</span>
- ✅ תצוגה מותנית לפי גרסת <span dir="ltr">draft</span>
- ✅ בינלאומיות מלאה (5 שפות)
- ✅ מדריכי מעבר מקיפים (אנגלית + עברית)
- ✅ ירושת <span dir="ltr">draft prop</span> ל-<span dir="ltr">schemas</span> מקוננים
- ✅ מצב עריכה ויזואלי לכל ה-<span dir="ltr">schemas</span> המקוננים

## רישיון

פרויקט זה מורשה תחת רישיון <span dir="ltr">MIT</span> - ראה את קובץ <span dir="ltr">LICENSE</span> לפרטים.

</div>
/**
 * Schema Version Selector Component
 * Allows selection of JSON Schema draft version
 * Supports Draft-07, 2019-09, and 2020-12
 */

import type { FC } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select.tsx";
import type { JSONSchemaDraft } from "../utils/schema-version.ts";
import { getDraftDisplayName, getSupportedDrafts } from "../utils/schema-version.ts";

export interface SchemaVersionSelectorProps {
  version: JSONSchemaDraft;
  onChange: (version: JSONSchemaDraft) => void;
  className?: string;
}

/**
 * SchemaVersionSelector Component
 * Dropdown selector for JSON Schema draft versions
 */
const SchemaVersionSelector: FC<SchemaVersionSelectorProps> = ({
  version,
  onChange,
  className,
}) => {
  const supportedDrafts = getSupportedDrafts();

  return (
    <div className={className}>
      <Select
        value={version}
        onValueChange={(value) => onChange(value as JSONSchemaDraft)}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue>{getDraftDisplayName(version)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {supportedDrafts.map((draft) => (
            <SelectItem key={draft} value={draft}>
              {getDraftDisplayName(draft)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SchemaVersionSelector;
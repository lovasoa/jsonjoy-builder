import type { TypeEditorProps } from "../TypeEditor.tsx";
import CombinatorEditor from "./CombinatorEditor.tsx";

const AnyOfEditor: React.FC<TypeEditorProps> = (props) => (
  <CombinatorEditor {...props} combinator="anyOf" />
);

export default AnyOfEditor;

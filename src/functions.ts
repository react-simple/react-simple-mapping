import { isString } from "@react-simple/react-simple-util";
import { REACT_SIMPLE_MAPPING } from "data";
import { FullQualifiedName } from "objectModel/types";

// childPath must lie below parentPath (for example, parentPath: details.addresses, childPath: details.addresses[0].city)
// Empty parentPath is considered to be the root path. (It does not understand any prefixes like "/".)
const isFullQualifiedMemberNameParentChild_default = (parentPath: string, childPath: string, bidirectional = false) => {
  return (
    !parentPath ||
    (parentPath.length === childPath.length && parentPath === childPath) ||
    (childPath.startsWith(parentPath) && (childPath[parentPath.length] === "." || childPath[parentPath.length] === "[")) ||
    (bidirectional && parentPath.startsWith(childPath) && (parentPath[childPath.length] === "." || parentPath[childPath.length] === "["))
  );
};

REACT_SIMPLE_MAPPING.DI.helpers.isFullQualifiedMemberNameParentChild = isFullQualifiedMemberNameParentChild_default;

// either path1 lies below path2 or path2 lies below path1 (startsWith() one way or another)
export const isFullQualifiedMemberNameParentChild = (parentPath: string, childPath: string, bidirectional = false) => {  
  return REACT_SIMPLE_MAPPING.DI.helpers.isFullQualifiedMemberNameParentChild(parentPath, childPath, bidirectional, isFullQualifiedMemberNameParentChild_default);
};

export function splitFullQualifiedName(
  fullQualifiedName: string | FullQualifiedName,
  options?: {
    splitArrayIndexers?: boolean; // returns ["array[0]"] or ["array", "[0]"]
    unwrapArrayIndexers?: boolean; // returns ["array", "[0]"] or ["array", "0"]
  }
): string[] {
  return (
    !isString(fullQualifiedName) ? splitFullQualifiedName(fullQualifiedName.fullQualifiedName, options) :
      !fullQualifiedName ? [] :
        (
          options?.unwrapArrayIndexers ? fullQualifiedName.replaceAll("[", ".").replaceAll("]", "") :
            options?.splitArrayIndexers ? fullQualifiedName.replace("[", ".[") :
              fullQualifiedName
        ).split(".")
  );
}

export const getNameFromFullQualifiedName = (fullQualifiedName: string) => {
  if (!fullQualifiedName) {
    return "";
  }
  else { 
    const i = fullQualifiedName.lastIndexOf(".");
    return i >= 0 ? fullQualifiedName.substring(i + 1) : fullQualifiedName;
  }
};

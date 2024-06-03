import { REACT_SIMPLE_MAPPING } from "data";

// childPath must lie below parentPath (for example, parentPath: details.addresses, childPath: details.addresses[0].city)
// Empty parentPath is considered to be the root path. (It does not understand any prefixes like "/".)
const fullQualifiedMemberNameMatchSubTree_default = (parentPath: string, childPath: string, bidirectional = false) => {
  return (
    !parentPath ||
    (parentPath.length === childPath.length && parentPath === childPath) ||
    (childPath.startsWith(parentPath) && (childPath[parentPath.length] === "." || childPath[parentPath.length] === "[")) ||
    (bidirectional && parentPath.startsWith(childPath) && (parentPath[childPath.length] === "." || parentPath[childPath.length] === "["))
  );
};

REACT_SIMPLE_MAPPING.DI.helpers.fullQualifiedMemberNameMatchSubTree = fullQualifiedMemberNameMatchSubTree_default;

// either path1 lies below path2 or path2 lies below path1 (startsWith() one way or another)
export const fullQualifiedMemberNameMatchSubTree = (parentPath: string, childPath: string, bidirectional = false) => {  
  return REACT_SIMPLE_MAPPING.DI.helpers.fullQualifiedMemberNameMatchSubTree(parentPath, childPath, bidirectional, fullQualifiedMemberNameMatchSubTree_default);
};

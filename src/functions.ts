import { REACT_SIMPLE_MAPPING } from "data";

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

// either path1 lies below path2 or path2 lies below path1 (startsWith() one way or another)
export const fullQualifiedMemberNameMatchSubTree = (path1: string, path2: string) => {
  return path1.startsWith(path2) || path2.startsWith(path1);
};

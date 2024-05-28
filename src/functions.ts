export const fullQualifiedMemberNameMatch = (path1: string, path2: string) => {
  return path1.startsWith(path2) || path2.startsWith(path1);
};

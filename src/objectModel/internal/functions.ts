import { forEachReverse, isArray, isEmptyObject } from "@react-simple/react-simple-util";
import { splitFullQualifiedName } from "functions";
import {
  DeleteChildMemberOptions, FullQualifiedName, GetChildMemberValueOptions, ObjectWithFullQualifiedName, SetChildMemberValueOptions   
} from "objectModel/types";

// these functions are not exported by the package

export function getChildMemberRootObjAndPath(
  startObj: object,
  fullQualifiedName: string,
  options: GetChildMemberValueOptions
): {
  obj: any;
  path?: string[];
} {
  if (!startObj) {
    return { obj: undefined };
  }

  const path = splitFullQualifiedName(fullQualifiedName);

  if (!path.length) {
    return { obj: startObj, path };
  }

  let obj: any = startObj;

  // check root obj
  if (path[0].startsWith("/")) {
    obj = options.rootObj; // if undefined the caller will return undefined
    path[0] = path[0].substring(1);
  }
  // check named obj
  else if (path[0].startsWith("@")) {
    obj = options.getNamedObj?.(path[0].substring(1)); // if undefined the caller will return undefined
    path.splice(0, 1);
  }

  return { obj, path };
}

export function getChildMemberInfoCallbacks(
  options:
    | GetChildMemberValueOptions
    | SetChildMemberValueOptions
    | DeleteChildMemberOptions
    = {}
): Required<
  & Pick<GetChildMemberValueOptions, "getMemberValue">
  & Pick<SetChildMemberValueOptions, "setMemberValue">
  & Pick<SetChildMemberValueOptions, "createMember">
  & {
    deleteMember?: (
      obj: object,
      names: FullQualifiedName,
      parents: ObjectWithFullQualifiedName[],
      deleteEmptyParents: boolean
    ) => void;
  }
> {
  return {
    getMemberValue: options.getMemberValue || ((parent, names) => names.name ? (parent as any)[names.name] : parent),

    setMemberValue: (options as SetChildMemberValueOptions).setMemberValue || (
      (parent, names, value) => {
        (parent as any)[names.name] = value;
      }
    ),

    createMember: (options as SetChildMemberValueOptions).createMember || (() => ({})),

    // delete specified member and if requested delete all empty parents recursively
    deleteMember: (parent, names, parents, deleteEmptyParents) => {
      const deleteLocal = (options as DeleteChildMemberOptions).deleteMember || (
        (tparent, tname) => {
          delete (tparent as any)[tname.name];
        });
      
      const canDeleteObject = (options as DeleteChildMemberOptions).canDeleteMember || (() => true);
      deleteLocal(parent, names);

      if (deleteEmptyParents) {
        let obj = parent;

        forEachReverse(parents, objParent => {
          // if the child object became empty but it's in an array we won't remove it
          if (!isArray(obj) && isEmptyObject(obj) && canDeleteObject(objParent.obj, names)) {
            deleteLocal(objParent.obj, names);
          }

          obj = objParent.obj;
          names = objParent.names;
        });
      }
    }
  };
}

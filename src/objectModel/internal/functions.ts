import { ValueOrArray, forEachReverse, getResolvedArray, isArray, isEmptyObject } from "@react-simple/react-simple-util";
import {
  DeleteChildMemberOptions, FullQualifiedName, GetChildMemberValueOptions, ObjectWithFullQualifiedName, SetChildMemberValueOptions   
} from "objectModel/types";

// these functions are not exported by the package

export function getChildMemberRootObjAndPath(
  startObj: object,
  fullQualifiedName: ValueOrArray<string>,
  options: GetChildMemberValueOptions
): {
  obj: any;
  path?: string[];
} {
  if (!startObj) {
    return { obj: startObj };
  }

  const path = getResolvedArray(fullQualifiedName, t => t.split(options.pathSeparator || "."));

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
      options: DeleteChildMemberOptions,      
      parents: ObjectWithFullQualifiedName[],
      deleteEmptyParents: boolean
    ) => void;
  }
> {
  return {
    getMemberValue: options.getMemberValue || ((parent, names) => (parent as any)[names.name]),

    setMemberValue: (options as SetChildMemberValueOptions).setMemberValue || (
      (parent, names, value) => {
        (parent as any)[names.name] = value;
      }
    ),

    createMember: (options as SetChildMemberValueOptions).createMember || (() => ({})),

    // delete specified member and if requested delete all empty parents recursively
    deleteMember: (parent, names, opt, parents, deleteEmptyParents) => {
      const deleteLocal = (options as DeleteChildMemberOptions).deleteMember || (
        (tparent, tname) => {
          delete (tparent as any)[tname.name];
        });
      
      const canDeleteObject = opt.canDeleteMember || (() => true);
      deleteLocal(parent, names, opt);

      if (deleteEmptyParents) {
        let obj = parent;

        forEachReverse(parents, objParent => {
          // if the child object became empty but it's in an array we won't remove it
          if (!isArray(obj) && isEmptyObject(obj) && canDeleteObject(objParent.obj, names, opt)) {
            deleteLocal(objParent.obj, names, opt);
          }

          obj = objParent.obj;
          names = objParent.names;
        });
      }
    }
  };
}

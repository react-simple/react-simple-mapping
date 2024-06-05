import { ValueOrArray, forEachReverse, getResolvedArray, isArray, isEmptyObject } from "@react-simple/react-simple-util";
import { DeleteChildMemberOptions, DeleteChildMemberOptionsExt, GetChildMemberValueOptions, ObjectWithFullQualifiedName, SetChildMemberValueOptions
  
 } from "objectModel/types";

// these functions are not exported by the package

export function getChildMemberRootObjAndPath<InvariantObj = any, RootObj = any>(
  rootObj: RootObj,
  fullQualifiedName: ValueOrArray<string>,
  options: GetChildMemberValueOptions<InvariantObj>
): {
  obj: any;
  path?: string[];
} {
  if (!rootObj) {
    return { obj: rootObj };
  }

  const path = getResolvedArray(fullQualifiedName, t => t.split(options.pathSeparator || "."));

  if (!path.length) {
    return { obj: rootObj };
  }

  let obj: any = rootObj;

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

// specify InvariantObj if all the child objects have the same type
export function getChildMemberInfoCallbacks<InvariantObj = any>(
  options:
    | SetChildMemberValueOptions<InvariantObj>
    | DeleteChildMemberOptions<InvariantObj>
    | GetChildMemberValueOptions<InvariantObj>
    = {}
): {
    getValue: (
      parent: ObjectWithFullQualifiedName<InvariantObj>,
      name: string | number,
      options: GetChildMemberValueOptions<InvariantObj>
    ) => any;
  
    setValue: (
      parent: ObjectWithFullQualifiedName<InvariantObj>,
      name: string | number,
      value: unknown,
      options: SetChildMemberValueOptions<InvariantObj>
    ) => boolean;
    
    createObject: (
      parent: ObjectWithFullQualifiedName<InvariantObj>,
      name: string | number,
      options: SetChildMemberValueOptions<InvariantObj>
    ) => object;
    
    deleteMember: (
      parent: ObjectWithFullQualifiedName<InvariantObj>,
      name: string | number,
      options: DeleteChildMemberOptionsExt<InvariantObj>
    ) => boolean;
} {
  return {
    getValue: options.getValue || ((parent, name) => (parent as any)[name]),

    setValue: (options as SetChildMemberValueOptions<InvariantObj>).setValue || (
      (parent, name, value) => {
        (parent as any)[name] = value;
        return true;
      }
    ),
    
    createObject: (options as SetChildMemberValueOptions<InvariantObj>).createObject || (() => ({})),

    // delete specified member and if requested delete all empty parents recursively
    deleteMember: (parent, name, opt) => {
      const deleteLocal = (options as DeleteChildMemberOptions<InvariantObj>).deleteMember || (
        (tparent, tname) => {
          delete (tparent as any)[tname];
          return true;
        });
      
      const canDeleteObject = (opt as DeleteChildMemberOptionsExt<InvariantObj>).canDeleteObject || (() => true);
      let result = deleteLocal(parent, name, opt);

      if (opt.deleteEmptyParents && opt.parents) {
        let obj = parent;

        forEachReverse(opt.parents, objParent => {
          // if the child object became empty but it's in an array we won't remove it
          if (!isArray(obj) && isEmptyObject(obj) && canDeleteObject(objParent, name, opt)) {
            result = deleteLocal(objParent.obj, name, opt) || result;
          }

          obj = objParent.obj;
          name = objParent.name;
        });
      }

      return result;
    }
  };
}

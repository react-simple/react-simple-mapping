import { ValueOrArray, isArray, stringAppend } from "@react-simple/react-simple-util";
import {
	ObjectWithFullQualifiedName, ChildMemberInfo, FullQualifiedName, ChildMemberReadOnlyInfoWithCallbacks, GetChildMemberReadOnlyInfoOptions
} from "./types";
import { REACT_SIMPLE_MAPPING } from "data";
import { getChildMemberInfoCallbacks, getChildMemberRootObjAndPath } from "./internal/functions";

// Returns  child member value by resolving the specified path of member names. Create subobjects if children is not found.
// Understands array indexes, for example: memberName1.memberName2[index].memberName3
// Does not understand standalone indexes, for example: memberName1.memberName2.[index].memberName3
// Returns the last object which has the member to be set or get. (Returned 'name' is the last part of 'path'.)
// If createMissingChildObjects is 'true' will create the complete structure and return member info.
// If createMissingChildObjects is 'false' and the structure is not complete, won't create missing object and will return undefined.
function getChildMemberReadOnlyInfo_default<TValueType = unknown>(
	startObj: object,
	fullQualifiedName: ValueOrArray<string>,
	options: GetChildMemberReadOnlyInfoOptions
): ChildMemberReadOnlyInfoWithCallbacks<TValueType> | undefined {
	const prep = getChildMemberRootObjAndPath(startObj, fullQualifiedName, options);
	const rootObj = options.rootObj || startObj;

	let obj = prep.obj;
	const path = prep.path;

	if (!obj || !path?.length) {
		return {
			startObj,
			rootObj,
			obj: startObj as any,
			names: { name: "", fullQualifiedName: "" },
			parents: [],
			getValue: () => obj
		};
	}

	const parents: ObjectWithFullQualifiedName[] = [{ obj, names: { name: "", fullQualifiedName: "" } }];
	let parentNames: FullQualifiedName = { name: "", fullQualifiedName: "" };

	// getValue(), setValue, deleteChildMember() callbacks are not used for array items only for object members
	const { getMemberValue } = getChildMemberInfoCallbacks(options);

	// 1) Iterate objects, except the last in path
	// skip the last item
	for (let pathIndex = 0; pathIndex < path.length - 1; pathIndex++) {
		const currentName = path[pathIndex];

		const names: FullQualifiedName = {
			name: currentName,
			fullQualifiedName: stringAppend(parentNames.fullQualifiedName, currentName, ".")
		};

		const openingBrace = currentName.endsWith("]") ? currentName.lastIndexOf("[") : -1;

		// iterate children with path[0..length - 2] values
		let child: any;

		if (openingBrace < 0) {
			// name only
			child = getMemberValue(obj, names, options);

			if (child === undefined || child === null) {
				return undefined;
			}
		}
		else if (openingBrace === 0) {
			// [index] only
			const index = currentName.substring(1, currentName.length - 1);
			const arrayIndexNames: FullQualifiedName = {
				name: index,
				fullQualifiedName: names.fullQualifiedName
			};

			// child = obj[index];
			child = getMemberValue(obj, arrayIndexNames, options);

			if (child === undefined || child === null) {
				return undefined;
			}
		}
		else {
			// name[index], name.[index]
			const arrayName = currentName[openingBrace - 1] === "." ? currentName.substring(0, openingBrace - 1) : currentName.substring(0, openingBrace);
			const arrayIndex = currentName.substring(openingBrace + 1, currentName.length - 1); // without braces

			// the name of the array member without the index
			const arrayNames: FullQualifiedName = {
				name: arrayName,
				fullQualifiedName: stringAppend(parentNames.fullQualifiedName, arrayName, ".")
			};

			const array = getMemberValue(obj, arrayNames, options) as unknown[];

			if (array === undefined || array === null) {
				return undefined;
			}

			// the name of the array index member
			const arrayIndexNames: FullQualifiedName = {
				name: arrayIndex,
				fullQualifiedName: `${arrayNames.fullQualifiedName}[${arrayIndex}]` // currentName might contain the dot
			};

			// child = (array as any)[index];
			child = getMemberValue(array, arrayIndexNames, options);

			if (child === undefined || child === null) {
				return undefined;
			}
		}

		parentNames = names;
		obj = child;

		parents.push({ obj, names });
	}

	const currentName = path[path.length - 1];
	const openingBrace = currentName.endsWith("]") ? currentName.lastIndexOf("[") : -1;
	
	// 2) return accessors to the last item in path
	if (openingBrace < 0) {
		const names: FullQualifiedName = {
			name: currentName,
			fullQualifiedName: stringAppend(parentNames.fullQualifiedName, currentName, ".")
		};
			
		const info: ChildMemberInfo = {
			startObj,
			rootObj,
			obj,
			names,
			parents
		};

		// name only
		return {
			...info,
			getValue: () => getMemberValue(obj, names, options) as TValueType | undefined
		};
	}
	else if (openingBrace > 0) {
		// name[index], name.[index]
		const arrayName = currentName[openingBrace - 1] === "." ? currentName.substring(0, openingBrace - 1) : currentName.substring(0, openingBrace);
		const arrayIndex = currentName.substring(openingBrace + 1, currentName.length - 1); // without braces
		const arrayIndexValue = parseFloat(arrayIndex);

		// the name of the array member without the index
		const arrayNames: FullQualifiedName = {
			name: arrayName,
			fullQualifiedName: stringAppend(parentNames.fullQualifiedName, arrayName, ".")
		};

		// the name of the array index member
		const arrayIndexNames: FullQualifiedName = {
			name: arrayIndex,
			fullQualifiedName: `${arrayNames.fullQualifiedName}[${arrayIndex}]` // currentName might contain the dot
		};

		const array = getMemberValue(obj, arrayNames, options);

		if (array === undefined || array === null) {
			return undefined;
		}

		return {
			startObj,
			rootObj,
			obj: array as object,
			names: arrayIndexNames,
			parents: [
				...parents,
				{ obj, names: arrayNames }
			],
			parentArray: isArray(array) ? { array, index: arrayIndex } : undefined,
			// getValue(), setValue, deleteChildMember() callbacks are not used for array items only for object members
			getValue: () => {
				// return (array as any)[index] as TValueType | undefined;
				return getMemberValue(array as object, arrayIndexNames, options) as TValueType | undefined;
			}
		};
	}
	else {
		// [index] only
		const arrayIndex = currentName.substring(1, currentName.length - 1);
		const arrayIndexValue = parseFloat(arrayIndex)

		const parent = parents[parents.length - 1];
		const array = parent.obj as any[];
		
		const names: FullQualifiedName = {
			name: arrayIndex,
			fullQualifiedName: `${parentNames.fullQualifiedName}[${arrayIndex}]` // eliminate the dot
		};

		return {
			startObj,
			rootObj,
			obj: array,
			names,
			parents,
			parentArray: { array, index: arrayIndex },
			// getValue(), setValue, deleteChildMember() callbacks are not used for array items only for object members
			getValue: () => {
				// return obj[arrayIndex];
				return getMemberValue(array, names, options) as TValueType | undefined;
			}
		};
	}
}

REACT_SIMPLE_MAPPING.DI.objectModel.getChildMemberReadOnlyInfo = getChildMemberReadOnlyInfo_default;

// Returns  child member value by resolving the specified path of member names. Create subobjects if children is not found.
// Understands array indexes, for example: memberName1.memberName2[index].memberName3
// Does not understand standalone indexes, for example: memberName1.memberName2.[index].memberName3
// Returns the last object which has the member to be set or get. (Returned 'name' is the last part of 'path'.)
export function getChildMemberReadOnlyInfo<TValueType = unknown>(
	startObj: object,
	fullQualifiedName: ValueOrArray<string>,
	options: GetChildMemberReadOnlyInfoOptions = {}
): ChildMemberReadOnlyInfoWithCallbacks<TValueType> | undefined {
	return REACT_SIMPLE_MAPPING.DI.objectModel.getChildMemberReadOnlyInfo(
		startObj, fullQualifiedName, options, getChildMemberReadOnlyInfo_default
	);
}

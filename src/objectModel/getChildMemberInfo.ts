import { arrayRemoveAt, getResolvedCallbackValueWithArgs, isArray, isEmpty, isEmptyObject, stringAppend } from "@react-simple/react-simple-util";
import {
	ObjectWithFullQualifiedName, GetChildMemberInfoOptions, ChildMemberInfoWithCallbacks, ChildMemberInfo, FullQualifiedName
 } from "./types";
import { REACT_SIMPLE_MAPPING } from "data";
import { getChildMemberInfoCallbacks, getChildMemberRootObjAndPath } from "./internal/functions";

// Returns  child member value by resolving the specified path of member names. Create subobjects if children is not found.
// Understands array indexes, for example: memberName1.memberName2[index].memberName3
// Does not understand standalone indexes, for example: memberName1.memberName2.[index].memberName3
// Returns the last object which has the member to be set or get. (Returned 'name' is the last part of 'path'.)
// If createMissingChildObjects is 'true' will create the complete structure and return member info.
// If createMissingChildObjects is 'false' and the structure is not complete, won't create missing object and will return undefined.
function getChildMemberInfo_default<Value = unknown> (
	startObj: object,
	fullQualifiedName: string,
	createMissingChildObjects: boolean,
	options: GetChildMemberInfoOptions
): ChildMemberInfoWithCallbacks<Value> | undefined {
	// getValue(), setValue, deleteChildMember() callbacks are not used for array items only for object members
	const { getMemberValue, setMemberValue, createMember, deleteMember } = getChildMemberInfoCallbacks(options);

	const prep = getChildMemberRootObjAndPath(startObj, fullQualifiedName, options);
	const rootObj = options.rootObj || startObj;

	let obj = prep.obj;
	const path = prep.path;

	if (!obj) {
		return undefined;
	}

	if (!path?.length) {
		return {
			startObj,
			rootObj,
			obj: startObj as any,
			names: { name: "", fullQualifiedName },
			parents: [],
			getValue: () => {
				return getMemberValue(obj, { fullQualifiedName, name: "" }) as (Value | undefined);
			},
			setValue: value => {
				options?.setStartObject?.(
					getResolvedCallbackValueWithArgs(
						value,
						() => getMemberValue(obj, { fullQualifiedName, name: "" }) as Value | undefined
					) as object
				);
			},
			deleteMember: () => false, // it's not possible to delete the start obj
		};
	}

	const parents: ObjectWithFullQualifiedName[] = [{ obj, names: { name: "", fullQualifiedName: "" } }];
	let parentNames: FullQualifiedName = { name: "", fullQualifiedName: "" };

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
			child = getMemberValue(obj, names);

			if (child === undefined || child === null) {
				if (!createMissingChildObjects) {
					return undefined;
				}

				child = path[pathIndex + 1].startsWith("[") ? [] : createMember(obj, names);
				setMemberValue(obj, names, child); // create missing child
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
			child = getMemberValue(obj, arrayIndexNames);

			if (child === undefined || child === null) {
				if (!createMissingChildObjects) {
					return undefined;
				}

				child = path[pathIndex + 1].startsWith("[") ? [] : createMember(obj, names);
				// obj[index] = child; // create missing item in array
				setMemberValue(obj, arrayIndexNames, child);
			}
		}
		else {
			// name[index], name.[index]
			const arrayName = currentName[openingBrace - 1] === "."
				? currentName.substring(0, openingBrace - 1)
				: currentName.substring(0, openingBrace);
			
			const arrayIndex = currentName.substring(openingBrace + 1, currentName.length - 1); // without braces

			// the name of the array member without the index
			const arrayNames: FullQualifiedName = {
				name: arrayName,
				fullQualifiedName: stringAppend(parentNames.fullQualifiedName, arrayName, ".")
			};

			let array = getMemberValue(obj, arrayNames) as unknown[];

			if (array === undefined || array === null) {
				if (!createMissingChildObjects) {
					return undefined;
				}

				array = [];
				setMemberValue(obj, arrayNames, array); // create missing child
			}

			// the name of the array index member
			const arrayIndexNames: FullQualifiedName = {
				name: arrayIndex,
				fullQualifiedName: `${arrayNames.fullQualifiedName}[${arrayIndex}]` // currentName might contain the dot
			};

			// child = (array as any)[index];
			child = getMemberValue(array, arrayIndexNames);

			if (child === undefined || child === null) {
				if (!createMissingChildObjects) {
					return undefined;
				}

				child = path[pathIndex + 1].startsWith("[") ? [] : createMember(obj, names);
				// (array as any)[index] = child; // create missing item in array
				setMemberValue(array, arrayIndexNames, child);
			}
		}

		parentNames = names;
		obj = child;

		parents.push({ obj, names });
	}

	// 2) Return accessors to the last item in path
	const currentName = path[path.length - 1];
	const openingBrace = currentName.endsWith("]") ? currentName.lastIndexOf("[") : -1;
	
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
			getValue: () => {
				return getMemberValue(obj, names) as Value | undefined;
			},
			setValue: value => {
				setMemberValue(
					obj,
					names,
					getResolvedCallbackValueWithArgs(
						value,
						() => getMemberValue(obj, names) as Value | undefined
					)
				);
			},
			deleteMember: (deleteEmptyParents: boolean) => {
				deleteMember(obj, names, parents, deleteEmptyParents);
			}
		};
	}
	else if (openingBrace > 0) {
		// name[index], name.[index]
		const arrayName = currentName[openingBrace - 1] === "."
			? currentName.substring(0, openingBrace - 1)
			: currentName.substring(0, openingBrace);
		
		const arrayIndex = currentName.substring(openingBrace + 1, currentName.length - 1); // without braces

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

		let array = getMemberValue(obj, arrayNames);

		if (array === undefined || array === null) {
			if (!createMissingChildObjects) {
				return undefined;
			}

			array = [];
			setMemberValue(obj, arrayNames, array);
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
				return getMemberValue(array as object, arrayIndexNames) as Value | undefined;
			},
			setValue: value => {
				// (array as any)[index] = value;
				setMemberValue(
					array as object,
					arrayIndexNames,
					getResolvedCallbackValueWithArgs(
						value,
						() => getMemberValue(array as object, arrayIndexNames) as Value | undefined
					)
				);
			},
			deleteMember: removeEmptyParents => {
				const arrayIndexValue = parseFloat(arrayIndex);

				if (isArray(array) && !isEmpty(arrayIndexValue)) {
					const newArray = arrayRemoveAt(array, arrayIndexValue);

					return removeEmptyParents && !newArray.length
						? deleteMember(obj, arrayNames, parents, removeEmptyParents)
						: setMemberValue(obj, arrayNames, newArray);
				}
				else {
					delete (array as any)[arrayIndex];

					return removeEmptyParents && isEmptyObject(array)
						? deleteMember(obj, arrayNames, parents, removeEmptyParents)
						: true;
				}
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
				return getMemberValue(array, names) as Value | undefined;
			},
			setValue: value => {
				// obj[index] = value;
				setMemberValue(
					array,
					names,
					getResolvedCallbackValueWithArgs(
						value,
						() => getMemberValue(array, names) as Value | undefined
					)
				);
			},
			deleteMember: removeEmptyParents => {
				const parentOfArray = parents[parents.length - 2]?.obj;

				if (!isEmpty(arrayIndexValue)) {
					// set the new array instance in the parent obj
					const newArray = arrayRemoveAt(array, arrayIndexValue);

					return removeEmptyParents && !newArray.length
						? !!parentOfArray && deleteMember(parentOfArray, parentNames, parents, removeEmptyParents)
						: !!parentOfArray && setMemberValue(parentOfArray, parentNames, newArray);
				}
				else {
					delete array[arrayIndexValue];

					return removeEmptyParents && isEmptyObject(array)
						? !!parentOfArray && deleteMember(parentOfArray, parentNames, parents, removeEmptyParents)
						: true;
				}
			}
		};
	}
}

REACT_SIMPLE_MAPPING.DI.objectModel.getChildMemberInfo = getChildMemberInfo_default;

// Returns  child member value by resolving the specified path of member names. Create subobjects if children is not found.
// Understands array indexes, for example: memberName1.memberName2[index].memberName3
// Does not understand standalone indexes, for example: memberName1.memberName2.[index].memberName3
// Returns the last object which has the member to be set or get. (Returned 'name' is the last part of 'path'.)
export function getChildMemberInfo<Value = unknown>(
	startObj: object,
	fullQualifiedName: string,
	createMissingChildObjects: boolean,
	options: GetChildMemberInfoOptions = {}
): ChildMemberInfoWithCallbacks<Value> | undefined {
	return REACT_SIMPLE_MAPPING.DI.objectModel.getChildMemberInfo(
		startObj, fullQualifiedName, createMissingChildObjects, options, getChildMemberInfo_default
	);
}

import { ValueOrArray, arrayRemoveAt, isArray, isEmpty, stringAppend } from "@react-simple/react-simple-util";
import { ObjectWithFullQualifiedName, GetChildMemberInfoOptions, ChildMemberInfoWithCallbacks, ChildMemberInfo, FullQualifiedName } from "./types";
import { REACT_SIMPLE_MAPPING } from "data";
import { getChildMemberInfoCallbacks, getChildMemberRootObjAndPath } from "./internal/functions";

// Returns  child member value by resolving the specified path of member names. Create subobjects if children is not found.
// Understands array indexes, for example: memberName1.memberName2[index].memberName3
// Does not understand standalone indexes, for example: memberName1.memberName2.[index].memberName3
// Returns the last object which has the member to be set or get. (Returned 'name' is the last part of 'path'.)
// If createMissingChildObjects is 'true' will create the complete structure and return member info.
// If createMissingChildObjects is 'false' and the structure is not complete, won't create missing object and will return undefined.
function getChildMemberInfo_default<TValueType = unknown> (
	startObj: object, // we do not want InvariantObj to automatically resolve to this
	fullQualifiedName: ValueOrArray<string>,
	createMissingChildObjects: boolean,
	options: GetChildMemberInfoOptions
): ChildMemberInfoWithCallbacks<TValueType> | undefined {
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
			getValue: () => obj,
			setValue: () => false,
			deleteMember: () => false
		};
	}

	const parents: ObjectWithFullQualifiedName[] = [{ obj, names: { name: "", fullQualifiedName: "" } }];
	let parentNames: FullQualifiedName = { name: "", fullQualifiedName: "" };

	// getValue(), setValue, deleteChildMember() callbacks are not used for array items only for object members
	const { getMemberValue, setMemberValue, createMember, deleteMember } = getChildMemberInfoCallbacks(options);

	// 1) Iterate objects, except the last in path
	// skip the last item
	for (let pathIndex = 0; pathIndex < path.length - 1; pathIndex++) {
		const currentName = path[pathIndex];

		const names: FullQualifiedName = {
			name: currentName,
			fullQualifiedName: stringAppend(parentNames.fullQualifiedName, currentName, ".")
		};

		const i = currentName.endsWith("]") ? currentName.lastIndexOf("[") : -1;

		// iterate children with path[0..length - 2] values
		let child: any;

		if (i < 0) {
			// name only
			child = getMemberValue(obj, names, options);

			if (child === undefined || child === null) {
				if (!createMissingChildObjects) {
					return undefined;
				}

				child = path[pathIndex + 1].startsWith("[") ? [] : createMember(obj, names, options);
				setMemberValue(obj, names, child, options); // create missing child
			}
		}
		else if (i === 0) {
			// [index] only
			const index = currentName.substring(1, currentName.length - 1);
			child = obj[index];

			if (child === undefined || child === null) {
				if (!createMissingChildObjects) {
					return undefined;
				}

				child = path[pathIndex + 1].startsWith("[") ? [] : createMember(obj, names, options);
				obj[index] = child; // create missing item in array
			}
		}
		else {
			// name[index], name.[index]
			const name = currentName[i - 1] === "." ? currentName.substring(0, i - 1) : currentName.substring(0, i);
			const index = currentName.substring(i + 1, currentName.length - 1);

			const arrayNames = {
				name: currentName,
				fullQualifiedName: stringAppend(parentNames.fullQualifiedName, currentName, ".")
			};

			let array = getMemberValue(obj, arrayNames, options) as unknown[];

			if (array === undefined || array === null) {
				if (!createMissingChildObjects) {
					return undefined;
				}

				array = [];
				setMemberValue(obj, arrayNames, array, options); // create missing child
			}

			child = (array as any)[index];

			if (child === undefined || child === null) {
				if (!createMissingChildObjects) {
					return undefined;
				}

				child = path[pathIndex + 1].startsWith("[") ? [] : createMember(obj, names, options);
				(array as any)[index] = child; // create missing item in array
			}
		}

		parentNames = names;
		obj = child;

		parents.push({ obj, names });
	}

	const currentName = path[path.length - 1];
	const i = currentName.endsWith("]") ? currentName.lastIndexOf("[") : -1;
	
	// 2) return accessors to the last item in path
	if (i < 0) {
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
			getValue: () => getMemberValue(obj, names, options) as TValueType | undefined,
			setValue: (value: TValueType) => setMemberValue(obj, names, value, options),
			deleteMember: () => deleteMember(obj, names, options, parents)
		};
	}
	else if (i > 0) {
		// name[index], name.[index]
		const currentMemberName = currentName[i - 1] === "." ? currentName.substring(0, i - 1) : currentName.substring(0, i);
		const names: FullQualifiedName = {
			name: currentMemberName,
			fullQualifiedName: stringAppend(parentNames.fullQualifiedName, currentMemberName, ".")
		};

		const index = currentName.substring(i + 1, currentName.length - 1);
		const indexNum = parseFloat(index);

		let array = getMemberValue(obj, names, options);

		if (array === undefined || array === null) {
			if (!createMissingChildObjects) {
				return undefined;
			}

			array = [];
			setMemberValue(obj, names, array, options);
		}

		return {
			startObj,
			rootObj,
			obj,
			names,
			parents,
			arrayInfo: isArray(array)
				? {
					array,
					index,
					name: `[${index}]`,
					fullQualifiedName: names.fullQualifiedName
				} :
				undefined,
			// getValue(), setValue, deleteChildMember() callbacks are not used for array items only for object members
			getValue: () => (array as any)[index] as TValueType | undefined,
			setValue: value => {
				(array as any)[index] = value;
				return true;
			},
			deleteMember: isArray(array) && !isEmpty(indexNum) 
				? () => {
					const newArray = arrayRemoveAt(array, indexNum);
					return setMemberValue(obj, names, newArray, options);
				}
				: () => {
					delete (array as any)[index];
					return true;
				}
		};
	}
	else {
		// [index] only
		const index = currentName.substring(1, currentName.length - 1);
		const indexNum = parseFloat(index);
		const parentObj = parents[parents.length - 2]; // can be undefined
		const parentArray = parents[parents.length - 1];
		const names = parentArray.names;

		return {
			startObj,
			rootObj,
			obj: parentObj?.obj || obj,
			names,
			parents: parents.slice(0, -1),
			arrayInfo: {
				array: obj,
				index,
				name: currentName,
				fullQualifiedName: stringAppend(parentNames.fullQualifiedName, currentName, ".")
			},
			// getValue(), setValue, deleteChildMember() callbacks are not used for array items only for object members
			getValue: () => obj[index],
			setValue: value => {
				obj[index] = value;
				return true;
			},
			deleteMember: !isEmpty(indexNum)
				// set the new array instance in the parent obj
				? () => {
					const newArray = arrayRemoveAt(obj, indexNum);
					return setMemberValue(parentObj.obj, names, newArray, options);
				}
				: () => {
					delete obj[index];
					return true;
				}
		};
	}
}

REACT_SIMPLE_MAPPING.DI.objectModel.getChildMemberInfo = getChildMemberInfo_default;

// Returns  child member value by resolving the specified path of member names. Create subobjects if children is not found.
// Understands array indexes, for example: memberName1.memberName2[index].memberName3
// Does not understand standalone indexes, for example: memberName1.memberName2.[index].memberName3
// Returns the last object which has the member to be set or get. (Returned 'name' is the last part of 'path'.)
export function getChildMemberInfo<TValueType = unknown>(
	startObj: object, // we do not want InvariantObj to automatically resolve to this
	fullQualifiedName: ValueOrArray<string>,
	createMissingChildObjects: boolean,
	options: GetChildMemberInfoOptions = {}
): ChildMemberInfoWithCallbacks<TValueType> | undefined {
	return REACT_SIMPLE_MAPPING.DI.objectModel.getChildMemberInfo(
		startObj, fullQualifiedName, createMissingChildObjects, options, getChildMemberInfo_default
	);
}

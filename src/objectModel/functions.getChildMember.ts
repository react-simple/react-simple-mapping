import { ValueOrArray, arrayRemoveAt, isEmpty, stringAppend } from "@react-simple/react-simple-util";
import { ObjectWithFullQualifiedName, GetChildMemberInfoOptions, ChildMemberInfoWithCallbacks, ChildMemberInfo } from "./types";
import { REACT_SIMPLE_MAPPING } from "data";
import { getChildMemberInfoCallbacks, getChildMemberRootObjAndPath } from "./internal/functions";

// Returns  child member value by resolving the specified path of member names. Create subobjects if children is not found.
// Understands array indexes, for example: memberName1.memberName2[index].memberName3
// Does not understand standalone indexes, for example: memberName1.memberName2.[index].memberName3
// Returns the last object which has the member to be set or get. (Returned 'name' is the last part of 'path'.)
// If createMissingChildObjects is 'true' will create the complete structure and return member info.
// If createMissingChildObjects is 'false' and the structure is not complete, won't create missing object and will return undefined.
function getChildMemberInfo_default<ValueType = unknown, InvariantObj = any, RootObj = any>(
	rootObj: RootObj,
	fullQualifiedName: ValueOrArray<string>,
	createMissingChildObjects: boolean,
	options: GetChildMemberInfoOptions<InvariantObj> = {}
): ChildMemberInfoWithCallbacks<ValueType, RootObj> | undefined {
	const prep = getChildMemberRootObjAndPath(rootObj, fullQualifiedName, options);
	let obj = prep.obj;
	const path = prep.path;

	if (!obj || !path?.length) {
		return {
			rootObj,
			obj: rootObj,
			name: "",
			fullQualifiedName: "",
			parents: [],
			getValue: () => obj,
			setValue: () => false,
			deleteMember: () => false
		};
	}

	const parents: ObjectWithFullQualifiedName[] = [{ obj, name: "", fullQualifiedName: "" }];
	let parentFullQualifiedName = "";

	// getValue(), setValue, deleteMember() callbacks are not used for array items only for object members
	const { getValue, setValue, createObject, deleteMember } = getChildMemberInfoCallbacks(options);

	// skip the last item
	for (let memberNameIndex = 0; memberNameIndex < path.length - 1; memberNameIndex++) {
		const memberName = path[memberNameIndex];
		const i = memberName.endsWith("]") ? memberName.lastIndexOf("[") : -1;

		// iterate children with path[0..length - 2] values
		let child: any;

		if (i < 0) {
			// name only
			child = getValue(obj, memberName, options);

			if (child === undefined || child === null) {
				if (!createMissingChildObjects) {
					return undefined;
				}

				child = path[memberNameIndex + 1].startsWith("[") ? [] : createObject(obj, memberName, options);
				setValue(obj, memberName, child, options); // create missing child
			}
		}
		else if (i === 0) {
			// [index] only
			const index = memberName.substring(1, memberName.length - 1);
			child = getValue(obj, index, options);

			if (child === undefined || child === null) {
				if (!createMissingChildObjects) {
					return undefined;
				}

				child = path[memberNameIndex + 1].startsWith("[") ? [] : createObject(obj, index, options);
				setValue(obj, index, child, options); // create missing item in array
			}
		}
		else {
			// name[index], name.[index]
			const name = memberName[i - 1] === "." ? memberName.substring(0, i - 1) : memberName.substring(0, i);
			const index = memberName.substring(i + 1, memberName.length - 1);

			let array = getValue(obj, name, options);

			if (array === undefined || array === null) {
				if (!createMissingChildObjects) {
					return undefined;
				}

				array = [];
				setValue(obj, name, array, options); // create missing child
			}

			child = getValue(array, index, options);

			if (child === undefined || child === null) {
				if (!createMissingChildObjects) {
					return undefined;
				}

				child = path[memberNameIndex + 1].startsWith("[") ? [] : createObject(array, index, options);
				setValue(array, index, child, options); // create missing item in array
			}
		}

		parentFullQualifiedName = stringAppend(parentFullQualifiedName, memberName, ".");

		obj = child;

		parents.push({
			obj,
			name: memberName,
			fullQualifiedName: parentFullQualifiedName
		});
	}

	const memberName = path[path.length - 1];
	const i = memberName.endsWith("]") ? memberName.lastIndexOf("[") : -1;
	
	// set value using path[length - 1]
	if (i < 0) {
		const info: ChildMemberInfo = {
			rootObj,
			obj,
			name: memberName,
			fullQualifiedName: stringAppend(parentFullQualifiedName, memberName, "."),
			parents,
		};

		// name only
		return {
			...info,
			getValue: () => getValue(obj, memberName, options),
			setValue: value => setValue(obj, memberName, value, options),
			deleteMember: () => deleteMember(obj, memberName, { ...options, parents })
		};
	}
	else if (i > 0) {
		// name[index], name.[index]
		const name = memberName[i - 1] === "." ? memberName.substring(0, i - 1) : memberName.substring(0, i);
		const index = memberName.substring(i + 1, memberName.length - 1);
		const indexNum = parseFloat(index);

		let array = getValue(obj, name, options);

		if (array === undefined || array === null) {
			if (!createMissingChildObjects) {
				return undefined;
			}

			array = [];
			setValue(obj, name, array, options);
		}

		return {
			rootObj,
			obj,
			name,
			fullQualifiedName: stringAppend(parentFullQualifiedName, name, "."),
			parents,
			arraySpec: {
				array,
				index,
				name: `[${index}]`,
				fullQualifiedName: stringAppend(parentFullQualifiedName, memberName, ".")
			},
			// getValue(), setValue, deleteMember() callbacks are not used for array items only for object members
			getValue: () => array[index],
			setValue: value => {
				array[index] = value;
				return true;
			},
			deleteMember: !isEmpty(indexNum)
				? () => {
					const newArray = arrayRemoveAt(array, indexNum);
					return setValue(obj, name, newArray, options);
				}
				: () => {
					delete array[index];
					return true;
				}
		};
	}
	else {
		// [index] only
		const index = memberName.substring(1, memberName.length - 1);
		const indexNum = parseFloat(index);
		const parentObj = parents[parents.length - 2]; // can be undefined
		const parentArray = parents[parents.length - 1];

		return {
			rootObj,
			obj: parentObj?.obj || obj,
			name: parentArray.name,
			fullQualifiedName: parentArray.fullQualifiedName,
			parents: parents.slice(0, -1),
			arraySpec: {
				array: obj,
				index,
				name: memberName,
				fullQualifiedName: stringAppend(parentFullQualifiedName, memberName, ".")
			},
			// getValue(), setValue, deleteMember() callbacks are not used for array items only for object members
			getValue: () => obj[index],
			setValue: value => {
				obj[index] = value;
				return true;
			},
			deleteMember: !isEmpty(indexNum)
				// set the new array instance in the parent obj
				? () => {
					const newArray = arrayRemoveAt(obj, indexNum);
					return setValue(parentObj.obj, parentArray.name, newArray, options);
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
export function getChildMemberInfo<ValueType = unknown, InvariantObj = any, RootObj = any>(
	rootObj: RootObj,
	fullQualifiedName: ValueOrArray<string>,
	createMissingChildObjects: boolean, 
	options: GetChildMemberInfoOptions<InvariantObj> = {}
): ChildMemberInfoWithCallbacks<ValueType, RootObj> | undefined {
	return REACT_SIMPLE_MAPPING.DI.objectModel.getChildMemberInfo(
		rootObj, fullQualifiedName, createMissingChildObjects, options, getChildMemberInfo_default
	);
}

import { ValueOrArray, arrayRemoveAt, getResolvedArray, isEmpty, stringAppend } from "@react-simple/react-simple-util";
import {
	GetObjectChildValueOptions, GetObjectChildMemberReturn, ObjectWithFullQualifiedName, SetObjectChildValueOptions, GetObjectChildMemberOptions,
	DeleteObjectChildMemberOptions, DeleteObjectChildMemberReturn, SetObjectChildValueReturn, GetObjectChildValueReturn
} from "./types";
import { REACT_SIMPLE_MAPPING } from "data";

function getObjectChildMemberRootObjAndPath(
	rootObj: object,
	fullQualifiedName: ValueOrArray<string>,
	options: GetObjectChildValueOptions
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

// Returns  child member value by resolving the specified path of member names. Create subobjects if children is not found.
// Understands array indexes, for example: memberName1.memberName2[index].memberName3
// Does not understand standalone indexes, for example: memberName1.memberName2.[index].memberName3
// Returns the last object which has the member to be set or get. (Returned 'name' is the last part of 'path'.)
// If createMissingObjects is 'true' will create the complete structure and return member info.
// If createMissingObjects is 'false' and the structure is not complete, won't create missing object and will return undefined.
function getObjectChildMember_default<ValueType = unknown, RootObj extends object = any>(
	rootObj: RootObj,
	fullQualifiedName: ValueOrArray<string>,
	createMissingObjects: boolean,
	options: GetObjectChildMemberOptions = {}
): GetObjectChildMemberReturn<ValueType, RootObj> | undefined {
	const prep = getObjectChildMemberRootObjAndPath(rootObj, fullQualifiedName, options);
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

	let parents: ObjectWithFullQualifiedName[] = [{ obj, name: "", fullQualifiedName: "" }];
	let parentFullQualifiedName = "";

	const getValue = options.getValue || ((t1, t2) => t1[t2]);
	const setValue = options.setValue || ((t1, t2, t3) => { t1[t2] = t3; return true; });
	const createObject = options.createObject || ((t1, t2, t3) => ({}));
	const deleteMember = options.deleteMember || ((t1, t2) => { delete t1[t2]; return true; });

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
				if (!createMissingObjects) {
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
				if (!createMissingObjects) {
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
				if (!createMissingObjects) {
					return undefined;
				}

				array = [];
				setValue(obj, name, array, options); // create missing child
			}

			child = getValue(array, index, options);

			if (child === undefined || child === null) {
				if (!createMissingObjects) {
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
		// name only
		return {
			rootObj,
			obj,
			name: memberName,
			fullQualifiedName: stringAppend(parentFullQualifiedName, memberName, "."),
			parents,
			getValue: () => getValue(obj, memberName, options),
			setValue: value => setValue(obj, memberName, value, options),
			deleteMember: () => deleteMember(obj, memberName, options)
		};
	}
	else if (i > 0) {
		// name[index], name.[index]
		const name = memberName[i - 1] === "." ? memberName.substring(0, i - 1) : memberName.substring(0, i);
		const index = memberName.substring(i + 1, memberName.length - 1);
		const indexNum = parseFloat(index);

		let array = getValue(obj, name, options);

		if (array === undefined || array === null) {
			if (!createMissingObjects) {
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
			getValue: () => getValue(obj, index, options),
			setValue: value => setValue(obj, index, value, options),
			deleteMember: !isEmpty(indexNum)
				// set the new array instance in the parent obj
				? () => !!parentObj && setValue(parentObj.obj, parentArray.name, arrayRemoveAt(obj, indexNum), options)
				: () => deleteMember(obj, index, options)
		};
	}
}

REACT_SIMPLE_MAPPING.DI.objectModel.getObjectChildMember = getObjectChildMember_default;

// Returns  child member value by resolving the specified path of member names. Create subobjects if children is not found.
// Understands array indexes, for example: memberName1.memberName2[index].memberName3
// Does not understand standalone indexes, for example: memberName1.memberName2.[index].memberName3
// Returns the last object which has the member to be set or get. (Returned 'name' is the last part of 'path'.)
export function getObjectChildMember<ValueType = unknown, RootObj extends object = any>(
	rootObj: RootObj,
	fullQualifiedName: ValueOrArray<string>,
	createMissingObjects: boolean, 
	options: GetObjectChildMemberOptions = {}
): GetObjectChildMemberReturn<ValueType, RootObj> | undefined {
	return REACT_SIMPLE_MAPPING.DI.objectModel.getObjectChildMember(
		rootObj, fullQualifiedName, createMissingObjects, options, getObjectChildMember_default
	);
}

// Does not create missing internal objects
function getObjectChildValue_default<ValueType = unknown, RootObj extends object = any>(
	rootObj: RootObj,
	fullQualifiedName: ValueOrArray<string>,
	options: GetObjectChildValueOptions
): GetObjectChildValueReturn<ValueType | undefined> {
	const accessor = getObjectChildMember<ValueType | undefined>(rootObj, fullQualifiedName, false, options);

	return {
		accessor,
		value: accessor?.getValue?.()
	};
}

REACT_SIMPLE_MAPPING.DI.objectModel.getObjectChildValue = getObjectChildValue_default;

// Does not create missing internal objects
export function getObjectChildValue<ValueType = unknown, RootObj extends object = any>(
	rootObj: RootObj,
	fullQualifiedName: ValueOrArray<string>,
	options: GetObjectChildValueOptions = {}
): GetObjectChildValueReturn<ValueType | undefined> {
	return REACT_SIMPLE_MAPPING.DI.objectModel.getObjectChildValue<ValueType>(
		rootObj, fullQualifiedName, options, getObjectChildValue_default
	);
}

// Creates missing hierarchy and sets the value in the leaf object
function setObjectChildValue_default<ValueType = unknown, RootObj extends object = any>(
	rootObj: RootObj,
	fullQualifiedName: ValueOrArray<string>,
	value: unknown,
	options: SetObjectChildValueOptions = {}
): SetObjectChildValueReturn {
	const accessor = getObjectChildMember(rootObj, fullQualifiedName, true, options)!;

	return {
		accessor,
		success: accessor.setValue(value)
	};
}

REACT_SIMPLE_MAPPING.DI.objectModel.setObjectChildValue = setObjectChildValue_default;

// Creates missing hierarchy and sets the value in the leaf object
export function setObjectChildValue<RootObj extends object = any>(
	rootObj: RootObj,
	fullQualifiedName: ValueOrArray<string>,
	value: unknown,
	options: SetObjectChildValueOptions = {}
): SetObjectChildValueReturn {
	return REACT_SIMPLE_MAPPING.DI.objectModel.setObjectChildValue(
		rootObj, fullQualifiedName, value, options, setObjectChildValue_default
	);
}

function deleteObjectChildMember_default<ValueType = unknown, RootObj extends object = any>(
	rootObj: RootObj,
	fullQualifiedName: ValueOrArray<string>,
	options: DeleteObjectChildMemberOptions
): DeleteObjectChildMemberReturn<ValueType | undefined> {
	const accessor = getObjectChildMember<ValueType | undefined>(rootObj, fullQualifiedName, false, options);
	const deleted = accessor?.getValue?.();

	return {
		accessor,
		success: accessor?.deleteMember?.() || false,
		deleted
	};
}

REACT_SIMPLE_MAPPING.DI.objectModel.deleteObjectChildMember = deleteObjectChildMember_default;

export function deleteObjectChildMember<ValueType = unknown, RootObj extends object = any>(
	rootObj: RootObj,
	fullQualifiedName: ValueOrArray<string>,
	options: DeleteObjectChildMemberOptions = {}
): DeleteObjectChildMemberReturn<ValueType | undefined> {
	return REACT_SIMPLE_MAPPING.DI.objectModel.deleteObjectChildMember<ValueType>(
		rootObj, fullQualifiedName, options, deleteObjectChildMember_default
	);
}

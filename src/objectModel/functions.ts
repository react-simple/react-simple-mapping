import { ValueOrArray, arrayRemoveAt, getResolvedArray, isEmpty, resolveEmpty, stringAppend } from "@react-simple/react-simple-util";
import {
	GetChildMemberValueOptions, ChildMemberInfo as ChildMemberInfos, ObjectWithFullQualifiedName, SetChildMemberValueOptions, GetChildMemberOptions,
	DeleteChildMemberOptions
} from "./types";
import { REACT_SIMPLE_MAPPING } from "data";

function getChildMemberRootObjAndPath(
	rootObj: object,
	fullQualifiedName: ValueOrArray<string>,
	options: GetChildMemberValueOptions
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
// If createMissingChildObjects is 'true' will create the complete structure and return member info.
// If createMissingChildObjects is 'false' and the structure is not complete, won't create missing object and will return undefined.
function getChildMember_default<ValueType = unknown, RootObj extends object = any>(
	rootObj: RootObj,
	fullQualifiedName: ValueOrArray<string>,
	createMissingChildObjects: boolean,
	options: GetChildMemberOptions = {}
): ChildMemberInfos<ValueType, RootObj> | undefined {
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

REACT_SIMPLE_MAPPING.DI.objectModel.getChildMember = getChildMember_default;

// Returns  child member value by resolving the specified path of member names. Create subobjects if children is not found.
// Understands array indexes, for example: memberName1.memberName2[index].memberName3
// Does not understand standalone indexes, for example: memberName1.memberName2.[index].memberName3
// Returns the last object which has the member to be set or get. (Returned 'name' is the last part of 'path'.)
export function getChildMember<ValueType = unknown, RootObj extends object = any>(
	rootObj: RootObj,
	fullQualifiedName: ValueOrArray<string>,
	createMissingChildObjects: boolean, 
	options: GetChildMemberOptions = {}
): ChildMemberInfos<ValueType, RootObj> | undefined {
	return REACT_SIMPLE_MAPPING.DI.objectModel.getChildMember(
		rootObj, fullQualifiedName, createMissingChildObjects, options, getChildMember_default
	);
}

// Does not create missing internal objects
function getChildMemberValue_default<ValueType = unknown, RootObj extends object = any>(
	rootObj: RootObj,
	fullQualifiedName: ValueOrArray<string>,
	options: GetChildMemberValueOptions
): ValueType | undefined {
	return getChildMember<ValueType | undefined>(rootObj, fullQualifiedName, false, options)?.getValue?.();
}

REACT_SIMPLE_MAPPING.DI.objectModel.getChildMemberValue = getChildMemberValue_default;

// Does not create missing internal objects
export function getChildMemberValue<ValueType = unknown, RootObj extends object = any>(
	rootObj: RootObj,
	fullQualifiedName: ValueOrArray<string>,
	options: GetChildMemberValueOptions = {}
): ValueType | undefined {
	return REACT_SIMPLE_MAPPING.DI.objectModel.getChildMemberValue<ValueType>(
		rootObj, fullQualifiedName, options, getChildMemberValue_default
	);
}

// Creates missing hierarchy and sets the value in the leaf object
function setChildMemberValue_default<ValueType = unknown, RootObj extends object = any>(
	rootObj: RootObj,
	fullQualifiedName: ValueOrArray<string>,
	value: unknown,
	options: SetChildMemberValueOptions = {}
): boolean {
	return getChildMember(rootObj, fullQualifiedName, true, options)?.setValue?.(value) || false;
}

REACT_SIMPLE_MAPPING.DI.objectModel.setChildMemberValue = setChildMemberValue_default;

// Creates missing hierarchy and sets the value in the leaf object
export function setChildMemberValue<RootObj extends object = any>(
	rootObj: RootObj,
	fullQualifiedName: ValueOrArray<string>,
	value: unknown,
	options: SetChildMemberValueOptions = {}
): boolean {
	return REACT_SIMPLE_MAPPING.DI.objectModel.setChildMemberValue(
		rootObj, fullQualifiedName, value, options, setChildMemberValue_default
	);
}

function deleteChildMember_default<ValueType = unknown, RootObj extends object = any>(
	rootObj: RootObj,
	fullQualifiedName: ValueOrArray<string>,
	options: DeleteChildMemberOptions
): boolean {
	// if object hierarchy is incomplete we return 'true'
	return resolveEmpty(getChildMember<ValueType | undefined>(rootObj, fullQualifiedName, false, options)?.deleteMember?.(), true);
}

REACT_SIMPLE_MAPPING.DI.objectModel.deleteChildMember = deleteChildMember_default;

export function deleteChildMember<ValueType = unknown, RootObj extends object = any>(
	rootObj: RootObj,
	fullQualifiedName: ValueOrArray<string>,
	options: DeleteChildMemberOptions = {}
): boolean {
	return REACT_SIMPLE_MAPPING.DI.objectModel.deleteChildMember<ValueType>(
		rootObj, fullQualifiedName, options, deleteChildMember_default
	);
}

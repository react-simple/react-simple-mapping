import { ValueOrArray, resolveEmpty } from "@react-simple/react-simple-util";
import { GetChildMemberValueOptions, SetChildMemberValueOptions, DeleteChildMemberOptions } from "./types";
import { REACT_SIMPLE_MAPPING } from "data";
import { getChildMemberInfo } from "./getChildMemberInfo";
import { getChildMemberReadOnlyInfo } from "./getChildMemberReadOnlyInfo";

// Does not create missing internal objects
function getChildMemberValue_default<TValueType = unknown>(
	startObj: object,
	fullQualifiedName: ValueOrArray<string>,
	options: GetChildMemberValueOptions
): TValueType | undefined {
	return getChildMemberReadOnlyInfo<TValueType>(startObj, fullQualifiedName, options)?.getValue?.();
}

REACT_SIMPLE_MAPPING.DI.objectModel.getChildMemberValue = getChildMemberValue_default;

// Does not create missing internal objects
export function getChildMemberValue<TValueType = unknown>(
	startObj: object,
	fullQualifiedName: ValueOrArray<string>,
	options: GetChildMemberValueOptions = {}
): TValueType | undefined {
	return REACT_SIMPLE_MAPPING.DI.objectModel.getChildMemberValue<TValueType>(
		startObj, fullQualifiedName, options, getChildMemberValue_default
	);
}

// Creates missing hierarchy and sets the value in the leaf object
function setChildMemberValue_default<TValueType = unknown>(
	startObj: object,
	fullQualifiedName: ValueOrArray<string>,
	value: TValueType,
	options: SetChildMemberValueOptions
): boolean {
	return getChildMemberInfo(startObj, fullQualifiedName, true, options)?.setValue?.(value) || false;
}

REACT_SIMPLE_MAPPING.DI.objectModel.setChildMemberValue = setChildMemberValue_default;

// Creates missing hierarchy and sets the value in the leaf object
export function setChildMemberValue<TValueType = unknown>(
	startObj: object,
	fullQualifiedName: ValueOrArray<string>,
	value: TValueType,
	options: SetChildMemberValueOptions = {}
): boolean {
	return REACT_SIMPLE_MAPPING.DI.objectModel.setChildMemberValue(
		startObj, fullQualifiedName, value, options, setChildMemberValue_default
	);
}

function deleteChildMember_default<TValueType = unknown>(
	startObj: object,
	fullQualifiedName: ValueOrArray<string>,
	deleteEmptyParents: boolean,
	options: DeleteChildMemberOptions
): boolean {
	// if object hierarchy is incomplete we return 'true'
	return resolveEmpty(getChildMemberInfo(startObj, fullQualifiedName, false, options)?.deleteMember?.(deleteEmptyParents), true);
}

REACT_SIMPLE_MAPPING.DI.objectModel.deleteChildMember = deleteChildMember_default;

export function deleteChildMember<TValueType = unknown>(
	startObj: object,
	fullQualifiedName: ValueOrArray<string>,
	deleteEmptyParents: boolean,
	options: DeleteChildMemberOptions = {}
): boolean {
	return REACT_SIMPLE_MAPPING.DI.objectModel.deleteChildMember<TValueType>(
		startObj, fullQualifiedName, deleteEmptyParents, options, deleteChildMember_default
	);
}

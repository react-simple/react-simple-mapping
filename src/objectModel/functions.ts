import { resolveEmpty } from "@react-simple/react-simple-util";
import { GetChildMemberValueOptions, SetChildMemberValueOptions, DeleteChildMemberOptions } from "./types";
import { REACT_SIMPLE_MAPPING } from "data";
import { getChildMemberInfo } from "./getChildMemberInfo";
import { getChildMemberReadOnlyInfo } from "./getChildMemberReadOnlyInfo";

// Does not create missing internal objects
function getChildMemberValue_default<Value = unknown>(
	startObj: object,
	fullQualifiedName: string,
	options: GetChildMemberValueOptions
): Value | undefined {
	return getChildMemberReadOnlyInfo<Value>(startObj, fullQualifiedName, options)?.getValue?.();
}

REACT_SIMPLE_MAPPING.DI.objectModel.getChildMemberValue = getChildMemberValue_default;

// Does not create missing internal objects
export function getChildMemberValue<Value = unknown>(
	startObj: object,
	fullQualifiedName: string,
	options: GetChildMemberValueOptions = {}
): Value | undefined {
	return REACT_SIMPLE_MAPPING.DI.objectModel.getChildMemberValue<Value>(
		startObj, fullQualifiedName, options, getChildMemberValue_default
	);
}

// Creates missing hierarchy and sets the value in the leaf object
function setChildMemberValue_default<Value = unknown>(
	startObj: object,
	fullQualifiedName: string,
	value: Value,
	options: SetChildMemberValueOptions
): void {
	getChildMemberInfo(startObj, fullQualifiedName, true, options)?.setValue?.(value);
}

REACT_SIMPLE_MAPPING.DI.objectModel.setChildMemberValue = setChildMemberValue_default;

// Creates missing hierarchy and sets the value in the leaf object
export function setChildMemberValue<Value = unknown>(
	startObj: object,
	fullQualifiedName: string,
	value: Value,
	options: SetChildMemberValueOptions = {}
): void {
	REACT_SIMPLE_MAPPING.DI.objectModel.setChildMemberValue(
		startObj, fullQualifiedName, value, options, setChildMemberValue_default
	);
}

function deleteChildMember_default<Value = unknown>(
	startObj: object,
	fullQualifiedName: string,
	deleteEmptyParents: boolean,
	options: DeleteChildMemberOptions
): void {
	// if object hierarchy is incomplete we return 'true'
	resolveEmpty(getChildMemberInfo(startObj, fullQualifiedName, false, options)?.deleteMember?.(deleteEmptyParents), true);
}

REACT_SIMPLE_MAPPING.DI.objectModel.deleteChildMember = deleteChildMember_default;

export function deleteChildMember<Value = unknown>(
	startObj: object,
	fullQualifiedName: string,
	deleteEmptyParents: boolean,
	options: DeleteChildMemberOptions = {}
): void {
	REACT_SIMPLE_MAPPING.DI.objectModel.deleteChildMember<Value>(
		startObj, fullQualifiedName, deleteEmptyParents, options, deleteChildMember_default
	);
}

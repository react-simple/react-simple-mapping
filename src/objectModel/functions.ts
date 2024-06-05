import {
	ValueOrArray, getNonEmptyValues, getResolvedObjectEntries, isArray, isValueType, recursiveIteration, resolveEmpty, stringAppend
} from "@react-simple/react-simple-util";
import {
	GetChildMemberValueOptions, ChildMemberInfo, ObjectWithFullQualifiedName, SetChildMemberValueOptions, ChildMemberInfoWithCallbacks,
	IterateChildMemberOptions, DeleteChildMemberOptionsExt
} from "./types";
import { REACT_SIMPLE_MAPPING } from "data";
import { getChildMemberInfo } from "./functions.getChildMember";
import { getChildMemberInfoCallbacks } from "./internal/functions";

// Does not create missing internal objects
function getChildMemberValue_default<ValueType = unknown, InvariantObj = any>(
	rootObj: object,
	fullQualifiedName: ValueOrArray<string>,
	options: GetChildMemberValueOptions<InvariantObj>
): ValueType | undefined {
	return getChildMemberInfo<ValueType | undefined>(rootObj, fullQualifiedName, false, options)?.getValue?.();
}

REACT_SIMPLE_MAPPING.DI.objectModel.getChildMemberValue = getChildMemberValue_default;

// Does not create missing internal objects
export function getChildMemberValue<ValueType = unknown, InvariantObj = any>(
	rootObj: object,
	fullQualifiedName: ValueOrArray<string>,
	options: GetChildMemberValueOptions<InvariantObj> = {}
): ValueType | undefined {
	return REACT_SIMPLE_MAPPING.DI.objectModel.getChildMemberValue<ValueType>(
		rootObj, fullQualifiedName, options, getChildMemberValue_default
	);
}

// Creates missing hierarchy and sets the value in the leaf object
function setChildMemberValue_default<InvariantObj = any>(
	rootObj: object,
	fullQualifiedName: ValueOrArray<string>,
	value: unknown,
	options: SetChildMemberValueOptions<InvariantObj> = {}
): boolean {
	return getChildMemberInfo(rootObj, fullQualifiedName, true, options)?.setValue?.(value) || false;
}

REACT_SIMPLE_MAPPING.DI.objectModel.setChildMemberValue = setChildMemberValue_default;

// Creates missing hierarchy and sets the value in the leaf object
export function setChildMemberValue<InvariantObj = any>(
	rootObj: object,
	fullQualifiedName: ValueOrArray<string>,
	value: unknown,
	options: SetChildMemberValueOptions<InvariantObj> = {}
): boolean {
	return REACT_SIMPLE_MAPPING.DI.objectModel.setChildMemberValue(
		rootObj, fullQualifiedName, value, options, setChildMemberValue_default
	);
}

function deleteChildMember_default<InvariantObj = any>(
	rootObj: object,
	fullQualifiedName: ValueOrArray<string>,
	options: DeleteChildMemberOptionsExt<InvariantObj>
): boolean {
	// if object hierarchy is incomplete we return 'true'
	return resolveEmpty(getChildMemberInfo(rootObj, fullQualifiedName, false, options)?.deleteMember?.(), true);
}

REACT_SIMPLE_MAPPING.DI.objectModel.deleteChildMember = deleteChildMember_default;

export function deleteChildMember<InvariantObj = any>(
	rootObj: object,
	fullQualifiedName: ValueOrArray<string>,
	options: DeleteChildMemberOptionsExt<InvariantObj> = {}
): boolean {
	return REACT_SIMPLE_MAPPING.DI.objectModel.deleteChildMember<InvariantObj>(
		rootObj, fullQualifiedName, options, deleteChildMember_default
	);
}

// Iterates all child members which can be get, set and deleted. Returns callbacks to do so.
function iterateChildMembers_default<InvariantObj = any>(
	rootObj: object,
	callback: (child: ChildMemberInfoWithCallbacks<InvariantObj>) => void,
	options: IterateChildMemberOptions<InvariantObj> = {}
) {
	if (rootObj) {
		// getValue(), setValue, deleteMember() callbacks are not used for array items only for object members
		const { getValue, setValue, deleteMember } = getChildMemberInfoCallbacks(options);

		const getChildren = options.getChildren || (parent => {
			return isArray(parent)
				? parent.map((value, index) => [index.toString(), value])
				: Object.entries(parent as any);
		});

		const root: ChildMemberInfo = {
			rootObj,
			obj: rootObj,
			name: "",
			fullQualifiedName: "",
			parents: []
		};

		const processChild = (
			item: ChildMemberInfo,
			childName: string,
			childNameIndexer: string | number,
			childValue: unknown,
			parents: ObjectWithFullQualifiedName[]
		) => {
			const fullQualifiedName = stringAppend(item.fullQualifiedName, childName, childName.startsWith("[") ? "" : ".");

			callback({
				...item,
				name: childName,
				fullQualifiedName,
				parents,
				getValue: () => getValue(item.obj, childNameIndexer, options),
				setValue: value => setValue(item.obj, childNameIndexer, value, options),
				deleteMember: () => deleteMember(item.obj, childNameIndexer, options)
			});

			if (childValue && !isValueType(childValue)) {
				// return array item as child (object or array)
				return {
					rootObj,
					obj: childValue,
					name: childName,
					fullQualifiedName,
					parents
				};
			}
		};
	
		recursiveIteration(
			root,
			({ item }) => {
				const parents = [...item.parents, item];
				const children = getResolvedObjectEntries(getChildren(item.obj));
				
				if (isArray(item.obj)) {
					return getNonEmptyValues(children.map(([childIndex, childValue]) =>
						processChild(item, `[${childIndex}]`, childIndex, childValue, parents))
					);
				}
				else {
					// object
					return getNonEmptyValues(children.map(([childName, childValue]) =>
						processChild(item, childName, childName, childValue, parents))
					);
				}
			}
		);
	}
}

REACT_SIMPLE_MAPPING.DI.objectModel.iterateChildMembers = iterateChildMembers_default;

// Iterates all child members which can be get, set and deleted. Returns callbacks to do so.
export function iterateChildMembers<InvariantObj = any>(
	rootObj: object,
	callback: (child: ChildMemberInfoWithCallbacks) => void,
	options: IterateChildMemberOptions<InvariantObj> = {}
) {
	REACT_SIMPLE_MAPPING.DI.objectModel.iterateChildMembers(rootObj, callback, options, iterateChildMembers_default);
}

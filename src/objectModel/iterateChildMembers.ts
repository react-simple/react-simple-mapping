import { getNonEmptyValues, getResolvedObjectEntries, isArray, isValueType, recursiveIteration, stringAppend } from "@react-simple/react-simple-util";
import { ChildMemberInfo, ObjectWithFullQualifiedName, ChildMemberInfoWithCallbacks, IterateChildMemberOptions, FullQualifiedName } from "./types";
import { REACT_SIMPLE_MAPPING } from "data";
import { getChildMemberInfoCallbacks } from "./internal/functions";

// Iterates all child members which can be get, set and deleted. Returns callbacks to do so.
function iterateChildMembers_default<TValueType = unknown>(
	startObj: object, // we do not want InvariantObj to automatically resolve to this
	callback: (child: ChildMemberInfoWithCallbacks<TValueType>) => void,
	options: IterateChildMemberOptions
) {
	if (startObj) {
		// getValue(), setValue, deleteChildMember() callbacks are not used for array items only for object members
		const { getMemberValue, setMemberValue, deleteMember } = getChildMemberInfoCallbacks(options);

		const getChildren = options.getChildren || (parent => {
			return isArray(parent)
				? parent.map((value, index) => [index.toString(), value])
				: Object.entries(parent as any);
		});

		const root: ChildMemberInfo = {
			startObj,
			rootObj: startObj,
			obj: startObj as any,
			names: { name: "", fullQualifiedName: "" },
			parents: []
		};

		const processChildObj: (
			item: ChildMemberInfo,
			childName: string,
			childValue: object,
			parents: ObjectWithFullQualifiedName[]
		) => ChildMemberInfo | undefined =
			(item, childName, childValue, parents) => {
				const names: FullQualifiedName = {
					name: childName,
					fullQualifiedName: stringAppend(item.names.fullQualifiedName, childName, ".")
				};

				callback({
					...item,
					names,
					parents,
					getValue: () => getMemberValue(item.obj, names, options) as TValueType | undefined,
					setValue: value => setMemberValue(item.obj, names, value, options),
					deleteMember: () => deleteMember(item.obj, names, options, parents)
				});

				return childValue && !isValueType(childValue)
					// return array item as child (object or array)
					? {
						startObj,
						rootObj: startObj,
						obj: childValue,
						names,
						parents
					} :
					undefined;
			};

		const processChildArray: (
			item: ChildMemberInfo,
			childIndex: string | number,
			childValue: object,
			parents: ObjectWithFullQualifiedName[]
		) => ChildMemberInfo | undefined =
			(item, childIndex, childValue, parents) => {
				const names: FullQualifiedName = {
					name: `[${childIndex}]`,
					fullQualifiedName: `${item.names.fullQualifiedName}[${childIndex}]`
				};

				callback({
					...item,
					names,
					parents,
					getValue: () => (item.obj as any)[childIndex],
					setValue: value => {
						(item.obj as any)[childIndex] = value;
						return true;
					},
					deleteMember: () => false // we do not delete array items here
				});

				return childValue && !isValueType(childValue)
					// return array item as child (object or array)
					? {
						startObj,
						rootObj: startObj,
						obj: childValue,
						names,
						parents
					} :
					undefined;
			};

		recursiveIteration(
			root,
			({ item }) => {
				const parents = [...item.parents, item];
				const children = getResolvedObjectEntries(getChildren(item.obj));

				if (isArray(item.obj)) {
					return getNonEmptyValues(children.map(([childIndex, childValue]) =>
						processChildArray(item, childIndex, childValue, parents))
					);
				}
				else {
					// object
					return getNonEmptyValues(children.map(([childName, childValue]) =>
						processChildObj(item, childName, childValue, parents))
					);
				}
			}
		);
	}
}

REACT_SIMPLE_MAPPING.DI.objectModel.iterateChildMembers = iterateChildMembers_default;

// Iterates all child members which can be get, set and deleted. Returns callbacks to do so.
export function iterateChildMembers<TValueType = unknown>(
	startObj: object,
	callback: (child: ChildMemberInfoWithCallbacks<TValueType>) => void,
	options: IterateChildMemberOptions = {}
) {
	REACT_SIMPLE_MAPPING.DI.objectModel.iterateChildMembers(startObj, callback, options, iterateChildMembers_default);
}

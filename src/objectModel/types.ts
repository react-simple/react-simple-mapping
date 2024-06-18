export interface FullQualifiedName {
	readonly name: string;
	readonly fullQualifiedName: string; // name.name.name...
}

export interface ObjectWithFullQualifiedName<Obj extends object = object> {
	readonly obj: Obj;
	readonly names: FullQualifiedName;
}

export interface ChildMemberInfo extends ObjectWithFullQualifiedName {

	readonly startObj: object; // the startObj for the get/set child method call
	readonly rootObj: object; // the root obj for the "/" prefix

	// all parents of obj starting from rootObj (last element is direct parent of obj)
	readonly parents: ObjectWithFullQualifiedName[];

	// if the parent member is an array and this member is an index
	readonly arrayInfo?: {
		readonly array: any[];
		readonly index: string;
	};
}

export interface ChildMemberReadOnlyInfoWithCallbacks<TValueType = unknown> extends ChildMemberInfo {
	// callbacks are not used for array items only for object members
	// see getChildMemberInfoCallbacks() for default implementation
	readonly getValue: () => TValueType | undefined;
}

export interface ChildMemberInfoWithCallbacks<TValueType = unknown> extends ChildMemberReadOnlyInfoWithCallbacks<TValueType> {
	readonly setValue: (value: TValueType) => boolean;
	readonly deleteMember: (deleteEmptyParents: boolean) => boolean;
}

export interface GetChildMemberValueOptions {
	pathSeparator?: string; // used only if fullQualifiedName is string, not a string array; default is '.'
	rootObj?: object; // the root obj for the "/" prefix

	// if specified and fullQualifiedName starts with "@name" then the evaluation will start at the named object found here, not the parameter object
	getNamedObj?: (name: string) => object | undefined;

	// by default parent[name] is used; these callbacks are used for all object iteration (not only for reading the value from the leaves)
	// also called for arrays, when parent is array and name is index
	getMemberValue?: (
		obj: object,
		names: FullQualifiedName,
		options: GetChildMemberValueOptions
	) => unknown;
}

export interface SetChildMemberValueOptions extends GetChildMemberValueOptions {
	// called not only for the value, but for creating missing internal objects
	setMemberValue?: (
		obj: object,
		names: FullQualifiedName,
		value: unknown,
		options: SetChildMemberValueOptions
	) => boolean;

	// called not only for the value, but for creating missing internal objects (arrays are created transparently)
	createMember?: (
		parent: object,
		names: FullQualifiedName,
		options: SetChildMemberValueOptions
	) => object;
}

export interface DeleteChildMemberOptions extends GetChildMemberValueOptions {
	// custom callback is only responsible to delete the member from the given object
	// recursive deletion of parent objects is handled by the caller deleteChildMember() function
	deleteMember?: (
		obj: object,
		names: FullQualifiedName,
		options: DeleteChildMemberOptions
	) => boolean;

	canDeleteMember?: (
		obj: object,
		names: FullQualifiedName,
		options: DeleteChildMemberOptions
	) => boolean;
}

export type GetChildMemberReadOnlyInfoOptions = GetChildMemberValueOptions;

export type GetChildMemberInfoOptions =
	& GetChildMemberReadOnlyInfoOptions
	& SetChildMemberValueOptions
	& DeleteChildMemberOptions;

export type IterateChildMemberOptions =
	& Pick<GetChildMemberInfoOptions, "getMemberValue" | "setMemberValue" | "deleteMember">
	& {
		getChildren?: (parent: object) => Record<string, unknown> | [string, unknown][];
	};

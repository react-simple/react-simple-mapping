export interface ObjectWithFullQualifiedName {
	readonly obj: any;
	readonly name: string;
	readonly fullQualifiedName: string; // name.name.name...
}

export interface GetChildMemberValueOptions {
	readonly pathSeparator?: string; // used only if fullQualifiedName is string, not a string array; default is '.'

	// if specified and fullQualifiedName starts with "/" then the evaluation will start at the root object, not the parameter object
	readonly rootObj?: any;

	// if specified and fullQualifiedName starts with "@name" then the evaluation will start at the named object found here, not the parameter object
	readonly getNamedObj?: (name: string) => any;

	// by default parent[name] is used; these callbacks are used for all object iteration (not only for reading the value from the leaves)
	// also called for arrays, when parent is array and name is index
	readonly getValue?: (parent: any, name: string, options: GetChildMemberValueOptions) => any;
}

export interface SetChildMemberValueOptions extends GetChildMemberValueOptions {
	// called not only for the value, but for creating missing internal objects
	readonly setValue?: (parent: any, name: string, value: unknown, options: SetChildMemberValueOptions) => boolean;

	// called not only for the value, but for creating missing internal objects (arrays are created transparently)
	readonly createObject?: (parent: any, name: string, options: SetChildMemberValueOptions) => object;
}

export interface DeleteChildMemberOptions extends GetChildMemberValueOptions {
	readonly deleteMember?: (parent: any, name: string, options: DeleteChildMemberOptions) => boolean;
}

export type GetChildMemberOptions = SetChildMemberValueOptions & DeleteChildMemberOptions;

export interface ChildMemberInfo<ValueType = any, RootObj extends object = any> extends ObjectWithFullQualifiedName {
	readonly rootObj: RootObj;

	// all parents of obj starting from rootObj (last element is direct parent of obj)
	readonly parents: ObjectWithFullQualifiedName[];

	// if member is array
	readonly arraySpec?: {
		readonly array: any[]; // == obj[name]
		readonly name: string; // [0]
		readonly fullQualifiedName: string; // name.name.name[0]
		readonly index: string; // 0
	};

	// callbacks
	readonly getValue: () => ValueType;
	readonly setValue: (value: ValueType) => boolean;
	readonly deleteMember: () => boolean;
}

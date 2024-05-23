export interface ObjectWithFullQualifiedName {
	readonly obj: any;
	readonly name: string;
	readonly fullQualifiedName: string; // name.name.name...
}

export interface GetObjectChildValueOptions {
	readonly pathSeparator?: string; // used only if fullQualifiedName is string, not a string array; default is '.'

	// if specified and fullQualifiedName starts with "/" then the evaluation will start at the root object, not the parameter object
	readonly rootObj?: any;

	// if specified and fullQualifiedName starts with "@name" then the evaluation will start at the named object found here, not the parameter object
	readonly getNamedObj?: (name: string) => any;

	// by default parent[name] is used; these callbacks are used for all object iteration (not only for reading the value from the leaves)
	// also called for arrays, when parent is array and name is index
	readonly getValue?: (parent: any, name: string, options: GetObjectChildValueOptions) => any;
}

export interface GetObjectChildValueReturn {
	// if the parent object was found it's set, if the hierarchy is not complete it's undefined
	accessor: GetObjectChildMemberReturn | undefined;
	value: unknown;
}

export interface SetObjectChildValueOptions extends GetObjectChildValueOptions {
	// called not only for the value, but for creating missing internal objects
	readonly setValue?: (parent: any, name: string, value: unknown, options: SetObjectChildValueOptions) => boolean;

	// called not only for the value, but for creating missing internal objects (arrays are created transparently)
	readonly createObject?: (parent: any, name: string, options: SetObjectChildValueOptions) => object;
}

export interface SetObjectChildValueReturn {
	accessor: GetObjectChildMemberReturn; // the parent obj will be created if the hierarchy is not complete
	success: boolean;
}

export interface DeleteObjectChildMemberOptions extends GetObjectChildValueOptions {
	readonly deleteMember?: (parent: any, name: string, options: DeleteObjectChildMemberOptions) => boolean;
}

export interface DeleteObjectChildMemberReturn {
	accessor: GetObjectChildMemberReturn | undefined; // the parent obj will be created if the hierarchy is not complete
	success: boolean;
	deleted: unknown;
}

export type GetObjectChildMemberOptions =
	& SetObjectChildValueOptions
	& DeleteObjectChildMemberOptions;

export interface GetObjectChildMemberReturn<ValueType = any, RootObj extends object = any> extends ObjectWithFullQualifiedName {
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

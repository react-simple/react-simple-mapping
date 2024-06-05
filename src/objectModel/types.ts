export interface ObjectWithFullQualifiedName<Obj = any> {
	readonly obj: Obj;
	readonly name: string;
	readonly fullQualifiedName: string; // name.name.name...
}

export interface ChildMemberInfo<RootObj = any> extends ObjectWithFullQualifiedName {
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
}

export interface ChildMemberInfoWithCallbacks<ValueType = any, RootObj = any> extends ChildMemberInfo<RootObj> {
	// callbacks are not used for array items only for object members
	// see getChildMemberInfoCallbacks() for default implementation
	readonly getValue: () => ValueType;
	readonly setValue: (value: ValueType) => boolean;
	readonly deleteMember: () => boolean;
}

// specify InvariantObj if all the child objects have the same type
export interface GetChildMemberValueOptions<InvariantObj = any> {
	pathSeparator?: string; // used only if fullQualifiedName is string, not a string array; default is '.'

	// if specified and fullQualifiedName starts with "/" then the evaluation will start at the root object, not the parameter object
	rootObj?: object;

	// if specified and fullQualifiedName starts with "@name" then the evaluation will start at the named object found here, not the parameter object
	getNamedObj?: (name: string) => any;

	// by default parent[name] is used; these callbacks are used for all object iteration (not only for reading the value from the leaves)
	// also called for arrays, when parent is array and name is index
	getValue?: (
		parent: ObjectWithFullQualifiedName<InvariantObj>,
		name: string | number,
		options: GetChildMemberValueOptions<InvariantObj>
	) => any;
}

// specify InvariantObj if all the child objects have the same type
export interface SetChildMemberValueOptions<InvariantObj = any> extends GetChildMemberValueOptions<InvariantObj> {
	// called not only for the value, but for creating missing internal objects
	setValue?: (
		parent: ObjectWithFullQualifiedName<InvariantObj>,
		name: string | number,
		value: unknown, options: SetChildMemberValueOptions<InvariantObj>
	) => boolean;

	// called not only for the value, but for creating missing internal objects (arrays are created transparently)
	createObject?: (
		parent: ObjectWithFullQualifiedName<InvariantObj>,
		name: string | number,
		options: SetChildMemberValueOptions<InvariantObj>
	) => object;
}

// specify InvariantObj if all the child objects have the same type
export interface DeleteChildMemberOptions<InvariantObj = any> extends GetChildMemberValueOptions<InvariantObj> {
	// custom callback is only responsible to delete the member from the given object
	// recursive deletion of parent objects is handled by the caller deleteChildMember() function
	deleteMember?: (
		parent: ObjectWithFullQualifiedName<InvariantObj>,
		name: string | number,
		options: DeleteChildMemberOptions<InvariantObj>
	) => boolean;
}

// specify InvariantObj if all the child objects have the same type
export interface DeleteChildMemberOptionsExt<InvariantObj = any> extends DeleteChildMemberOptions<InvariantObj> {	
	deleteEmptyParents?: boolean;
	parents?: ObjectWithFullQualifiedName[];
	
	canDeleteObject?: (
		parent: ObjectWithFullQualifiedName<InvariantObj>,
		name: string | number,
		options: DeleteChildMemberOptions<InvariantObj>
	) => boolean;
}

// specify InvariantObj if all the child objects have the same type
export type GetChildMemberInfoOptions<InvariantObj = any> =
	& SetChildMemberValueOptions<InvariantObj>
	& DeleteChildMemberOptions<InvariantObj>;

// specify InvariantObj if all the child objects have the same type
export type IterateChildMemberOptions<InvariantObj = any> = Pick<GetChildMemberInfoOptions<InvariantObj>, "getValue" | "setValue" | "deleteMember"> & {
	getChildren?: (parent: InvariantObj) => Record<string, unknown> | [string, unknown][];
};

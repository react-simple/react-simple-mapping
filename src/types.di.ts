import {
	DeleteChildMemberOptions, GetChildMemberInfoOptions, GetChildMemberValueOptions, SetChildMemberValueOptions, ChildMemberInfoWithCallbacks,
	IterateChildMemberOptions, ChildMemberReadOnlyInfoWithCallbacks, GetChildMemberReadOnlyInfoOptions
} from "objectModel/types";

export interface ReactSimpleMappingDependencyInjection {
	helpers: {
		isFullQualifiedMemberNameParentChild: (
			parentPath: string,
			childPath: string,
			bidirectional: boolean,
			defaultImpl: ReactSimpleMappingDependencyInjection["helpers"]["isFullQualifiedMemberNameParentChild"]
		) => boolean;
	};

	objectModel: {
		getChildMemberInfo: <Value>(
			startObj: object,
			fullQualifiedName: string,
			createMissingChildObjects: boolean,
			options: GetChildMemberInfoOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["getChildMemberInfo"]
		) => ChildMemberInfoWithCallbacks<Value> | undefined;

		getChildMemberReadOnlyInfo: <Value>(
			startObj: object,
			fullQualifiedName: string,
			options: GetChildMemberReadOnlyInfoOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["getChildMemberReadOnlyInfo"]
		) => ChildMemberReadOnlyInfoWithCallbacks<Value> | undefined;

		getChildMemberValue: <Value = unknown>(
			startObj: object,
			fullQualifiedName: string,
			options: GetChildMemberValueOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["getChildMemberValue"]
		) => Value | undefined;

		setChildMemberValue: <Value = unknown>(
			startObj: object,
			fullQualifiedName: string,
			value: Value,
			options: SetChildMemberValueOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["setChildMemberValue"]
		) => void;

		deleteChildMember: <Value = unknown>(
			startObj: object,
			fullQualifiedName: string,
			deleteEmptyParents: boolean,
			options: DeleteChildMemberOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["deleteChildMember"]
		) => void;

		iterateChildMembers: <Value = unknown>(
			startObj: object,
			callback: (child: ChildMemberInfoWithCallbacks<Value>) => void,
			options: IterateChildMemberOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["iterateChildMembers"]
		) => void;
	};
}

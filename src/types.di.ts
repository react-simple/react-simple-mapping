import { ValueOrArray } from "@react-simple/react-simple-util";
import {
	DeleteChildMemberOptionsExt, GetChildMemberInfoOptions, GetChildMemberValueOptions, SetChildMemberValueOptions, ChildMemberInfoWithCallbacks,
	IterateChildMemberOptions
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
		getChildMemberInfo: <ValueType = unknown, InvariantObj = any, RootObj = any>(
			rootObj: RootObj,
			fullQualifiedName: ValueOrArray<string>,
			createMissingChildObjects: boolean,
			options: GetChildMemberInfoOptions<InvariantObj>,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["getChildMemberInfo"]
		) => ChildMemberInfoWithCallbacks<ValueType, RootObj> | undefined;

		getChildMemberValue: <ValueType = unknown, InvariantObj = any>(
			rootObj: object,
			fullQualifiedName: ValueOrArray<string>,
			options: GetChildMemberValueOptions<InvariantObj>,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["getChildMemberValue"]
		) => ValueType | undefined;

		setChildMemberValue: <InvariantObj = any>(
			rootObj: object,
			fullQualifiedName: ValueOrArray<string>,
			value: unknown,
			options: SetChildMemberValueOptions<InvariantObj>,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["setChildMemberValue"]
		) => boolean;

		deleteChildMember: <InvariantObj = any>(
			rootObj: object,
			fullQualifiedName: ValueOrArray<string>,
			options: DeleteChildMemberOptionsExt<InvariantObj>,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["deleteChildMember"]
		) => boolean;

		iterateChildMembers: <InvariantObj = any>(
			rootObj: object,
			callback: (child: ChildMemberInfoWithCallbacks<InvariantObj>) => void,
			options: IterateChildMemberOptions<InvariantObj>,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["iterateChildMembers"]
		) => void;
	};
};

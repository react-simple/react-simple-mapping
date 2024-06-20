import { ValueOrArray } from "@react-simple/react-simple-util";
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
		getChildMemberInfo: <TValueType>(
			startObj: object,
			fullQualifiedName: ValueOrArray<string>,
			createMissingChildObjects: boolean,
			options: GetChildMemberInfoOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["getChildMemberInfo"]
		) => ChildMemberInfoWithCallbacks<TValueType> | undefined;

		getChildMemberReadOnlyInfo: <TValueType>(
			startObj: object,
			fullQualifiedName: ValueOrArray<string>,
			options: GetChildMemberReadOnlyInfoOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["getChildMemberReadOnlyInfo"]
		) => ChildMemberReadOnlyInfoWithCallbacks<TValueType> | undefined;

		getChildMemberValue: <TValueType = unknown>(
			startObj: object,
			fullQualifiedName: ValueOrArray<string>,
			options: GetChildMemberValueOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["getChildMemberValue"]
		) => TValueType | undefined;

		setChildMemberValue: <TValueType = unknown>(
			startObj: object,
			fullQualifiedName: ValueOrArray<string>,
			value: TValueType,
			options: SetChildMemberValueOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["setChildMemberValue"]
		) => void;

		deleteChildMember: <TValueType = unknown>(
			startObj: object,
			fullQualifiedName: ValueOrArray<string>,
			deleteEmptyParents: boolean,
			options: DeleteChildMemberOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["deleteChildMember"]
		) => void;

		iterateChildMembers: <TValueType = unknown>(
			startObj: object,
			callback: (child: ChildMemberInfoWithCallbacks<TValueType>) => void,
			options: IterateChildMemberOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["iterateChildMembers"]
		) => void;
	};
}

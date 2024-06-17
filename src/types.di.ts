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
		getChildMemberInfo: <TValueType, InvariantObj>(
			startObj: object, // we do not want InvariantObj to automatically resolve to this
			fullQualifiedName: ValueOrArray<string>,
			createMissingChildObjects: boolean,
			options: GetChildMemberInfoOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["getChildMemberInfo"]
		) => ChildMemberInfoWithCallbacks<TValueType> | undefined;

		getChildMemberValue: <TValueType = unknown>(
			startObj: object, // we do not want InvariantObj to automatically resolve to this
			fullQualifiedName: ValueOrArray<string>,
			options: GetChildMemberValueOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["getChildMemberValue"]
		) => TValueType | undefined;

		setChildMemberValue: <TValueType = unknown>(
			startObj: object, // we do not want InvariantObj to automatically resolve to this
			fullQualifiedName: ValueOrArray<string>,
			value: TValueType,
			options: SetChildMemberValueOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["setChildMemberValue"]
		) => boolean;

		deleteChildMember: <TValueType = unknown>(
			startObj: object, // we do not want InvariantObj to automatically resolve to this
			fullQualifiedName: ValueOrArray<string>,
			options: DeleteChildMemberOptionsExt,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["deleteChildMember"]
		) => boolean;

		iterateChildMembers: <TValueType = unknown>(
			startObj: object, // we do not want InvariantObj to automatically resolve to this
			callback: (child: ChildMemberInfoWithCallbacks<TValueType>) => void,
			options: IterateChildMemberOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["iterateChildMembers"]
		) => void;
	};
}

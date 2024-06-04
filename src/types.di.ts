import { ValueOrArray } from "@react-simple/react-simple-util";
import {
	DeleteChildMemberOptions, GetChildMemberOptions, ChildMemberInfo, GetChildMemberValueOptions, SetChildMemberValueOptions
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
		getChildMember: <ValueType = unknown, RootObj extends object = any>(
			rootObj: RootObj,
			fullQualifiedName: ValueOrArray<string>,
			createMissingChildObjects: boolean,
			options: GetChildMemberOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["getChildMember"]
		) => ChildMemberInfo<ValueType, RootObj> | undefined;

		getChildMemberValue: <ValueType = unknown, RootObj extends object = any>(
			rootObj: RootObj,
			fullQualifiedName: ValueOrArray<string>,
			options: GetChildMemberValueOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["getChildMemberValue"]
		) => ValueType | undefined;

		setChildMemberValue: <RootObj extends object = any>(
			rootObj: RootObj,
			fullQualifiedName: ValueOrArray<string>,
			value: unknown,
			options: SetChildMemberValueOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["setChildMemberValue"]
		) => boolean;

		deleteChildMember: <ValueType = unknown, RootObj extends object = any>(
			rootObj: RootObj,
			fullQualifiedName: ValueOrArray<string>,
			options: DeleteChildMemberOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["deleteChildMember"]
		) => boolean;
	};
}

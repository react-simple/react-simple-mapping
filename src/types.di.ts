import { ValueOrArray } from "@react-simple/react-simple-util";
import {
	DeleteObjectChildMemberOptions, DeleteObjectChildMemberReturn, GetObjectChildMemberOptions, GetObjectChildMemberReturn,
	GetObjectChildValueOptions, GetObjectChildValueReturn, SetObjectChildValueOptions, SetObjectChildValueReturn
} from "objectModel/types";

export interface ReactSimpleMappingDependencyInjection {
	objectModel: {
		getObjectChildMember: <ValueType = unknown, RootObj extends object = any>(
			rootObj: RootObj,
			fullQualifiedName: ValueOrArray<string>,
			createMissingObjects: boolean,
			options: GetObjectChildMemberOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["getObjectChildMember"]
		) => GetObjectChildMemberReturn<ValueType, RootObj> | undefined;

		getObjectChildValue: <RootObj extends object = any>(
			rootObj: RootObj,
			fullQualifiedName: ValueOrArray<string>,
			options: GetObjectChildValueOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["getObjectChildValue"]
		) => GetObjectChildValueReturn;

		setObjectChildValue: <RootObj extends object = any>(
			rootObj: RootObj,
			fullQualifiedName: ValueOrArray<string>,
			value: unknown,
			options: SetObjectChildValueOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["setObjectChildValue"]
		) => SetObjectChildValueReturn;

		deleteObjectChildMember: <RootObj extends object = any>(
			rootObj: RootObj,
			fullQualifiedName: ValueOrArray<string>,
			options: DeleteObjectChildMemberOptions,
			defaultImpl: ReactSimpleMappingDependencyInjection["objectModel"]["deleteObjectChildMember"]
		) => DeleteObjectChildMemberReturn;
	};
}

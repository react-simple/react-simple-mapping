import { deepCopyObject } from "@react-simple/react-simple-util";
import { GetChildMemberValueOptions, getChildMemberInfo } from "objectModel";
import { CHILD_MEMBER_TESTOBJ } from "objectModel/test.data";

it('getChildMemberInfo.setValue.arrayPath', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { obj, setValue } = getChildMemberInfo(copy, ["a", "b", "c"], true) || {};
	setValue?.(2);

	expect(copy.a.b.c).toBe(2);
	expect((obj as any)?.c).toBe(2);
	expect(obj).toBe(copy.a.b);
});

it('getChildMemberInfo.setValue.stringPath', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { obj, setValue } = getChildMemberInfo(copy, "a.b.c", true) || {};
	setValue?.(2);

	expect(copy.a.b.c).toBe(2);
	expect((obj as any)?.c).toBe(2);
	expect(obj).toBe(copy.a.b);
});

it('getChildMemberInfo.setValue.nonExistingMember.stringPath', () => {
	const data: any = {};
	const { obj, setValue } = getChildMemberInfo(data, "a.b.c", true) || {};
	setValue?.(2);

	expect(data.a?.b?.c).toBe(2);
	expect((obj as any)?.c).toBe(2);
	expect(obj).toBe(data.a.b);
});

it('getChildMemberInfo.setValue.array.arrayPath[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { obj, arrayInfo: arraySpec, setValue } = getChildMemberInfo(copy, ["a", "b", "array[0]"], true) || {};
	setValue?.(22);

	expect(copy.a.b.array[0]).toBe(22);
	expect((obj as any)?.array?.[0]).toBe(22);
	expect(obj).toBe(copy.a.b);
	expect(arraySpec?.array?.[0]).toBe(22);
});

it('getChildMemberInfo.setValue.array.arrayPath.[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { obj, arrayInfo: arraySpec, setValue } = getChildMemberInfo(copy, ["a", "b", "array.[0]"], true) || {};
	setValue?.(22);

	expect(copy.a.b.array[0]).toBe(22);
	expect((obj as any)?.array?.[0]).toBe(22);
	expect(obj).toBe(copy.a.b);
	expect(arraySpec?.array?.[0]).toBe(22);
});

it('getChildMemberInfo.setValue.array.arrayPath/[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { obj, arrayInfo: arraySpec, setValue } = getChildMemberInfo(copy, ["a", "b", "array", "[0]"], true) || {};
	setValue?.(22);

	expect(copy.a.b.array[0]).toBe(22);
	expect((obj as any)?.array?.[0]).toBe(22);
	expect(obj).toBe(copy.a.b);
	expect(arraySpec?.array?.[0]).toBe(22);
});

it('getChildMemberInfo.setValue.array.stringPath[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { obj, arrayInfo: arraySpec, setValue } = getChildMemberInfo(copy, "a.b.array[0]", true) || {};
	setValue?.(22);

	expect(copy.a.b.array[0]).toBe(22);
	expect((obj as any)?.array?.[0]).toBe(22);
	expect(obj).toBe(copy.a.b);
	expect(arraySpec?.array?.[0]).toBe(22);
});

it('getChildMemberInfo.setValue.array.stringPath.[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { obj, arrayInfo: arraySpec, setValue } = getChildMemberInfo(copy, "a.b.array.[0]", true) || {};
	setValue?.(22);

	expect(copy.a.b.array[0]).toBe(22);
	expect((obj as any)?.array?.[0]).toBe(22);
	expect(obj).toBe(copy.a.b);
	expect(arraySpec?.array?.[0]).toBe(22);
});

it('getChildMemberInfo.setValue.nonExistingMember.array.stringPath', () => {
	const data: any = {};
	const { obj, setValue } = getChildMemberInfo(data, "a.b.array[0]", true) || {};
	setValue?.(22);

	expect(data?.a?.b?.array?.[0]).toBe(22);
	expect((obj as any)?.array?.[0]).toBe(22);
	expect(obj).toBe(data.a?.b);
});

it('getChildMemberInfo.setValue.stringPath.customSeparator', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { obj, setValue } = getChildMemberInfo(copy, "a/b/c", true, { pathSeparator: "/" }) || {};
	setValue?.(2);

	expect(copy.a.b.c).toBe(2);
	expect((obj as any)?.c).toBe(2);
	expect(obj).toBe(copy.a.b);
});

it('getChildMemberInfo.setValue.stringPath.rootObj', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options = { rootObj: copy };
	const { obj, setValue } = getChildMemberInfo(copy.a.b, "/a.b.c", true, options) || {};
	setValue?.(2);

	expect(copy.a.b.c).toBe(2);
	expect((obj as any)?.c).toBe(2);
	expect(obj).toBe(copy.a.b);
});

it('getChildMemberInfo.setValue.stringPath.namedObjs', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options: GetChildMemberValueOptions = {
		getNamedObj: name => name === "bbb" ? copy.a.b : undefined
	};

	const { obj, setValue } = getChildMemberInfo(copy, "@bbb.c", true, options) || {};
	setValue?.(2);

	expect(copy.a.b.c).toBe(2);
	expect((obj as any)?.c).toBe(2);
	expect(obj).toBe(copy.a.b);
});

it('getChildMemberInfo.setValue.custom.setMemberValue', () => {
	const data = { a_: { b_: { c_: 1 } } };

	const { setValue } = getChildMemberInfo(data, "a.b.c", true, {
		getMemberValue: (parent, name) => {
			expect(name.fullQualifiedName).toBe(name.name === "a" ? "a" : name.name === "b" ? "a.b" : "a.b.c");
			return (parent as any)[`${name.name}_`];
		},
		setMemberValue: (parent, name, value) => {
			expect(name.fullQualifiedName).toBe(name.name === "a" ? "a" : name.name === "b" ? "a.b" : "a.b.c");
			(parent as any)[`${name.name}_`] = value;
			return true;
		}
	}) || {};
	setValue?.(2);

	expect(data.a_.b_.c_).toBe(2);
});

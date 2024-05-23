import { deepCopyObject } from "@react-simple/react-simple-util";
import { GetObjectChildValueOptions, getObjectChildMember } from "objectModel";
import { CHILD_MEMBER_TESTOBJ } from "objectModel/test.data";

it('getObjectChildMember.setValue.arrayPath', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { obj, setValue } = getObjectChildMember(copy, ["a", "b", "c"], true) || {};
	setValue?.(2);

	expect(copy.a.b.c).toBe(2);
	expect(obj?.c).toBe(2);
	expect(obj).toBe(copy.a.b);
});

it('getObjectChildMember.setValue.stringPath', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { obj, setValue } = getObjectChildMember(copy, "a.b.c", true) || {};
	setValue?.(2);

	expect(copy.a.b.c).toBe(2);
	expect(obj?.c).toBe(2);
	expect(obj).toBe(copy.a.b);
});

it('getObjectChildMember.setValue.nonExistingMember.stringPath', () => {
	const data: any = {};
	const { obj, setValue } = getObjectChildMember(data, "a.b.c", true) || {};
	setValue?.(2);

	expect(data.a?.b?.c).toBe(2);
	expect(obj?.c).toBe(2);
	expect(obj).toBe(data.a.b);
});

it('getObjectChildMember.setValue.array.arrayPath[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { obj, arraySpec, setValue } = getObjectChildMember(copy, ["a", "b", "array[0]"], true) || {};
	setValue?.(22);

	expect(copy.a.b.array[0]).toBe(22);
	expect(obj?.array?.[0]).toBe(22);
	expect(obj).toBe(copy.a.b);
	expect(arraySpec?.array?.[0]).toBe(22);
});

it('getObjectChildMember.setValue.array.arrayPath.[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { obj, arraySpec, setValue } = getObjectChildMember(copy, ["a", "b", "array.[0]"], true) || {};
	setValue?.(22);

	expect(copy.a.b.array[0]).toBe(22);
	expect(obj?.array?.[0]).toBe(22);
	expect(obj).toBe(copy.a.b);
	expect(arraySpec?.array?.[0]).toBe(22);
});

it('getObjectChildMember.setValue.array.arrayPath/[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { obj, arraySpec, setValue } = getObjectChildMember(copy, ["a", "b", "array", "[0]"], true) || {};
	setValue?.(22);

	expect(copy.a.b.array[0]).toBe(22);
	expect(obj?.array?.[0]).toBe(22);
	expect(obj).toBe(copy.a.b);
	expect(arraySpec?.array?.[0]).toBe(22);
});

it('getObjectChildMember.setValue.array.stringPath[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { obj, arraySpec, setValue } = getObjectChildMember(copy, "a.b.array[0]", true) || {};
	setValue?.(22);

	expect(copy.a.b.array[0]).toBe(22);
	expect(obj?.array?.[0]).toBe(22);
	expect(obj).toBe(copy.a.b);
	expect(arraySpec?.array?.[0]).toBe(22);
});

it('getObjectChildMember.setValue.array.stringPath.[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { obj, arraySpec, setValue } = getObjectChildMember(copy, "a.b.array.[0]", true) || {};
	setValue?.(22);

	expect(copy.a.b.array[0]).toBe(22);
	expect(obj?.array?.[0]).toBe(22);
	expect(obj).toBe(copy.a.b);
	expect(arraySpec?.array?.[0]).toBe(22);
});

it('getObjectChildMember.setValue.nonExistingMember.array.stringPath', () => {
	const data: any = {};
	const { obj, setValue } = getObjectChildMember(data, "a.b.array[0]", true) || {};
	setValue?.(22);

	expect(data?.a?.b?.array?.[0]).toBe(22);
	expect(obj?.array?.[0]).toBe(22);
	expect(obj).toBe(data.a?.b);
});

it('getObjectChildMember.setValue.stringPath.customSeparator', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { obj, setValue } = getObjectChildMember(copy, "a/b/c", true, { pathSeparator: "/" }) || {};
	setValue?.(2);

	expect(copy.a.b.c).toBe(2);
	expect(obj?.c).toBe(2);
	expect(obj).toBe(copy.a.b);
});

it('getObjectChildMember.setValue.stringPath.rootObj', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options = { rootObj: copy };
	const { obj, setValue } = getObjectChildMember(copy.a.b, "/a.b.c", true, options) || {};
	setValue?.(2);

	expect(copy.a.b.c).toBe(2);
	expect(obj?.c).toBe(2);
	expect(obj).toBe(copy.a.b);
});

it('getObjectChildMember.setValue.stringPath.namedObjs', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options: GetObjectChildValueOptions = {
		getNamedObj: name => name === "bbb" ? copy.a.b : undefined
	};

	const { obj, setValue } = getObjectChildMember(copy, "@bbb.c", true, options) || {};
	setValue?.(2);

	expect(copy.a.b.c).toBe(2);
	expect(obj?.c).toBe(2);
	expect(obj).toBe(copy.a.b);
});

it('getObjectChildMember.setValue.custom.setMemberValue', () => {
	const data = { a_: { b_: { c_: 1 } } };

	const { setValue } = getObjectChildMember(data, "a.b.c", true, {
		getValue: (parent, name) => parent[`${name}_`],
		setValue: (parent, name, value) => { parent[`${name}_`] = value; return true; }
	}) || {};
	setValue?.(2);

	expect(data.a_.b_.c_).toBe(2);
});

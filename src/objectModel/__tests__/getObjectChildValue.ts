import { GetObjectChildValueOptions, getObjectChildValue } from "objectModel";
import { CHILD_MEMBER_TESTOBJ } from "objectModel/test.data";

it('getObjectChildValue.arrayPath', () => {
	expect(getObjectChildValue(CHILD_MEMBER_TESTOBJ, ["a", "b", "c"]).value).toBe(1);
});

it('getObjectChildValue.stringPath', () => {
	expect(getObjectChildValue(CHILD_MEMBER_TESTOBJ, "a.b.c").value).toBe(1);
});

it('getObjectChildValue.stringPath.nonExistent', () => {
	expect(getObjectChildValue(CHILD_MEMBER_TESTOBJ, "a.b.c2").value).toBeUndefined();
	expect(getObjectChildValue(CHILD_MEMBER_TESTOBJ, "a.b2.c").value).toBeUndefined();
	expect(getObjectChildValue(CHILD_MEMBER_TESTOBJ, "a2.b.c").value).toBeUndefined();
});

it('getObjectChildValue.array.arrayPath[0]', () => {
	expect(getObjectChildValue(CHILD_MEMBER_TESTOBJ, ["a", "b", "array[0]"]).value).toBe(11);
});

it('getObjectChildValue.array.arrayPath.[0]', () => {
	expect(getObjectChildValue(CHILD_MEMBER_TESTOBJ, ["a", "b", "array.[0]"]).value).toBe(11);
});

it('getObjectChildValue.array.arrayPath/[0]', () => {
	expect(getObjectChildValue(CHILD_MEMBER_TESTOBJ, ["a", "b", "array", "[0]"]).value).toBe(11);
});

it('getObjectChildValue.array.stringPath[0]', () => {
	expect(getObjectChildValue(CHILD_MEMBER_TESTOBJ, "a.b.array[0]").value).toBe(11);
});

it('getObjectChildValue.array.stringPath.[0]', () => {
	expect(getObjectChildValue(CHILD_MEMBER_TESTOBJ, "a.b.array.[0]").value).toBe(11);
});

it('getObjectChildValue.stringPath.customSeparator', () => {
	expect(getObjectChildValue(CHILD_MEMBER_TESTOBJ, "a/b/c", { pathSeparator: "/" }).value).toBe(1);
});

it('getObjectChildValue.stringPath.rootObj', () => {
	const options = { rootObj: CHILD_MEMBER_TESTOBJ };

	expect(getObjectChildValue(CHILD_MEMBER_TESTOBJ.a.b, "a.b.c", options).value).toBe(undefined);
	expect(getObjectChildValue(CHILD_MEMBER_TESTOBJ.a.b, "a./a.b.c", options).value).toBe(undefined);
	expect(getObjectChildValue(CHILD_MEMBER_TESTOBJ.a.b, "/a.b.c", options).value).toBe(1);
});

it('getObjectChildValue.stringPath.namedObjs', () => {
	const options: GetObjectChildValueOptions = {
		getNamedObj: name => name === "bbb" ? CHILD_MEMBER_TESTOBJ.a.b : undefined
	};

	expect(getObjectChildValue(CHILD_MEMBER_TESTOBJ, "@b.c", options).value).toBe(undefined);
	expect(getObjectChildValue(CHILD_MEMBER_TESTOBJ, "@bb.c", options).value).toBe(undefined);
	expect(getObjectChildValue(CHILD_MEMBER_TESTOBJ, "a.@bbb.c", options).value).toBe(undefined);
	expect(getObjectChildValue(CHILD_MEMBER_TESTOBJ, "@bbb.c", options).value).toBe(1);
});

it('getObjectChildValue.custom.getMemberValue', () => {
	const data = { a_: { b_: { c_: 1 } } };

	expect(getObjectChildValue(data, "a.b.c", {
		getValue: (parent, name) => parent[`${name}_`]
	}).value).toBe(1);
});

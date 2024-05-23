import { deepCopyObject } from "@react-simple/react-simple-util";
import { GetObjectChildValueOptions, setObjectChildValue } from "objectModel";
import { CHILD_MEMBER_TESTOBJ } from "objectModel/test.data";

it('setObjectChildValue.arrayPath', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { accessor, success } = setObjectChildValue(copy, ["a", "b", "c"], 2);

	expect(success).toBe(true);
	expect(copy.a.b.c).toBe(2);
	expect(accessor.obj?.c).toBe(2);
	expect(accessor.obj).toBe(copy.a.b);
});

it('setObjectChildValue.stringPath', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { accessor, success } = setObjectChildValue(copy, "a.b.c", 2);

	expect(success).toBe(true);
	expect(copy.a.b.c).toBe(2);
	expect(accessor.obj?.c).toBe(2);
	expect(accessor.obj).toBe(copy.a.b);
});

it('setObjectChildValue.nonExistingMember.stringPath', () => {
	const data: any = {};
	const { accessor, success } = setObjectChildValue(data, "a.b.c", 2);

	expect(success).toBe(true);
	expect(data.a?.b?.c).toBe(2);
	expect(accessor.obj?.c).toBe(2);
	expect(accessor.obj).toBe(data.a.b);
});

it('setObjectChildValue.array.arrayPath[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { accessor, success } = setObjectChildValue(copy, ["a", "b", "array[0]"], 22);

	expect(success).toBe(true);
	expect(copy.a.b.array[0]).toBe(22);
	expect(accessor.obj?.array?.[0]).toBe(22);
	expect(accessor.obj).toBe(copy.a.b);
	expect(accessor.arraySpec?.array?.[0]).toBe(22);
});

it('setObjectChildValue.array.arrayPath.[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { accessor, success } = setObjectChildValue(copy, ["a", "b", "array.[0]"], 22);

	expect(success).toBe(true);
	expect(copy.a.b.array[0]).toBe(22);
	expect(accessor.obj?.array?.[0]).toBe(22);
	expect(accessor.obj).toBe(copy.a.b);
	expect(accessor.arraySpec?.array?.[0]).toBe(22);
});

it('setObjectChildValue.array.arrayPath/[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { accessor, success } = setObjectChildValue(copy, ["a", "b", "array", "[0]"], 22);

	expect(success).toBe(true);
	expect(copy.a.b.array[0]).toBe(22);
	expect(accessor.obj?.array?.[0]).toBe(22);
	expect(accessor.obj).toBe(copy.a.b);
	expect(accessor.arraySpec?.array?.[0]).toBe(22);
});

it('setObjectChildValue.array.stringPath[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { accessor, success } = setObjectChildValue(copy, "a.b.array[0]", 22);

	expect(success).toBe(true);
	expect(copy.a.b.array[0]).toBe(22);
	expect(accessor.obj?.array?.[0]).toBe(22);
	expect(accessor.obj).toBe(copy.a.b);
	expect(accessor.arraySpec?.array?.[0]).toBe(22);
});

it('setObjectChildValue.array.stringPath.[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { accessor, success } = setObjectChildValue(copy, "a.b.array.[0]", 22);

	expect(success).toBe(true);
	expect(copy.a.b.array[0]).toBe(22);
	expect(accessor.obj?.array?.[0]).toBe(22);
	expect(accessor.obj).toBe(copy.a.b);
	expect(accessor.arraySpec?.array?.[0]).toBe(22);
});

it('setObjectChildValue.nonExistingMember.array.stringPath', () => {
	const data: any = {};
	const { accessor, success } = setObjectChildValue(data, "a.b.array[0]", 22);

	expect(success).toBe(true);
	expect(data?.a?.b?.array?.[0]).toBe(22);
	expect(accessor.obj?.array?.[0]).toBe(22);
	expect(accessor.obj).toBe(data.a?.b);
});

it('setObjectChildValue.stringPath.customSeparator', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { accessor, success } = setObjectChildValue(copy, "a/b/c", 2, { pathSeparator: "/" });

	expect(success).toBe(true);
	expect(copy.a.b.c).toBe(2);
	expect(accessor.obj?.c).toBe(2);
	expect(accessor.obj).toBe(copy.a.b);
});

it('setObjectChildValue.stringPath.rootObj', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options = { rootObj: copy };
	const { accessor, success } = setObjectChildValue(copy.a.b, "/a.b.c", 2, options);

	expect(success).toBe(true);
	expect(copy.a.b.c).toBe(2);
	expect(accessor.obj?.c).toBe(2);
	expect(accessor.obj).toBe(copy.a.b);
});

it('setObjectChildValue.stringPath.namedObjs', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options: GetObjectChildValueOptions = {
		getNamedObj: name => name === "bbb" ? copy.a.b : undefined
	};

	const { accessor, success } = setObjectChildValue(copy, "@bbb.c", 2, options);

	expect(success).toBe(true);
	expect(copy.a.b.c).toBe(2);
	expect(accessor.obj?.c).toBe(2);
	expect(accessor.obj).toBe(copy.a.b);
});

it('setObjectChildValue.custom.setMemberValue', () => {
	const data = { a_: { b_: { c_: 1 } } };

	const { accessor, success } = setObjectChildValue(data, "a.b.c", 2, {
		getValue: (parent, name) => parent[`${name}_`],
		setValue: (parent, name, value) => { parent[`${name}_`] = value; return true; }
	});

	expect(success).toBe(true);
	expect(data.a_.b_.c_).toBe(2);
});

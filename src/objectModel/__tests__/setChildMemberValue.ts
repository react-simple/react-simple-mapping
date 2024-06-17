import { deepCopyObject } from "@react-simple/react-simple-util";
import { GetChildMemberValueOptions, setChildMemberValue } from "objectModel";
import { CHILD_MEMBER_TESTOBJ } from "objectModel/test.data";

it('setChildMemberValue.arrayPath', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const success = setChildMemberValue(copy, ["a", "b", "c"], 2);

	expect(success).toBe(true);
	expect(copy.a.b.c).toBe(2);
});

it('setChildMemberValue.stringPath', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const success = setChildMemberValue(copy, "a.b.c", 2);

	expect(success).toBe(true);
	expect(copy.a.b.c).toBe(2);
});

it('setChildMemberValue.nonExistingMember.stringPath', () => {
	const data: any = {};
	const success = setChildMemberValue(data, "a.b.c", 2);

	expect(success).toBe(true);
	expect(data.a?.b?.c).toBe(2);
});

it('setChildMemberValue.array.arrayPath[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const success = setChildMemberValue(copy, ["a", "b", "array[0]"], 22);

	expect(success).toBe(true);
	expect(copy.a.b.array[0]).toBe(22);
});

it('setChildMemberValue.array.arrayPath.[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const success = setChildMemberValue(copy, ["a", "b", "array.[0]"], 22);

	expect(success).toBe(true);
	expect(copy.a.b.array[0]).toBe(22);
});

it('setChildMemberValue.array.arrayPath/[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const success = setChildMemberValue(copy, ["a", "b", "array", "[0]"], 22);

	expect(success).toBe(true);
	expect(copy.a.b.array[0]).toBe(22);
});

it('setChildMemberValue.array.stringPath[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const success = setChildMemberValue(copy, "a.b.array[0]", 22);

	expect(success).toBe(true);
	expect(copy.a.b.array[0]).toBe(22);
});

it('setChildMemberValue.array.stringPath.[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const success = setChildMemberValue(copy, "a.b.array.[0]", 22);

	expect(success).toBe(true);
	expect(copy.a.b.array[0]).toBe(22);
});

it('setChildMemberValue.nonExistingMember.array.stringPath', () => {
	const data: any = {};
	const success = setChildMemberValue(data, "a.b.array[0]", 22);

	expect(success).toBe(true);
	expect(data?.a?.b?.array?.[0]).toBe(22);
});

it('setChildMemberValue.stringPath.customSeparator', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const success = setChildMemberValue(copy, "a/b/c", 2, { pathSeparator: "/" });

	expect(success).toBe(true);
	expect(copy.a.b.c).toBe(2);
});

it('setChildMemberValue.stringPath.rootObj', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options = { rootObj: copy };
	const success = setChildMemberValue(copy.a.b, "/a.b.c", 2, options);

	expect(success).toBe(true);
	expect(copy.a.b.c).toBe(2);
});

it('setChildMemberValue.stringPath.namedObjs', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options: GetChildMemberValueOptions = {
		getNamedObj: name => name === "bbb" ? copy.a.b : undefined
	};

	const success = setChildMemberValue(copy, "@bbb.c", 2, options);

	expect(success).toBe(true);
	expect(copy.a.b.c).toBe(2);
});

it('setChildMemberValue.custom.setMemberValue', () => {
	const data = { a_: { b_: { c_: 1 } } };

	const success = setChildMemberValue(data, "a.b.c", 2, {
		getMemberValue: (parent, name) => {
			expect(name.fullQualifiedName).toBe(name.name === "a" ? "a" : name.name === "b" ? "a.b" : "a.b.c");
			return (parent as any)[`${name.name}_`];
		},
		setMemberValue: (parent, name, value) => {
			expect(name.fullQualifiedName).toBe(name.name === "a" ? "a" : name.name === "b" ? "a.b" : "a.b.c");
			(parent as any)[`${name.name}_`] = value;
			return true;
		}
	});

	expect(success).toBe(true);
	expect(data.a_.b_.c_).toBe(2);
});

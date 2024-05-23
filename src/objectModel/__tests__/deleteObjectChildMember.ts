import { deepCopyObject } from "@react-simple/react-simple-util";
import { GetObjectChildValueOptions, deleteObjectChildMember } from "objectModel";
import { CHILD_MEMBER_TESTOBJ } from "objectModel/test.data";

it('deleteObjectChildMember.stringPath', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { success } = deleteObjectChildMember(copy, "a.b.c");

	expect(success).toBe(true);
	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('deleteObjectChildMember.array.stringPath[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { success } = deleteObjectChildMember(copy, "a.b.array[0]");

	expect(success).toBe(true);
	expect(copy.a.b.c).toBe(1);
	expect(copy.a.b.array?.length).toBe(1);
	expect(copy.a.b.array[0]).toBe(12);
});

it('deleteObjectChildMember.array.stringPath.[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { success } = deleteObjectChildMember(copy, "a.b.array.[0]");

	expect(success).toBe(true);
	expect(copy.a.b.c).toBe(1);
	expect(copy.a.b.array?.length).toBe(1);
	expect(copy.a.b.array[0]).toBe(12);
});

it('deleteObjectChildMember.stringPath.customSeparator', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const { success } = deleteObjectChildMember(copy, "a/b/c", { pathSeparator: "/" });

	expect(success).toBe(true);
	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('deleteObjectChildMember.stringPath.rootObj', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options = { rootObj: copy };
	const { success } = deleteObjectChildMember(copy, "/a.b.c", options);

	expect(success).toBe(true);
	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('deleteObjectChildMember.stringPath.namedObjs', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options: GetObjectChildValueOptions = {
		getNamedObj: name => name === "bbb" ? copy.a.b : undefined
	};

	const { success } = deleteObjectChildMember(copy, "@bbb.c", options);

	expect(success).toBe(true);
	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('deleteObjectChildMember.custom.deleteMemberValue', () => {
	const data = { a_: { b_: { c_: 1 } } };

	const { success } = deleteObjectChildMember(data, "a.b.c", {
		getValue: (parent, name) => parent[`${name}_`],
		deleteMember: (parent, name) => { delete parent[`${name}_`]; return true; }
	});

	expect(success).toBe(true);
	expect(data.a_.b_.c_).toBeUndefined();
	expect(data.a_.b_).toBeDefined();
});

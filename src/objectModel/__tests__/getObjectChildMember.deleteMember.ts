import { deepCopyObject } from "@react-simple/react-simple-util";
import { GetObjectChildValueOptions, getObjectChildMember } from "objectModel";
import { CHILD_MEMBER_TESTOBJ } from "objectModel/test.data";

it('getObjectChildMember.deleteMember.stringPath', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const accessor = getObjectChildMember(copy, "a.b.c", false);
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('getObjectChildMember.deleteMember.array.stringPath[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const accessor = getObjectChildMember(copy, "a.b.array[0]", false);
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(copy.a.b.c).toBe(1);
	expect(copy.a.b.array?.length).toBe(1);
	expect(copy.a.b.array[0]).toBe(12);
});

it('getObjectChildMember.deleteMember.array.stringPath.[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const accessor = getObjectChildMember(copy, "a.b.array.[0]", false);
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(copy.a.b.c).toBe(1);
	expect(copy.a.b.array?.length).toBe(1);
	expect(copy.a.b.array[0]).toBe(12);
});

it('getObjectChildMember.deleteMember.stringPath.customSeparator', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const accessor = getObjectChildMember(copy, "a/b/c", false, { pathSeparator: "/" });
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('getObjectChildMember.deleteMember.stringPath.rootObj', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options = { rootObj: copy };
	const accessor = getObjectChildMember(copy, "/a.b.c", false, options);
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('getObjectChildMember.deleteMember.stringPath.namedObjs', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options: GetObjectChildValueOptions = {
		getNamedObj: name => name === "bbb" ? copy.a.b : undefined
	};

	const accessor = getObjectChildMember(copy, "@bbb.c", false, options);
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('getObjectChildMember.deleteMember.custom.deleteMemberValue', () => {
	const data = { a_: { b_: { c_: 1 } } };

	const accessor = getObjectChildMember(data, "a.b.c", false, {
		getValue: (parent, name) => parent[`${name}_`],
		deleteMember: (parent, name) => { delete parent[`${name}_`]; return true; }
	});
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(data.a_.b_.c_).toBeUndefined();
	expect(data.a_.b_).toBeDefined();
});

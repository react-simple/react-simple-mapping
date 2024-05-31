import { deepCopyObject } from "@react-simple/react-simple-util";
import { GetChildMemberValueOptions, getChildMember } from "objectModel";
import { CHILD_MEMBER_TESTOBJ } from "objectModel/test.data";

it('getChildMember.deleteMember.stringPath', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const accessor = getChildMember(copy, "a.b.c", false);
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('getChildMember.deleteMember.array.stringPath[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const accessor = getChildMember(copy, "a.b.array[0]", false);
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(copy.a.b.c).toBe(1);
	expect(copy.a.b.array?.length).toBe(1);
	expect(copy.a.b.array[0]).toBe(12);
});

it('getChildMember.deleteMember.array.stringPath.[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const accessor = getChildMember(copy, "a.b.array.[0]", false);
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(copy.a.b.c).toBe(1);
	expect(copy.a.b.array?.length).toBe(1);
	expect(copy.a.b.array[0]).toBe(12);
});

it('getChildMember.deleteMember.stringPath.customSeparator', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const accessor = getChildMember(copy, "a/b/c", false, { pathSeparator: "/" });
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('getChildMember.deleteMember.stringPath.rootObj', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options = { rootObj: copy };
	const accessor = getChildMember(copy, "/a.b.c", false, options);
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('getChildMember.deleteMember.stringPath.namedObjs', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options: GetChildMemberValueOptions = {
		getNamedObj: name => name === "bbb" ? copy.a.b : undefined
	};

	const accessor = getChildMember(copy, "@bbb.c", false, options);
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('getChildMember.deleteMember.custom.deleteMemberValue', () => {
	const data = { a_: { b_: { c_: 1 } } };

	const accessor = getChildMember(data, "a.b.c", false, {
		getValue: (parent, name) => parent[`${name}_`],
		deleteMember: (parent, name) => { delete parent[`${name}_`]; return true; }
	});
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(data.a_.b_.c_).toBeUndefined();
	expect(data.a_.b_).toBeDefined();
});

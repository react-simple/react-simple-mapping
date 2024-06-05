import { deepCopyObject } from "@react-simple/react-simple-util";
import { GetChildMemberValueOptions, getChildMemberInfo } from "objectModel";
import { CHILD_MEMBER_TESTOBJ } from "objectModel/test.data";

it('getChildMember.deleteMember.stringPath', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const accessor = getChildMemberInfo(copy, "a.b.c", false);
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('getChildMember.deleteMember.array.stringPath[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const accessor = getChildMemberInfo(copy, "a.b.array[0]", false);
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(copy.a.b.c).toBe(1);
	expect(copy.a.b.array?.length).toBe(1);
	expect(copy.a.b.array[0]).toBe(12);
});

it('getChildMember.deleteMember.array.stringPath.[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const accessor = getChildMemberInfo(copy, "a.b.array.[0]", false);
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(copy.a.b.c).toBe(1);
	expect(copy.a.b.array?.length).toBe(1);
	expect(copy.a.b.array[0]).toBe(12);
});

it('getChildMember.deleteMember.stringPath.customSeparator', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const accessor = getChildMemberInfo(copy, "a/b/c", false, { pathSeparator: "/" });
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('getChildMember.deleteMember.stringPath.rootObj', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options = { rootObj: copy };
	const accessor = getChildMemberInfo(copy, "/a.b.c", false, options);
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

	const accessor = getChildMemberInfo(copy, "@bbb.c", false, options);
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('getChildMember.deleteMember.custom.deleteMemberValue', () => {
	const data = { a_: { b_: { c_: 1 } } };

	const accessor = getChildMemberInfo(data, "a.b.c", false, {
		getValue: (parent, name) => parent.obj[`${name}_`],
		deleteMember: (parent, name) => { delete parent.obj[`${name}_`]; return true; }
	});
	const success = accessor?.deleteMember();

	expect(success).toBe(true);
	expect(data.a_.b_.c_).toBeUndefined();
	expect(data.a_.b_).toBeDefined();
});

import { deepCopyObject } from "@react-simple/react-simple-util";
import { GetChildMemberValueOptions, getChildMemberInfo } from "objectModel";
import { CHILD_MEMBER_TESTOBJ } from "objectModel/test.data";

it('getChildMemberInfo.deleteChildMember.stringPath', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const accessor = getChildMemberInfo(copy, "a.b.c", false);
	accessor?.deleteMember(true);

	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('getChildMemberInfo.deleteChildMember.array.stringPath[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const accessor = getChildMemberInfo(copy, "a.b.array[0]", false);
	accessor?.deleteMember(true);

	expect(copy.a.b.c).toBe(1);
	expect(copy.a.b.array?.length).toBe(1);
	expect(copy.a.b.array[0]).toBe(12);
});

it('getChildMemberInfo.deleteChildMember.array.stringPath.[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const accessor = getChildMemberInfo(copy, "a.b.array.[0]", false);
	accessor?.deleteMember(true);

	expect(copy.a.b.c).toBe(1);
	expect(copy.a.b.array?.length).toBe(1);
	expect(copy.a.b.array[0]).toBe(12);
});

it('getChildMemberInfo.deleteChildMember.stringPath.customSeparator', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const accessor = getChildMemberInfo(copy, "a/b/c", false, { pathSeparator: "/" });
	accessor?.deleteMember(true);

	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('getChildMemberInfo.deleteChildMember.stringPath.rootObj', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options = { rootObj: copy };
	const accessor = getChildMemberInfo(copy, "/a.b.c", false, options);
	accessor?.deleteMember(true);

	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('getChildMemberInfo.deleteChildMember.stringPath.namedObjs', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options: GetChildMemberValueOptions = {
		getNamedObj: name => name === "bbb" ? copy.a.b : undefined
	};

	const accessor = getChildMemberInfo(copy, "@bbb.c", false, options);
	accessor?.deleteMember(true);

	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('getChildMemberInfo.deleteChildMember.custom.deleteMemberValue', () => {
	const data = { a_: { b_: { c_: 1 } } };

	const accessor = getChildMemberInfo(data, "a.b.c", false, {
		getMemberValue: (parent, name) => {
			expect(name.fullQualifiedName).toBe(name.name === "a" ? "a" : name.name === "b" ? "a.b" : "a.b.c");
			return (parent as any)[`${name.name}_`];
		},
		deleteMember: (parent, name) => {
			expect(name.fullQualifiedName).toBe(name.name === "a" ? "a" : name.name === "b" ? "a.b" : "a.b.c");
			delete (parent as any)[`${name.name}_`];
			return true;
		}
	});
	
	accessor?.deleteMember(false);

	expect(data.a_.b_.c_).toBeUndefined();
	expect(data.a_.b_).toBeDefined();
});

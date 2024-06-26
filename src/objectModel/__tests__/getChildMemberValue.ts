import { GetChildMemberValueOptions, getChildMemberValue } from "objectModel";
import { CHILD_MEMBER_TESTOBJ } from "objectModel/test.data";

it('getChildMemberValue', () => {
	expect(getChildMemberValue(CHILD_MEMBER_TESTOBJ, "a.b.c")).toBe(1);
});

it('getChildMemberValue.path.nonExistent', () => {
	expect(getChildMemberValue(CHILD_MEMBER_TESTOBJ, "a.b.c2")).toBeUndefined();
	expect(getChildMemberValue(CHILD_MEMBER_TESTOBJ, "a.b2.c")).toBeUndefined();
	expect(getChildMemberValue(CHILD_MEMBER_TESTOBJ, "a2.b.c")).toBeUndefined();
});

it('getChildMemberValue.array.path[0]', () => {
	expect(getChildMemberValue(CHILD_MEMBER_TESTOBJ, "a.b.array[0]")).toBe(11);
});

it('getChildMemberValue.array.path.[0]', () => {
	expect(getChildMemberValue(CHILD_MEMBER_TESTOBJ, "a.b.array.[0]")).toBe(11);
});

it('getChildMemberValue.path.rootObj', () => {
	const options = { rootObj: CHILD_MEMBER_TESTOBJ };

	expect(getChildMemberValue(CHILD_MEMBER_TESTOBJ.a.b, "a.b.c", options)).toBe(undefined);
	expect(getChildMemberValue(CHILD_MEMBER_TESTOBJ.a.b, "a./a.b.c", options)).toBe(undefined);
	expect(getChildMemberValue(CHILD_MEMBER_TESTOBJ.a.b, "/a.b.c", options)).toBe(1);
});

it('getChildMemberValue.path.namedObjs', () => {
	const options: GetChildMemberValueOptions = {
		getNamedObj: name => name === "bbb" ? CHILD_MEMBER_TESTOBJ.a.b : undefined
	};

	expect(getChildMemberValue(CHILD_MEMBER_TESTOBJ, "@b.c", options)).toBe(undefined);
	expect(getChildMemberValue(CHILD_MEMBER_TESTOBJ, "@bb.c", options)).toBe(undefined);
	expect(getChildMemberValue(CHILD_MEMBER_TESTOBJ, "a.@bbb.c", options)).toBe(undefined);
	expect(getChildMemberValue(CHILD_MEMBER_TESTOBJ, "@bbb.c", options)).toBe(1);
});

it('getChildMemberValue.custom.getMemberValue', () => {
	const data = { a_: { b_: { c_: 1 } } };

	expect(getChildMemberValue(data, "a.b.c", {
		getMemberValue: (parent, name) => {
			expect(name.fullQualifiedName).toBe(name.name === "a" ? "a" : name.name === "b" ? "a.b" : "a.b.c");
			return (parent as any)[`${name.name}_`];
		}
	})).toBe(1);
});

import { sameArrays } from "@react-simple/react-simple-util";
import { GetChildMemberValueOptions, getChildMemberReadOnlyInfo } from "objectModel";
import { CHILD_MEMBER_TESTOBJ } from "objectModel/test.data";

it('getChildMemberReadOnlyInfo.getValue', () => {
	const { obj, names, parents, parentArray, getValue } = getChildMemberReadOnlyInfo(CHILD_MEMBER_TESTOBJ, "a.b.c") || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b);
	expect(names?.name).toBe("c");
	expect(names?.fullQualifiedName).toBe("a.b.c");
	expect(parents?.length).toBe(3);
	expect(parentArray).toBeUndefined();
	expect(getValue?.()).toBe(1);
});

it('getChildMemberReadOnlyInfo.getValue.path.nonExistent', () => {
	expect(getChildMemberReadOnlyInfo(CHILD_MEMBER_TESTOBJ, "a.b.c2")?.getValue?.()).toBeUndefined();
	expect(getChildMemberReadOnlyInfo(CHILD_MEMBER_TESTOBJ, "a.b2.c")?.getValue?.()).toBeUndefined();
	expect(getChildMemberReadOnlyInfo(CHILD_MEMBER_TESTOBJ, "a2.b.c")?.getValue?.()).toBeUndefined();
});

it('getChildMemberReadOnlyInfo.getValue.array.path[0]', () => {
	const { obj, names, parents, parentArray, getValue } = getChildMemberReadOnlyInfo(CHILD_MEMBER_TESTOBJ, "a.b.array[0]") || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(names?.name).toBe("0");
	expect(names?.fullQualifiedName).toBe("a.b.array[0]");
	expect(sameArrays((parents || []).map(t => t.names.fullQualifiedName), ["", "a", "a.b", "a.b.array"])).toBe(true);
	expect(parentArray?.array).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(parentArray?.index).toBe("0");
	expect(getValue?.()).toBe(11);
});

it('getChildMemberReadOnlyInfo.getValue.array.path.[0]', () => {
	const { obj, names, parents, parentArray, getValue } = getChildMemberReadOnlyInfo(CHILD_MEMBER_TESTOBJ, "a.b.array.[0]") || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(names?.name).toBe("0");
	expect(names?.fullQualifiedName).toBe("a.b.array[0]");
	expect(sameArrays((parents || []).map(t => t.names.fullQualifiedName), ["", "a", "a.b", "a.b.array"])).toBe(true);
	expect(parentArray?.array).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(parentArray?.index).toBe("0");
	expect(getValue?.()).toBe(11);
});

it('getChildMemberReadOnlyInfo.getValue.path.rootObj', () => {
	const options = { rootObj: CHILD_MEMBER_TESTOBJ };

	expect(getChildMemberReadOnlyInfo(CHILD_MEMBER_TESTOBJ.a.b, "a.b.c", options)?.getValue?.()).toBe(undefined);
	expect(getChildMemberReadOnlyInfo(CHILD_MEMBER_TESTOBJ.a.b, "a./a.b.c", options)?.getValue?.()).toBe(undefined);
	expect(getChildMemberReadOnlyInfo(CHILD_MEMBER_TESTOBJ.a.b, "/a.b.c", options)?.getValue?.()).toBe(1);
});

it('getChildMemberReadOnlyInfo.getValue.path.namedObjs', () => {
	const options: GetChildMemberValueOptions = {
		getNamedObj: name => name === "bbb" ? CHILD_MEMBER_TESTOBJ.a.b : undefined
	};

	expect(getChildMemberReadOnlyInfo(CHILD_MEMBER_TESTOBJ, "@b.c", options)?.getValue?.()).toBe(undefined);
	expect(getChildMemberReadOnlyInfo(CHILD_MEMBER_TESTOBJ, "@bb.c", options)?.getValue?.()).toBe(undefined);
	expect(getChildMemberReadOnlyInfo(CHILD_MEMBER_TESTOBJ, "a.@bbb.c", options)?.getValue?.()).toBe(undefined);
	expect(getChildMemberReadOnlyInfo(CHILD_MEMBER_TESTOBJ, "@bbb.c", options)?.getValue?.()).toBe(1);
});

it('getChildMemberReadOnlyInfo.getValue.custom.getMemberValue', () => {
	const data = { a_: { b_: { c_: 1 } } };

	expect(getChildMemberReadOnlyInfo(data, "a.b.c", {
		getMemberValue: (parent, name) => {
			expect(name.fullQualifiedName).toBe(name.name === "a" ? "a" : name.name === "b" ? "a.b" : "a.b.c");
			return (parent as any)[`${name.name}_`];
		}
	})?.getValue?.()).toBe(1);
});

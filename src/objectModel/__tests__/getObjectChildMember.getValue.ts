import { GetChildMemberValueOptions, getChildMemberInfo } from "objectModel";
import { CHILD_MEMBER_TESTOBJ } from "objectModel/test.data";

it('getChildMember.getValue.arrayPath', () => {
	const { obj, name, fullQualifiedName, parents, arraySpec, getValue } = getChildMemberInfo(CHILD_MEMBER_TESTOBJ, ["a", "b", "c"], false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b);
	expect(name).toBe("c");
	expect(fullQualifiedName).toBe("a.b.c");
	expect(parents?.length).toBe(3);
	expect(arraySpec).toBeUndefined();
	expect(getValue?.()).toBe(1);
});

it('getChildMember.getValue.stringPath', () => {
	const { obj, name, fullQualifiedName, parents, arraySpec, getValue } = getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "a.b.c", false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b);
	expect(name).toBe("c");
	expect(fullQualifiedName).toBe("a.b.c");
	expect(parents?.length).toBe(3);
	expect(arraySpec).toBeUndefined();
	expect(getValue?.()).toBe(1);
});

it('getChildMember.getValue.stringPath.nonExistent', () => {
	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "a.b.c2", false)?.getValue?.()).toBeUndefined();
	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "a.b2.c", false)?.getValue?.()).toBeUndefined();
	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "a2.b.c", false)?.getValue?.()).toBeUndefined();
});

it('getChildMember.getValue.array.arrayPath[0]', () => {
	const { obj, name, fullQualifiedName, parents, arraySpec, getValue } = getChildMemberInfo(CHILD_MEMBER_TESTOBJ, ["a", "b", "array[0]"], false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b);
	expect(name).toBe("array");
	expect(fullQualifiedName).toBe("a.b.array");
	expect(parents?.length).toBe(3);
	expect(arraySpec?.array).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(arraySpec?.index).toBe("0");
	expect(getValue?.()).toBe(11);
});

it('getChildMemberValue.array.arrayPath.[0]', () => {
	const { obj, name, fullQualifiedName, parents, arraySpec, getValue } = getChildMemberInfo(CHILD_MEMBER_TESTOBJ, ["a", "b", "array.[0]"], false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b);
	expect(name).toBe("array");
	expect(fullQualifiedName).toBe("a.b.array");
	expect(parents?.length).toBe(3);
	expect(arraySpec?.array).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(arraySpec?.index).toBe("0");
	expect(getValue?.()).toBe(11);
});

it('getChildMember.getValue.array.arrayPath/[0]', () => {
	const { obj, name, fullQualifiedName, parents, arraySpec, getValue } = getChildMemberInfo(CHILD_MEMBER_TESTOBJ, ["a", "b", "array", "[0]"], false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b);
	expect(name).toBe("array");
	expect(fullQualifiedName).toBe("a.b.array");
	expect(parents?.length).toBe(3);
	expect(arraySpec?.array).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(arraySpec?.index).toBe("0");
	expect(getValue?.()).toBe(11);
});

it('getChildMember.getValue.array.stringPath[0]', () => {
	const { obj, name, fullQualifiedName, parents, arraySpec, getValue } = getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "a.b.array[0]", false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b);
	expect(name).toBe("array");
	expect(fullQualifiedName).toBe("a.b.array");
	expect(parents?.length).toBe(3);
	expect(arraySpec?.array).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(arraySpec?.index).toBe("0");
	expect(getValue?.()).toBe(11);
});

it('getChildMember.getValue.array.stringPath.[0]', () => {
	const { obj, name, fullQualifiedName, parents, arraySpec, getValue } = getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "a.b.array.[0]", false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b);
	expect(name).toBe("array");
	expect(fullQualifiedName).toBe("a.b.array");
	expect(parents?.length).toBe(3);
	expect(arraySpec?.array).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(arraySpec?.index).toBe("0");
	expect(getValue?.()).toBe(11);
});

it('getChildMemberValue.stringPath.customSeparator', () => {
	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "a/b/c", false, { pathSeparator: "/" })?.getValue?.()).toBe(1);
});

it('getChildMember.getValue.stringPath.rootObj', () => {
	const options = { rootObj: CHILD_MEMBER_TESTOBJ };

	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ.a.b, "a.b.c", false, options)?.getValue?.()).toBe(undefined);
	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ.a.b, "a./a.b.c", false, options)?.getValue?.()).toBe(undefined);
	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ.a.b, "/a.b.c", false, options)?.getValue?.()).toBe(1);
});

it('getChildMember.getValue.stringPath.namedObjs', () => {
	const options: GetChildMemberValueOptions = {
		getNamedObj: name => name === "bbb" ? CHILD_MEMBER_TESTOBJ.a.b : undefined
	};

	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "@b.c", false, options)?.getValue?.()).toBe(undefined);
	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "@bb.c", false, options)?.getValue?.()).toBe(undefined);
	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "a.@bbb.c", false, options)?.getValue?.()).toBe(undefined);
	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "@bbb.c", false, options)?.getValue?.()).toBe(1);
});

it('getChildMember.getValue.custom.getMemberValue', () => {
	const data = { a_: { b_: { c_: 1 } } };

	expect(getChildMemberInfo(data, "a.b.c", false, {
		getValue: (parent, name) => parent.obj[`${name}_`]
	})?.getValue?.()).toBe(1);
});

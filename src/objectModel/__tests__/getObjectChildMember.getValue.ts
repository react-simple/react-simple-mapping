import { GetObjectChildValueOptions, getObjectChildMember } from "objectModel";
import { CHILD_MEMBER_TESTOBJ } from "objectModel/test.data";

it('getObjectChildMember.getValue.arrayPath', () => {
	const { obj, name, fullQualifiedName, parents, arraySpec, getValue } = getObjectChildMember(CHILD_MEMBER_TESTOBJ, ["a", "b", "c"], false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b);
	expect(name).toBe("c");
	expect(fullQualifiedName).toBe("a.b.c");
	expect(parents?.length).toBe(3);
	expect(arraySpec).toBeUndefined();
	expect(getValue?.()).toBe(1);
});

it('getObjectChildMember.getValue.stringPath', () => {
	const { obj, name, fullQualifiedName, parents, arraySpec, getValue } = getObjectChildMember(CHILD_MEMBER_TESTOBJ, "a.b.c", false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b);
	expect(name).toBe("c");
	expect(fullQualifiedName).toBe("a.b.c");
	expect(parents?.length).toBe(3);
	expect(arraySpec).toBeUndefined();
	expect(getValue?.()).toBe(1);
});

it('getObjectChildMember.getValue.stringPath.nonExistent', () => {
	expect(getObjectChildMember(CHILD_MEMBER_TESTOBJ, "a.b.c2", false)?.getValue?.()).toBeUndefined();
	expect(getObjectChildMember(CHILD_MEMBER_TESTOBJ, "a.b2.c", false)?.getValue?.()).toBeUndefined();
	expect(getObjectChildMember(CHILD_MEMBER_TESTOBJ, "a2.b.c", false)?.getValue?.()).toBeUndefined();
});

it('getObjectChildMember.getValue.array.arrayPath[0]', () => {
	const { obj, name, fullQualifiedName, parents, arraySpec, getValue } = getObjectChildMember(CHILD_MEMBER_TESTOBJ, ["a", "b", "array[0]"], false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b);
	expect(name).toBe("array");
	expect(fullQualifiedName).toBe("a.b.array");
	expect(parents?.length).toBe(3);
	expect(arraySpec?.array).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(arraySpec?.index).toBe("0");
	expect(getValue?.()).toBe(11);
});

it('getObjectChildValue.array.arrayPath.[0]', () => {
	const { obj, name, fullQualifiedName, parents, arraySpec, getValue } = getObjectChildMember(CHILD_MEMBER_TESTOBJ, ["a", "b", "array.[0]"], false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b);
	expect(name).toBe("array");
	expect(fullQualifiedName).toBe("a.b.array");
	expect(parents?.length).toBe(3);
	expect(arraySpec?.array).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(arraySpec?.index).toBe("0");
	expect(getValue?.()).toBe(11);
});

it('getObjectChildMember.getValue.array.arrayPath/[0]', () => {
	const { obj, name, fullQualifiedName, parents, arraySpec, getValue } = getObjectChildMember(CHILD_MEMBER_TESTOBJ, ["a", "b", "array", "[0]"], false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b);
	expect(name).toBe("array");
	expect(fullQualifiedName).toBe("a.b.array");
	expect(parents?.length).toBe(3);
	expect(arraySpec?.array).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(arraySpec?.index).toBe("0");
	expect(getValue?.()).toBe(11);
});

it('getObjectChildMember.getValue.array.stringPath[0]', () => {
	const { obj, name, fullQualifiedName, parents, arraySpec, getValue } = getObjectChildMember(CHILD_MEMBER_TESTOBJ, "a.b.array[0]", false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b);
	expect(name).toBe("array");
	expect(fullQualifiedName).toBe("a.b.array");
	expect(parents?.length).toBe(3);
	expect(arraySpec?.array).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(arraySpec?.index).toBe("0");
	expect(getValue?.()).toBe(11);
});

it('getObjectChildMember.getValue.array.stringPath.[0]', () => {
	const { obj, name, fullQualifiedName, parents, arraySpec, getValue } = getObjectChildMember(CHILD_MEMBER_TESTOBJ, "a.b.array.[0]", false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b);
	expect(name).toBe("array");
	expect(fullQualifiedName).toBe("a.b.array");
	expect(parents?.length).toBe(3);
	expect(arraySpec?.array).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(arraySpec?.index).toBe("0");
	expect(getValue?.()).toBe(11);
});

it('getObjectChildValue.stringPath.customSeparator', () => {
	expect(getObjectChildMember(CHILD_MEMBER_TESTOBJ, "a/b/c", false, { pathSeparator: "/" })?.getValue?.()).toBe(1);
});

it('getObjectChildMember.getValue.stringPath.rootObj', () => {
	const options = { rootObj: CHILD_MEMBER_TESTOBJ };

	expect(getObjectChildMember(CHILD_MEMBER_TESTOBJ.a.b, "a.b.c", false, options)?.getValue?.()).toBe(undefined);
	expect(getObjectChildMember(CHILD_MEMBER_TESTOBJ.a.b, "a./a.b.c", false, options)?.getValue?.()).toBe(undefined);
	expect(getObjectChildMember(CHILD_MEMBER_TESTOBJ.a.b, "/a.b.c", false, options)?.getValue?.()).toBe(1);
});

it('getObjectChildMember.getValue.stringPath.namedObjs', () => {
	const options: GetObjectChildValueOptions = {
		getNamedObj: name => name === "bbb" ? CHILD_MEMBER_TESTOBJ.a.b : undefined
	};

	expect(getObjectChildMember(CHILD_MEMBER_TESTOBJ, "@b.c", false, options)?.getValue?.()).toBe(undefined);
	expect(getObjectChildMember(CHILD_MEMBER_TESTOBJ, "@bb.c", false, options)?.getValue?.()).toBe(undefined);
	expect(getObjectChildMember(CHILD_MEMBER_TESTOBJ, "a.@bbb.c", false, options)?.getValue?.()).toBe(undefined);
	expect(getObjectChildMember(CHILD_MEMBER_TESTOBJ, "@bbb.c", false, options)?.getValue?.()).toBe(1);
});

it('getObjectChildMember.getValue.custom.getMemberValue', () => {
	const data = { a_: { b_: { c_: 1 } } };

	expect(getObjectChildMember(data, "a.b.c", false, {
		getValue: (parent, name) => parent[`${name}_`]
	})?.getValue?.()).toBe(1);
});

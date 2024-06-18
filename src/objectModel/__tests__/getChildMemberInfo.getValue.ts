import { sameArrays } from "@react-simple/react-simple-util";
import { GetChildMemberValueOptions, getChildMemberInfo } from "objectModel";
import { CHILD_MEMBER_TESTOBJ } from "objectModel/test.data";

it('getChildMemberInfo.getValue.arrayPath', () => {
	const { obj, names, parents, arrayInfo, getValue } = getChildMemberInfo(CHILD_MEMBER_TESTOBJ, ["a", "b", "c"], false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b);
	expect(names?.name).toBe("c");
	expect(names?.fullQualifiedName).toBe("a.b.c");
	expect(parents?.length).toBe(3);
	expect(arrayInfo).toBeUndefined();
	expect(getValue?.()).toBe(1);
});

it('getChildMemberInfo.getValue.stringPath', () => {
	const { obj, names, parents, arrayInfo, getValue } = getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "a.b.c", false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b);
	expect(names?.name).toBe("c");
	expect(names?.fullQualifiedName).toBe("a.b.c");
	expect(parents?.length).toBe(3);
	expect(arrayInfo).toBeUndefined();
	expect(getValue?.()).toBe(1);
});

it('getChildMemberInfo.getValue.stringPath.nonExistent', () => {
	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "a.b.c2", false)?.getValue?.()).toBeUndefined();
	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "a.b2.c", false)?.getValue?.()).toBeUndefined();
	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "a2.b.c", false)?.getValue?.()).toBeUndefined();
});

it('getChildMemberInfo.getValue.array.arrayPath[0]', () => {
	const { obj, names, parents, arrayInfo, getValue } = getChildMemberInfo(CHILD_MEMBER_TESTOBJ, ["a", "b", "array[0]"], false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(names?.name).toBe("0");
	expect(names?.fullQualifiedName).toBe("a.b.array[0]");
	expect(parents?.length).toBe(4);
	expect(arrayInfo?.array).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(arrayInfo?.index).toBe("0");
	expect(getValue?.()).toBe(11);
});

it('getChildMemberValue.array.arrayPath.[0]', () => {
	const { obj, names, parents, arrayInfo, getValue } = getChildMemberInfo(CHILD_MEMBER_TESTOBJ, ["a", "b", "array.[0]"], false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(names?.name).toBe("0");
	expect(names?.fullQualifiedName).toBe("a.b.array[0]");
	expect(sameArrays((parents || []).map(t => t.names.fullQualifiedName), ["", "a", "a.b", "a.b.array"])).toBe(true);
	expect(arrayInfo?.array).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(arrayInfo?.index).toBe("0");
	expect(getValue?.()).toBe(11);
});

it('getChildMemberInfo.getValue.array.arrayPath/[0]', () => {
	const { obj, names, parents, arrayInfo, getValue } = getChildMemberInfo(CHILD_MEMBER_TESTOBJ, ["a", "b", "array", "[0]"], false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(names?.name).toBe("0");
	expect(names?.fullQualifiedName).toBe("a.b.array[0]");
	expect(sameArrays((parents || []).map(t => t.names.fullQualifiedName), ["", "a", "a.b", "a.b.array"])).toBe(true);
	expect(arrayInfo?.array).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(arrayInfo?.index).toBe("0");
	expect(getValue?.()).toBe(11);
});

it('getChildMemberInfo.getValue.array.stringPath[0]', () => {
	const { obj, names, parents, arrayInfo, getValue } = getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "a.b.array[0]", false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(names?.name).toBe("0");
	expect(names?.fullQualifiedName).toBe("a.b.array[0]");
	expect(sameArrays((parents || []).map(t => t.names.fullQualifiedName), ["", "a", "a.b", "a.b.array"])).toBe(true);
	expect(arrayInfo?.array).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(arrayInfo?.index).toBe("0");
	expect(getValue?.()).toBe(11);
});

it('getChildMemberInfo.getValue.array.stringPath.[0]', () => {
	const { obj, names, parents, arrayInfo, getValue } = getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "a.b.array.[0]", false) || {};

	expect(obj).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(names?.name).toBe("0");
	expect(names?.fullQualifiedName).toBe("a.b.array[0]");
	expect(sameArrays((parents || []).map(t => t.names.fullQualifiedName), ["", "a", "a.b", "a.b.array"])).toBe(true);
	expect(arrayInfo?.array).toBe(CHILD_MEMBER_TESTOBJ.a.b.array);
	expect(arrayInfo?.index).toBe("0");
	expect(getValue?.()).toBe(11);
});

it('getChildMemberValue.stringPath.customSeparator', () => {
	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "a/b/c", false, { pathSeparator: "/" })?.getValue?.()).toBe(1);
});

it('getChildMemberInfo.getValue.stringPath.rootObj', () => {
	const options = { rootObj: CHILD_MEMBER_TESTOBJ };

	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ.a.b, "a.b.c", false, options)?.getValue?.()).toBe(undefined);
	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ.a.b, "a./a.b.c", false, options)?.getValue?.()).toBe(undefined);
	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ.a.b, "/a.b.c", false, options)?.getValue?.()).toBe(1);
});

it('getChildMemberInfo.getValue.stringPath.namedObjs', () => {
	const options: GetChildMemberValueOptions = {
		getNamedObj: name => name === "bbb" ? CHILD_MEMBER_TESTOBJ.a.b : undefined
	};

	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "@b.c", false, options)?.getValue?.()).toBe(undefined);
	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "@bb.c", false, options)?.getValue?.()).toBe(undefined);
	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "a.@bbb.c", false, options)?.getValue?.()).toBe(undefined);
	expect(getChildMemberInfo(CHILD_MEMBER_TESTOBJ, "@bbb.c", false, options)?.getValue?.()).toBe(1);
});

it('getChildMemberInfo.getValue.custom.getMemberValue', () => {
	const data = { a_: { b_: { c_: 1 } } };

	expect(getChildMemberInfo(data, "a.b.c", false, {
		getMemberValue: (parent, name) => {
			expect(name.fullQualifiedName).toBe(name.name === "a" ? "a" : name.name === "b" ? "a.b" : "a.b.c");
			return (parent as any)[`${name.name}_`];
		}
	})?.getValue?.()).toBe(1);
});

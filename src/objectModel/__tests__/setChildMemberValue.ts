import { deepCopyObject } from "@react-simple/react-simple-util";
import { GetChildMemberValueOptions, setChildMemberValue } from "objectModel";
import { CHILD_MEMBER_TESTOBJ } from "objectModel/test.data";

it('setChildMemberValue', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	setChildMemberValue(copy, "a.b.c", 2);

	expect(copy.a.b.c).toBe(2);
});

it('setChildMemberValue.nonExistingMember', () => {
	const data: any = {};
	setChildMemberValue(data, "a.b.c", 2);

	expect(data.a?.b?.c).toBe(2);
});

it('setChildMemberValue.array.path[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	setChildMemberValue(copy, "a.b.array[0]", 22);

	expect(copy.a.b.array[0]).toBe(22);
});

it('setChildMemberValue.array.path.[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	setChildMemberValue(copy, "a.b.array.[0]", 22);

	expect(copy.a.b.array[0]).toBe(22);
});

it('setChildMemberValue.nonExistingMember.array', () => {
	const data: any = {};
	setChildMemberValue(data, "a.b.array[0]", 22);

	expect(data?.a?.b?.array?.[0]).toBe(22);
});

it('setChildMemberValue.path.rootObj', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options = { rootObj: copy };
	setChildMemberValue(copy.a.b, "/a.b.c", 2, options);

	expect(copy.a.b.c).toBe(2);
});

it('setChildMemberValue.path.namedObjs', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options: GetChildMemberValueOptions = {
		getNamedObj: name => name === "bbb" ? copy.a.b : undefined
	};

	setChildMemberValue(copy, "@bbb.c", 2, options);

	expect(copy.a.b.c).toBe(2);
});

it('setChildMemberValue.custom.setMemberValue', () => {
	const data = { a_: { b_: { c_: 1 } } };

	setChildMemberValue(data, "a.b.c", 2, {
		getMemberValue: (parent, name) => {
			expect(name.fullQualifiedName).toBe(name.name === "a" ? "a" : name.name === "b" ? "a.b" : "a.b.c");
			return (parent as any)[`${name.name}_`];
		},
		setMemberValue: (parent, name, value) => {
			expect(name.fullQualifiedName).toBe(name.name === "a" ? "a" : name.name === "b" ? "a.b" : "a.b.c");
			(parent as any)[`${name.name}_`] = value;
			return true;
		}
	});

	expect(data.a_.b_.c_).toBe(2);
});

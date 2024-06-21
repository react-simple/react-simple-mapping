import { deepCopyObject } from "@react-simple/react-simple-util";
import { GetChildMemberValueOptions, deleteChildMember } from "objectModel";
import { CHILD_MEMBER_TESTOBJ } from "objectModel/test.data";

it('deleteChildMember', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	deleteChildMember(copy, "a.b.c", true);

	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('deleteChildMember.array.path[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	deleteChildMember(copy, "a.b.array[0]", true);

	expect(copy.a.b.c).toBe(1);
	expect(copy.a.b.array?.length).toBe(1);
	expect(copy.a.b.array[0]).toBe(12);
});

it('deleteChildMember.array.path.[0]', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	deleteChildMember(copy, "a.b.array.[0]", true);

	expect(copy.a.b.c).toBe(1);
	expect(copy.a.b.array?.length).toBe(1);
	expect(copy.a.b.array[0]).toBe(12);
});

it('deleteChildMember.path.rootObj', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options = { rootObj: copy };
	deleteChildMember(copy, "/a.b.c", true, options);

	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('deleteChildMember.path.namedObjs', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	const options: GetChildMemberValueOptions = {
		getNamedObj: name => name === "bbb" ? copy.a.b : undefined
	};

	deleteChildMember(copy, "@bbb.c", true, options);

	expect(copy.a.b.c).toBeUndefined();
	expect(copy.a.b).toBeDefined();
	expect(copy.a.b.array?.[0]).toBe(11);
});

it('deleteChildMember.custom.deleteMember', () => {
	const data = { a_: { b_: { c_: 1 } } };

	deleteChildMember(data, "a.b.c", false, {
		getMemberValue: (parent, name) => {
			expect(name.fullQualifiedName).toBe(name.name==="a"?"a": name.name==="b"?"a.b":"a.b.c");
			return (parent as any)[`${name.name}_`];
		},
		deleteMember: (parent, name) => {
			expect(name.fullQualifiedName).toBe(name.name === "a" ? "a" : name.name === "b" ? "a.b" : "a.b.c");
			delete (parent as any)[`${name.name}_`];
			return true;
		}
	});

	expect(data.a_.b_.c_).toBeUndefined();
	expect(data.a_.b_).toBeDefined();
});

it('deleteChildMember.path.deleteEmptyParents', () => {
	const copy = deepCopyObject(CHILD_MEMBER_TESTOBJ);
	deleteChildMember(copy, "a.b.array", true); // should not remove "a" and "a.b"

	expect(copy.a?.b?.array).toBeUndefined();
	expect(copy.a?.b?.c).toBeDefined();
	expect(copy.a?.b).toBeDefined();
	expect(copy.a).toBeDefined();

	deleteChildMember(copy, "a.b.c", true); // should remove "a" and "a.b" since "a.b" became empty
	expect(copy.a?.b?.array).toBeUndefined();
	expect(copy.a?.b?.c).toBeUndefined();
	expect(copy.a?.b).toBeUndefined();
	expect(copy.a).toBeUndefined();
});

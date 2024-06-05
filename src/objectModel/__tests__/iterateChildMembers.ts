import { sameArrays, sameDictionaries } from "@react-simple/react-simple-util";
import { iterateChildMembers } from "objectModel/functions";
import { CHILD_MEMBER_TESTOBJ } from "objectModel/test.data";

it("iterateChildMembers", () => {
	const members: string[] = [];

	iterateChildMembers(CHILD_MEMBER_TESTOBJ, t => members.push(t.fullQualifiedName));
	
	expect(sameArrays(members, ["a", "a.b", "a.b.c", "a.b.array", "a.b.array[0]", "a.b.array[1]"])).toBe(true);
});

it("iterateChildMembers.getValue", () => {
	const membersAndValues: Record<string, unknown> = {};

	iterateChildMembers(
		CHILD_MEMBER_TESTOBJ,
		({ fullQualifiedName, getValue }) => membersAndValues[fullQualifiedName] = getValue()
	);

	expect(sameDictionaries(
		membersAndValues,
		{
			a: CHILD_MEMBER_TESTOBJ.a,
			"a.b": CHILD_MEMBER_TESTOBJ.a.b,
			"a.b.c": CHILD_MEMBER_TESTOBJ.a.b.c,
			"a.b.array": CHILD_MEMBER_TESTOBJ.a.b.array,
			"a.b.array[0]": CHILD_MEMBER_TESTOBJ.a.b.array[0],
			"a.b.array[1]": CHILD_MEMBER_TESTOBJ.a.b.array[1]
		}
	)).toBe(true);
});

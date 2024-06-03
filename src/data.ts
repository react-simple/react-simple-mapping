import { ReactSimpleMapping } from "./types";

// For depndency injection references. All stub references are set by the respective util files.
const stub: any = () => { };

export const REACT_SIMPLE_MAPPING: ReactSimpleMapping = {
	DI: {
		helpers: {
			fullQualifiedMemberNameMatchSubTree: stub
		},
		
		objectModel: {
			getChildMember: stub,
			getChildMemberValue: stub,
			setChildMemberValue: stub,
			deleteChildMember: stub
		}
	}
};

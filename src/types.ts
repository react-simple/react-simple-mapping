import { ReactSimpleMappingDependencyInjection } from "types.di";

export interface ReactSimpleMapping {
	// dependency injection; these methods are replacable with custom implementation
	DI: ReactSimpleMappingDependencyInjection;
}

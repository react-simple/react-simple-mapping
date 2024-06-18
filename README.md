# React Simple! Object Mapping Library
Object mapping functions for React application development. Currently supports reading and writing child members of an object by using 
**full qualified child names** like "name1.name2.name3[0].name4". This documentation is for version **0.7.0**.

Features:
- Supports **manipulating child members in object hierarchies** using full qualified paths supporting nested objects (.), arrays ([*n*]), named references (@*name*) and root references (/).
- **Dependency injection** for pluggable architecture. All the important methods can be replaced with custom implementation by setting REACT_SIMPLE_MAPPING.DI members.
- See **Unit tests** for samples for all features

# Usage

## Installation
npm -i @react-simple/react-simple-mapping

## Build
npm run build

## Test
npm run test

## Import
import { ... } from "@react-simple/react-simple-mapping";

## Samples

- Get the value of a child member by using **getChildMemberValue(*partner*, "partner.addresses[0].city")**
- Set the value of a child member by using **setChildMemberValue(*partner*, "partner.addresses[0].city", "New-York")**
- Delete a child member and all its empty parents by calling **deleteChildMember(*partner*, "partner.addresses[0]", true)**
- Get accessors to manipulate a member later by calling **getChildMemberInfo(*partner*, "partner.addresses[0].city")** which will return the following **ChildMemberInfo** members: ***parents*[], *getValue*(), *setValue*(), *deleteMember*()**
- Iterate all child members recursively by calling **iterateChildMembers(*partner*, *childMemberInfo* => { ... })**

# Configuration

## REACT_SIMPLE_MAPPING

Members in the **REACT_SIMPLE_MAPPING** object can be set to update the behavior of the provided functions.

### REACT_SIMPLE_MAPPING.DI

Dependency injection references which will be called by the appropriate methods. For example **getChildMemberInfo()** will 
call **REACT_SIMPLE_MAPPING.DI.objectMapping.getChildMemberInfo()**, so it can be easily replaced with a custom implementation. 
The custom callback will be called with all parameters and a callback to the default implementation (**getChildMember_default()**) to make implementing wrappers easier.

# Content

## Object Model

### Types
- **GetChildMemberInfoOptions&lt;*TValueType*&gt;**: Parameters for getting accessors for child members in object hierarchies 
by providing the full qualified name of the member in the object tree ("name.name[0].name" etc.) Named values (@*name*) and root (/) references are supported, also the hierarchical iteration can be customized by providing custom callbacks.
- **ChildMemberInfo&lt;*TValueType, RootObj*&gt;, ObjectWithFullQualifiedName**: Return type for getting accessors for child members. Provides iteration details and **getValue(), setValue()** and **deleteChildMember()** accessors.
- **GetChildMemberValueOptions**: Parameter type for the getChildMemberValue() method. If the hierarchy is incomplete returns *undefined* and does not create missing hierarchy objects.
- **SetChildMemberValueOptions**: Parameter type for the setChildMemberValue() method. If the hierarchy is incomplete creates the missing hierarchy objects.
- **DeleteChildMemberOptions**: Parameter and return type for the **deleteChildMember()** method.

### Functions

- **getChildMemberInfo(*rootObj, fullQualifiedName, options*)**: Returns accessors for a nested object member by parsing the provided full qualified name.
  - Understands nested object (.), array ([*n*]), named (@*name*) or root object (/) references.
  - Returns the details of the member with all its parents from the object tree and also the **getValue(), setValue(*value*)** and **deleteChildMember()** callbacks to update the member.
  - In *options* custom **getValue(*parent, name, options*), setValue(*parent, name, value, options*), createObject(*parent, name, options*)** and **deleteMember(*parent, name, options*)** callbacks can be specified to navigate the object tree. 
  - By default nested objects are accessed using the **parent[*childName*]** format, but it can be overriden by specifying a custom **options.getValue()** callback to return **parent.childNodes[*childName*]** for example, depending on the object model traversed.
- **getChildMemberValue(*rootObj, fullQualifiedName, options*)**: Returns the value of the specified nested member. If the hierarchy is incomplete returns *undefined* and  does not create missing hierarchy objects. Call the *getChildMemberInfo*() method and accepts the same options.
- **setChildMemberValue(*rootObj, fullQualifiedName, value, options*)**: Sets the value of the specified nested member. If the hierarchy is incomplete creates the missing hierarchy objects.
 Calls the *getChildMemberInfo*() method and accepts the same options.
- **deleteChildMember(*rootObj, fullQualifiedName, options*)**: Removes the specified nested member. If the hierarchy is incomplete returns success. 
 Calls the *getChildMemberInfo*() method and accepts the same options.

# Links

- How to Set Up Rollup to Run React?: https://www.codeguage.com/blog/setup-rollup-for-react
- Creating and testing a react package with CRA and rollup: https://dev.to/emeka/creating-and-testing-a-react-package-with-cra-and-rollup-5a4l
- (react-scripts) Support for TypeScript 5.x: https://github.com/facebook/create-react-app/issues/13080

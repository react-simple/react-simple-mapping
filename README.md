# React Simple! Object Mapping Library
Basic utility functions for React application development. 

This documentation is for version 0.5.1.

Features:
- Supports getting child member accessor for objects using full qualified paths for getting, setting and deleting members supporting nested objects (.), arrays
- Unit tests for all fetaures

# Usage

## Installation
npm -i @react-simple/react-simple-mapping

## Build
npm run build

## Test
npm run test

## Import
import { ... } from "@react-simple/react-simple-mapping";

# Configuration
## REACT_SIMPLE_UTIL

Members in the REACT_SIMPLE_UTIL object can be set to update the behavior of the provided functions.

### REACT_SIMPLE_UTIL.DI

Dependency injection references which will be called by the appropriate methods. For example **getChildObjectMember()** will 
call **REACT_SIMPLE_UTIL.DI.objectMapping.getChildObjectMember**, so it can be easily replaced with a custom implementation. 
The custom callback will be called with all parameters and a callback to the default implementation in case it only acts as a wrapper.

# Content

## Object Model

### Types
- **GetObjectChildMemberOptions&lt;*ValueType*&gt;**: Parameters for getting accessors for child members of objects hierarchially 
by providing the full qualified name of the member in the object tree ("name.name[0].name" etc.) Named value (@name) and root (/) references are supported, also the hierarchical iteration can be customized by providing custom callbacks.
- **GetObjectChildMemberReturn&lt;*ValueType, RootObj*&gt;, ObjectWithFullQualifiedName**: Return type for getting accessors for child members. 
Provides iteration details and get, set and delete accessors (callbacks) for the given member in the object tree.
- **GetObjectChildValueOptions, GetObjectChildValueReturn**: Parameter and return types for the **getObjectChildValue()** method, 
which is a shortcut to the GetObjectChildMember() method. If the hierarchy is incomplete returns undefined, but does not create missing hierarchy objects.
- **SetObjectChildValueOptions, SetObjectChildValueReturn**: Parameter and return types for the **setObjectChildValue()** method, 
which is a shortcut to the GetObjectChildMember() method. If the hierarchy is incomplete creates the missing hierarchy objects.
- **DeleteObjectChildMemberOptions, DeleteObjectChildMemberReturn**: Parameter and return types for the **setObjectChildValue()** method, 
which is a shortcut to the GetObjectChildMember() method.

### Functions

- **getObjectChildMember()**: Returns accessors for a nested object member by parsing the provided full qualified name.
  - Understands nested object (.), array ([n]), named (@name) or root object (/) references.
  - Returns the details of the member with all its parents from the object tree and also the **getValue(), setValue()** and **deleteMember()** callbacks to update the member.
  - In *options* custom **getValue(), setValue(), createObject()** and **deleteMember()** callbacks can be specified to navigate the object tree. 
  For example, by default nested objects are accessed using the **parent[*childName*]** format, but it can be overriden by specifying a custom **options.getValue()** callback to return **parent.childNodes[*childName*]** for example, depending on the object model traversed.
- **getObjectChildValue())**: Returns the value of the specified nested member. If the hierarchy is incomplete returns undefined, 
but does not create missing hierarchy objects. Calls the **getObjectChildMember()** method and accepts the same options for customization.
- **setObjectChildValue()**: Sets the value of the specified nested member. If the hierarchy is incomplete creates the missing hierarchy objects.
 Calls the **getObjectChildMember()** method and accepts the same options for customization.
- **deleteObjectChildMember()**: Removes the specified nested member. If the hierarchy is incomplete returns success. 
 Calls the **getObjectChildMember()** method and accepts the same options for customization.

# Links

- How to Set Up Rollup to Run React?: https://www.codeguage.com/blog/setup-rollup-for-react
- Creating and testing a react package with CRA and rollup: https://dev.to/emeka/creating-and-testing-a-react-package-with-cra-and-rollup-5a4l
- (react-scripts) Support for TypeScript 5.x: https://github.com/facebook/create-react-app/issues/13080

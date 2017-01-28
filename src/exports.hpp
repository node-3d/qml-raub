#ifndef BINDINGS_HPP
#define BINDINGS_HPP

#include <node.h>

namespace NodeQml {
	
	void init(     const v8::FunctionCallbackInfo<v8::Value>& args );
	void resize(   const v8::FunctionCallbackInfo<v8::Value>& args );
	void mouse(    const v8::FunctionCallbackInfo<v8::Value>& args );
	void keyboard( const v8::FunctionCallbackInfo<v8::Value>& args );
	void use(      const v8::FunctionCallbackInfo<v8::Value>& args );
	void set(      const v8::FunctionCallbackInfo<v8::Value>& args );
	void get(      const v8::FunctionCallbackInfo<v8::Value>& args );
	void invoke(   const v8::FunctionCallbackInfo<v8::Value>& args );
	void libs(     const v8::FunctionCallbackInfo<v8::Value>& args );
	
}

#endif

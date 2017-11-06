#ifndef COMMON_HPP
#define COMMON_HPP

// NodeJS includes
#include <node.h>
#include <nan.h>

namespace {
	
	#define JS_STR(...) Nan::New<String>(__VA_ARGS__).ToLocalChecked()
	#define JS_INT(val) Nan::New<v8::Integer>(val)
	#define JS_NUM(val) Nan::New<v8::Number>(val)
	#define JS_BOOL(val) (val) ? Nan::True() : Nan::False()
	#define JS_RETHROW(tc) v8::Local<v8::Value>::New(tc.Exception());
	
	#define REQ_ARGS(N)                                                     \
		if (info.Length() < (N))                                            \
			Nan::ThrowTypeError("Expected " #N " arguments");
	
	#define REQ_STR_ARG(I, VAR)                                             \
		if (info.Length() <= (I) || !info[I]->IsString())                   \
			Nan::ThrowTypeError("Argument " #I " must be a string");        \
		String::Utf8Value _v8_##VAR(info[I]->ToString());                   \
		std::string _std_##VAR = std::string(*_v8_##VAR);                   \
		const char *VAR = _std_##VAR.c_str();
	
	#define REQ_INT32_ARG(I, VAR)                                           \
		if (info.Length() <= (I) || !info[I]->IsInt32())                    \
			Nan::ThrowTypeError("Argument " #I " must be a int32");         \
		int VAR = info[I]->Int32Value();
	
	#define REQ_INT_ARG(I, VAR)                                             \
		if (info.Length() <= (I) || !info[I]->IsNumber())                   \
			Nan::ThrowTypeError("Argument " #I " must be a int");           \
		size_t VAR = static_cast<size_t>(info[I]->NumberValue());
	
	#define REQ_EXT_ARG(I, VAR)                                             \
		if (info.Length() <= (I) || !info[I]->IsExternal())                 \
			Nan::ThrowTypeError("Argument " #I " invalid");                 \
		Local<External> VAR = Local<External>::Cast(info[I]);
	
	#define REQ_FUN_ARG(I, VAR)                                             \
		if (info.Length() <= (I) || !info[I]->IsFunction())                 \
			Nan::ThrowTypeError("Argument " #I " must be a function");      \
		Local<Function> VAR = Local<Function>::Cast(info[I]);
	
	#define REQ_ERROR_THROW(error) if (ret == error) Nan::ThrowError(String::New(#error));
	
}

#endif // COMMON_HPP

#include <qmlui.hpp>

#include "exports.hpp"

#include <string>

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Number;
using v8::Value;
using v8::Handle;
using v8::HandleScope;
using v8::Context;
using v8::Function;
using v8::Persistent;
using v8::CopyablePersistentTraits;

void initialize (Local<Object> exports) {
	NODE_SET_METHOD( exports, "init",     NodeQml::init     );
	NODE_SET_METHOD( exports, "resize",   NodeQml::resize   );
	NODE_SET_METHOD( exports, "mouse",    NodeQml::mouse    );
	NODE_SET_METHOD( exports, "keyboard", NodeQml::keyboard );
	NODE_SET_METHOD( exports, "use",      NodeQml::use      );
	NODE_SET_METHOD( exports, "get",      NodeQml::get      );
	NODE_SET_METHOD( exports, "set",      NodeQml::set      );
	NODE_SET_METHOD( exports, "invoke",   NodeQml::invoke   );
	NODE_SET_METHOD( exports, "libs",     NodeQml::libs     );
}

Persistent<Function, CopyablePersistentTraits<Function>> jsEventCb;
void callCb(const char *data) {
	
	auto isolate = Isolate::GetCurrent();
	HandleScope scope(isolate);
	
	auto context = isolate->GetCurrentContext(); // crashes nwjs here
	auto global = context->Global();
	
	Handle<Value> argv[1];
	argv[0] = String::NewFromUtf8(isolate, data);
	
	auto fn = Local<Function>::New(isolate, jsEventCb);
	fn->Call(global, 1, argv);
	
}

// -------- METHODS -------- //


void NodeQml::init(const FunctionCallbackInfo<Value>& args) {
	
	auto isolate = args.GetIsolate();
	
	
	if ( ! args[0]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::init(), argument #0 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param0(args[0]->ToString());
	std::string cwdOwn = std::string(*param0);
	
	if ( ! args[1]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::init(), argument #1 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param1(args[1]->ToString());
	std::string cwdLib = std::string(*param1);
	
	
	if ( ! args[2]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::init(), argument #2 must be a number!"
		));
		return;
	}
	int param2 = static_cast<int>(args[2]->NumberValue());
	
	
	if ( ! args[3]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::init(), argument #3 must be a number!"
		));
		return;
	}
	int param3 = static_cast<int>(args[3]->NumberValue());
	
	
	if ( ! args[4]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::init(), argument #4 must be a number!"
		));
		return;
	}
	int param4 = static_cast<int>(args[4]->NumberValue());
	
	
	if ( ! args[5]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::init(), argument #5 must be a number!"
		));
		return;
	}
	int param5 = static_cast<int>(args[5]->NumberValue());
	
	
	if ( ! args[6]->IsFunction() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::init(), argument #6 must be a function!"
		));
		return;
	}
	Handle<Function> param6 = Handle<Function>::Cast(args[6]);
	Persistent<Function> cb(isolate, param6);
	jsEventCb = cb;
	
	
	qmlui_init(cwdOwn.c_str(), cwdLib.c_str(), param2, param3, param4, param5, callCb);
	
}


void NodeQml::resize(const FunctionCallbackInfo<Value>& args) {
	
	auto isolate = args.GetIsolate();
	
	if ( ! args[0]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::resize(), argument #0 must be a number!"
		));
		return;
	}
	int param0 = static_cast<int>(args[0]->NumberValue());
	
	if ( ! args[1]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::resize(), argument #1 must be a number!"
		));
		return;
	}
	int param1 = static_cast<int>(args[1]->NumberValue());
	
	qmlui_resize(param0, param1);
	
}

void NodeQml::mouse(const FunctionCallbackInfo<Value>& args) {
	
	auto isolate = args.GetIsolate();
	
	if ( ! args[0]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::mouse(), argument #0 must be a number!"
		));
		return;
	}
	int param0 = static_cast<int>(args[0]->NumberValue());
	
	if ( ! args[1]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::mouse(), argument #1 must be a number!"
		));
		return;
	}
	int param1 = static_cast<int>(args[1]->NumberValue());
	
	if ( ! args[2]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::mouse(), argument #2 must be a number!"
		));
		return;
	}
	int param2 = static_cast<int>(args[2]->NumberValue());
	
	
	if ( ! args[3]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::mouse(), argument #3 must be a number!"
		));
		return;
	}
	int param3 = static_cast<int>(args[3]->NumberValue());
	
	if ( ! args[4]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::mouse(), argument #4 must be a number!"
		));
		return;
	}
	int param4 = static_cast<int>(args[4]->NumberValue());
	
	qmlui_mouse(param0, param1, param2, param3, param4);
	
}

void NodeQml::keyboard(const FunctionCallbackInfo<Value>& args) {
	
	auto isolate = args.GetIsolate();
	
	if ( ! args[0]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::keyboard(), argument #0 must be a number!"
		));
		return;
	}
	int param0 = static_cast<int>(args[0]->NumberValue());
	
	if ( ! args[1]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::keyboard(), argument #1 must be a number!"
		));
		return;
	}
	int param1 = static_cast<int>(args[1]->NumberValue());
	
	if ( ! args[2]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::keyboard(), argument #2 must be a number!"
		));
		return;
	}
	char param2 = static_cast<char>(args[2]->NumberValue());
	
	qmlui_keyboard(param0, param1, param2);
	
}


void NodeQml::use(const FunctionCallbackInfo<Value>& args) {
	
	auto isolate = args.GetIsolate();
	
	if (args[0]->IsString()) {
		
		v8::String::Utf8Value param0(args[0]->ToString());
		std::string str = std::string(*param0);
		qmlui_use(str.c_str(), true);
		
	} else if (args[0]->IsBoolean() && args[1]->IsString()) {
		
		v8::String::Utf8Value param1(args[1]->ToString());
		std::string str = std::string(*param1);
		qmlui_use(str.c_str(), args[0]->BooleanValue());
		
	} else {
		
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::use(), Arguments should be ([bool,] string)!"
		));
		return;
		
	}
	
}


void NodeQml::set(const FunctionCallbackInfo<Value>& args) {
	
	auto isolate = args.GetIsolate();
	
	if ( ! args[0]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::set(), argument #0 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param0(args[0]->ToString());
	std::string obj = std::string(*param0);
	
	if ( ! args[1]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::set(), argument #1 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param1(args[1]->ToString());
	std::string key = std::string(*param1);
	
	if ( ! args[2]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::set(), argument #2 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param2(args[2]->ToString());
	std::string value = std::string(*param2);
	
	qmlui_set(obj.c_str(), key.c_str(), value.c_str());
	
}


void NodeQml::get(const FunctionCallbackInfo<Value>& args) {
	
	auto isolate = args.GetIsolate();
	
	if ( ! args[0]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::set(), argument #0 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param0(args[0]->ToString());
	std::string obj = std::string(*param0);
	
	if ( ! args[1]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::set(), argument #1 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param1(args[1]->ToString());
	std::string key = std::string(*param1);
	
	qmlui_get(obj.c_str(), key.c_str());
	
}


void NodeQml::invoke(const FunctionCallbackInfo<Value>& args) {
	
	auto isolate = args.GetIsolate();
	
	if ( ! args[0]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::invoke(), argument #0 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param0(args[0]->ToString());
	std::string obj = std::string(*param0);
	
	if ( ! args[1]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::invoke(), argument #1 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param1(args[1]->ToString());
	std::string key = std::string(*param1);
	
	if ( ! args[2]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::invoke(), argument #2 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param2(args[2]->ToString());
	std::string value = std::string(*param2);
	
	qmlui_invoke(obj.c_str(), key.c_str(), value.c_str());
	
}


void NodeQml::libs(const FunctionCallbackInfo<Value>& args) {
	
	auto isolate = args.GetIsolate();
	
	if ( ! args[0]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::libs(), argument #0 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param0(args[0]->ToString());
	std::string dir = std::string(*param0);
	
	qmlui_libs(dir.c_str());
	
}


NODE_MODULE(qml, initialize);

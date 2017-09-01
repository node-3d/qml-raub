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
	NODE_SET_METHOD( exports, "window",   NodeQml::window   );
	NODE_SET_METHOD( exports, "close",    NodeQml::close    );
	NODE_SET_METHOD( exports, "resize",   NodeQml::resize   );
	NODE_SET_METHOD( exports, "mouse",    NodeQml::mouse    );
	NODE_SET_METHOD( exports, "keyboard", NodeQml::keyboard );
	NODE_SET_METHOD( exports, "load",     NodeQml::load     );
	NODE_SET_METHOD( exports, "get",      NodeQml::get      );
	NODE_SET_METHOD( exports, "set",      NodeQml::set      );
	NODE_SET_METHOD( exports, "invoke",   NodeQml::invoke   );
	NODE_SET_METHOD( exports, "libs",     NodeQml::libs     );
	NODE_SET_METHOD( exports, "plugins",  NodeQml::plugins  );
}

Persistent<Function, CopyablePersistentTraits<Function>> jsEventCb;
void callCb(const char *data) {
	
	auto isolate = Isolate::GetCurrent();
	HandleScope scope(isolate);
	
	auto context = isolate->GetCurrentContext();
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
	
	
	if ( ! args[1]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::init(), argument #1 must be a number!"
		));
		return;
	}
	size_t param1 = static_cast<size_t>(args[1]->NumberValue());
	
	
	if ( ! args[2]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::init(), argument #2 must be a number!"
		));
		return;
	}
	size_t param2 = static_cast<size_t>(args[2]->NumberValue());
	
	qmlui_init(cwdOwn.c_str(), param1, param2);
	
}


void NodeQml::window(const FunctionCallbackInfo<Value>& args) {
	
	auto isolate = args.GetIsolate();
	
	if ( ! args[0]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::window(), argument #0 must be a number!"
		));
		return;
	}
	int param0 = static_cast<int>(args[0]->NumberValue());
	
	
	if ( ! args[1]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::window(), argument #1 must be a number!"
		));
		return;
	}
	int param1 = static_cast<int>(args[1]->NumberValue());
	
	
	if ( ! args[2]->IsFunction() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::window(), argument #2 must be a function!"
		));
		return;
	}
	Handle<Function> param2 = Handle<Function>::Cast(args[2]);
	Persistent<Function> cb(isolate, param2);
	jsEventCb = cb;
	
	int i = -1;
	qmlui_window(&i, param0, param1, callCb);
	
	if ( i < 0 ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::window(), could not create a new window!"
		));
		return;
	}
	
	args.GetReturnValue().Set(Number::New(i));
	
}


void NodeQml::close(const FunctionCallbackInfo<Value>& args) {
	
	auto isolate = args.GetIsolate();
	
	if ( ! args[0]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::close(), argument #0 must be a number!"
		));
		return;
	}
	int param0 = static_cast<int>(args[0]->NumberValue());
	
	qmlui_close(param0);
	
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
	
	if ( ! args[2]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::resize(), argument #2 must be a number!"
		));
		return;
	}
	int param2 = static_cast<int>(args[2]->NumberValue());
	
	qmlui_resize(param0, param1, param2);
	
}

void NodeQml::mouse(const FunctionCallbackInfo<Value>& args) {
	
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
	
	if ( ! args[5]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::mouse(), argument #5 must be a number!"
		));
		return;
	}
	int param5 = static_cast<int>(args[5]->NumberValue());
	
	qmlui_mouse(param0, param1, param2, param3, param4, param5);
	
}

void NodeQml::keyboard(const FunctionCallbackInfo<Value>& args) {
	
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
	int param2 = static_cast<int>(args[2]->NumberValue());
	
	if ( ! args[3]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::keyboard(), argument #3 must be a number!"
		));
		return;
	}
	char param3 = static_cast<char>(args[3]->NumberValue());
	
	qmlui_keyboard(param0, param1, param2, param3);
	
}


void NodeQml::load(const FunctionCallbackInfo<Value>& args) {
	
	auto isolate = args.GetIsolate();
	
	if ( ! args[0]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::load(), argument #0 must be a number!"
		));
		return;
	}
	int param0 = static_cast<int>(args[0]->NumberValue());
	
	if (args[1]->IsString()) {
		
		v8::String::Utf8Value param1(args[1]->ToString());
		std::string str = std::string(*param1);
		qmlui_use(param0, str.c_str(), true);
		
	} else if (args[1]->IsBoolean() && args[2]->IsString()) {
		
		v8::String::Utf8Value param2(args[2]->ToString());
		std::string str = std::string(*param2);
		qmlui_use(param0, str.c_str(), args[1]->BooleanValue());
		
	} else {
		
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::load(), Arguments should be (int, [bool,] string)!"
		));
		return;
		
	}
	
}


void NodeQml::set(const FunctionCallbackInfo<Value>& args) {
	
	auto isolate = args.GetIsolate();
	
	if ( ! args[0]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::resize(), argument #0 must be a number!"
		));
		return;
	}
	int param0 = static_cast<int>(args[0]->NumberValue());
	
	if ( ! args[1]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::set(), argument #1 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param1(args[1]->ToString());
	std::string obj = std::string(*param1);
	
	if ( ! args[2]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::set(), argument #2 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param2(args[2]->ToString());
	std::string key = std::string(*param2);
	
	if ( ! args[3]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::set(), argument #3 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param3(args[3]->ToString());
	std::string value = std::string(*param3);
	
	qmlui_set(param0, obj.c_str(), key.c_str(), value.c_str());
	
}


void NodeQml::get(const FunctionCallbackInfo<Value>& args) {
	
	auto isolate = args.GetIsolate();
	
	if ( ! args[0]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::resize(), argument #0 must be a number!"
		));
		return;
	}
	int param0 = static_cast<int>(args[0]->NumberValue());
	
	if ( ! args[1]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::set(), argument #1 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param1(args[1]->ToString());
	std::string obj = std::string(*param1);
	
	if ( ! args[2]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::set(), argument #2 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param2(args[2]->ToString());
	std::string key = std::string(*param2);
	
	qmlui_get(param0, obj.c_str(), key.c_str());
	
}


void NodeQml::invoke(const FunctionCallbackInfo<Value>& args) {
	
	auto isolate = args.GetIsolate();
	
	if ( ! args[0]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::resize(), argument #0 must be a number!"
		));
		return;
	}
	int param0 = static_cast<int>(args[0]->NumberValue());
	
	if ( ! args[1]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::invoke(), argument #1 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param1(args[1]->ToString());
	std::string obj = std::string(*param1);
	
	if ( ! args[2]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::invoke(), argument #1 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param2(args[2]->ToString());
	std::string key = std::string(*param2);
	
	if ( ! args[3]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::invoke(), argument #3 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param3(args[3]->ToString());
	std::string value = std::string(*param3);
	
	qmlui_invoke(param0, obj.c_str(), key.c_str(), value.c_str());
	
}


void NodeQml::libs(const FunctionCallbackInfo<Value>& args) {
	
	auto isolate = args.GetIsolate();
	
	if ( ! args[0]->IsInt32() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::resize(), argument #0 must be a number!"
		));
		return;
	}
	int param0 = static_cast<int>(args[0]->NumberValue());
	
	if ( ! args[1]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::libs(), argument #1 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param1(args[1]->ToString());
	std::string dir = std::string(*param1);
	
	qmlui_libs(param0, dir.c_str());
	
}


void NodeQml::plugins(const FunctionCallbackInfo<Value>& args) {
	
	auto isolate = args.GetIsolate();
	
	if ( ! args[0]->IsString() ) {
		args.GetReturnValue().Set(String::NewFromUtf8(
			isolate,
			"Error: NodeQml::plugins(), argument #0 must be a string!"
		));
		return;
	}
	v8::String::Utf8Value param0(args[0]->ToString());
	std::string dir = std::string(*param0);
	
	qmlui_plugins(dir.c_str());
	
}

NODE_MODULE(qml, initialize);

#include <string>

#include <qmlui.hpp>

#include "common.hpp"
#include "exports.hpp"


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

using namespace NodeQml;


Persistent<Function, CopyablePersistentTraits<Function>> jsEventCb;
void callCb(int i, const char *data) {
	
	auto isolate = Isolate::GetCurrent();
	HandleScope scope(isolate);
	
	auto context = isolate->GetCurrentContext();
	auto global = context->Global();
	
	argv[0] = JS_NUM(i);
	argv[1] = String::NewFromUtf8(isolate, data);
	
	auto fn = Local<Function>::New(isolate, jsEventCb);
	fn->Call(global, 2, argv);
	
}

// -------- METHODS -------- //


NAN_METHOD(NodeQml::init) {
	
	Nan::HandleScope scope;
	auto isolate = Isolate::GetCurrent();
	
	REQ_ARGS(4);
	
	REQ_STR_ARG(0, param0);
	REQ_INT_ARG(1, param1);
	REQ_INT_ARG(2, param2);
	REQ_FUN_ARG(3, param3);
	jsEventCb = Persistent<Function>(isolate, param3);
	
	qmlui_init(param0, param1, param2, callCb);
	
}


NAN_METHOD(NodeQml::view) {
	
	Nan::HandleScope scope;
	
	REQ_ARGS(2);
	
	REQ_INT32_ARG(0, param0);
	REQ_INT32_ARG(1, param1);
	
	int i = -1;
	qmlui_view(&i, param0, param1);
	
	if ( i < 0 ) {
		Nan::ThrowTypeError("NodeQml::window(), could not create a new window!");
		return;
	}
	
	info.GetReturnValue().Set(JS_NUM(i));
	
}


NAN_METHOD(NodeQml::close) {
	
	Nan::HandleScope scope;
	
	REQ_ARGS(1);
	
	REQ_INT32_ARG(0, param0);
	
	qmlui_close(param0);
	
}


NAN_METHOD(NodeQml::exit) {
	
	Nan::HandleScope scope;
	
	qmlui_exit();
	
}


NAN_METHOD(NodeQml::resize) {
	
	Nan::HandleScope scope;
	
	REQ_ARGS(3);
	
	REQ_INT32_ARG(0, param0);
	REQ_INT32_ARG(1, param1);
	REQ_INT32_ARG(2, param2);
	
	qmlui_resize(param0, param1, param2);
	
}

NAN_METHOD(NodeQml::mouse) {
	
	Nan::HandleScope scope;
	
	REQ_ARGS(6);
	
	REQ_INT32_ARG(0, param0);
	REQ_INT32_ARG(1, param1);
	REQ_INT32_ARG(2, param2);
	REQ_INT32_ARG(3, param3);
	REQ_INT32_ARG(4, param4);
	REQ_INT32_ARG(5, param5);
	
	qmlui_mouse(param0, param1, param2, param3, param4, param5);
	
}

NAN_METHOD(NodeQml::keyboard) {
	
	Nan::HandleScope scope;
	
	REQ_ARGS(4);
	
	REQ_INT32_ARG(0, param0);
	REQ_INT32_ARG(1, param1);
	REQ_INT32_ARG(2, param2);
	REQ_INT32_ARG(3, param3);
	
	qmlui_keyboard(param0, param1, param2, param3);
	
}


NAN_METHOD(NodeQml::load) {
	
	Nan::HandleScope scope;
	
	REQ_ARGS(2);
	
	REQ_INT32_ARG(0, param0);
	
	if (info[1]->IsString()) {
		
		REQ_STR_ARG(1, param1);
		qmlui_load(param0, param1, true);
		
	} else if (info[1]->IsBoolean() && info[2]->IsString()) {
		
		REQ_STR_ARG(2, param2);
		qmlui_load(param0, param2, info[1]->BooleanValue());
		
	} else {
		Nan::ThrowTypeError("NodeQml::load(), Arguments should be (int, [bool,] string)!");
	}
	
}


NAN_METHOD(NodeQml::set) {
	
	Nan::HandleScope scope;
	
	REQ_ARGS(4);
	
	REQ_INT32_ARG(0, param0);
	REQ_STR_ARG(1, param1);
	REQ_STR_ARG(2, param2);
	REQ_STR_ARG(3, param3);
	
	qmlui_set(param0, param1, param2, param3);
	
}


NAN_METHOD(NodeQml::get) {
	
	Nan::HandleScope scope;
	
	REQ_ARGS(3);
	
	REQ_INT32_ARG(0, param0);
	REQ_STR_ARG(1, param1);
	REQ_STR_ARG(2, param2);
	
	qmlui_get(param0, param1, param2);
	
}


NAN_METHOD(NodeQml::invoke) {
	
	Nan::HandleScope scope;
	
	REQ_ARGS(4);
	
	REQ_INT32_ARG(0, param0);
	REQ_STR_ARG(1, param1);
	REQ_STR_ARG(2, param2);
	REQ_STR_ARG(3, param3);
	
	qmlui_invoke(param0, param1, param2, param3);
	
}


NAN_METHOD(NodeQml::libs) {
	
	Nan::HandleScope scope;
	
	REQ_ARGS(2);
	
	REQ_INT32_ARG(0, param0);
	REQ_STR_ARG(1, param1);
	
	qmlui_libs(param0, param1);
	
}


NAN_METHOD(NodeQml::plugins) {
	
	Nan::HandleScope scope;
	
	REQ_ARGS(1);
	
	REQ_STR_ARG(0, param0);
	
	qmlui_plugins(param0);
	
}


#define JS_QML_SET_METHOD(name) Nan::SetMethod(target, #name, NodeQml::name)

extern "C" {
	
	NAN_MODULE_INIT(initialize) {
		
		atexit(qmlui_exit);
		
		Nan::HandleScope scope;
		
		JS_QML_SET_METHOD(init    );
		JS_QML_SET_METHOD(view    );
		JS_QML_SET_METHOD(close   );
		JS_QML_SET_METHOD(exit    );
		JS_QML_SET_METHOD(resize  );
		JS_QML_SET_METHOD(mouse   );
		JS_QML_SET_METHOD(keyboard);
		JS_QML_SET_METHOD(load    );
		JS_QML_SET_METHOD(get     );
		JS_QML_SET_METHOD(set     );
		JS_QML_SET_METHOD(invoke  );
		JS_QML_SET_METHOD(libs    );
		JS_QML_SET_METHOD(plugins );
		
	}
	
	NODE_MODULE(qml, initialize)
	
}

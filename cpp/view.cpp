#include <cstdlib>
#include <iostream>

#include <qml-ui.hpp>

#include "view.hpp"

using namespace v8;
using namespace node;
using namespace std;

#define THIS_VIEW                                                             \
	View *view = ObjectWrap::Unwrap<View>(info.This());

#define THIS_CHECK                                                            \
	if (view->_isDestroyed) return;

#define DES_CHECK                                                             \
	if (_isDestroyed) return;


extern "C" {
	
	void init(Handle<Object> target) { View::init(target); }
	
	NODE_MODULE(NODE_GYP_MODULE_NAME, init);
	
}


Nan::Persistent<v8::Function> View::_constructor;

std::map<QmlUi*, View*> _uis;


void View::commonCb(QmlUi *ui, const char *type, const char *json) { NAN_HS;
	
	View *view = _uis[ui];
	Local<Value> argv[] = { JS_STR(type), JS_STR(json) };
	view->_emit(2, argv);
	
}


NAN_METHOD(View::_init) {
	
	REQ_UTF8_ARG(0, cwdOwn);
	REQ_OFFS_ARG(1, wnd);
	REQ_OFFS_ARG(2, ctx);
	
	QmlUi::init(*cwdOwn, wnd, ctx, commonCb);
	
}


NAN_METHOD(View::plugins) {
	
	REQ_UTF8_ARG(0, str);
	
	QmlUi::plugins(*str);
	
}


NAN_METHOD(View::libs) { THIS_VIEW;
	
	REQ_UTF8_ARG(1, str);
	
	view->_qmlui->libs(*str);
	
}


void View::init(Handle<Object> target) {
	
	Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(newCtor);
	
	ctor->InstanceTemplate()->SetInternalFieldCount(1);
	ctor->SetClassName(JS_STR("View"));
	
	// prototype
	Nan::SetPrototypeMethod(ctor, "destroy", destroy);
	Nan::SetPrototypeMethod(ctor, "resize", resize);
	Nan::SetPrototypeMethod(ctor, "mouse", mouse);
	Nan::SetPrototypeMethod(ctor, "keyboard", keyboard);
	Nan::SetPrototypeMethod(ctor, "load", load);
	Nan::SetPrototypeMethod(ctor, "set", set);
	Nan::SetPrototypeMethod(ctor, "get", get);
	Nan::SetPrototypeMethod(ctor, "invoke", invoke);
	Nan::SetPrototypeMethod(ctor, "libs", libs);
	
	Local<ObjectTemplate> proto = ctor->PrototypeTemplate();
	
	_constructor.Reset(Nan::GetFunction(ctor).ToLocalChecked());
	
	Local<Function> ctorFunc = Nan::GetFunction(ctor).ToLocalChecked();
	
	Nan::Set(target, JS_STR("View"), ctorFunc);
	
	Nan::SetMethod(ctorFunc, "init", View::_init);
	Nan::SetMethod(ctorFunc, "plugins", View::plugins);
	
}


void View::_emit(int argc, Local<Value> argv[]) {
	
	if ( ! Nan::New(_emitter)->Has(JS_STR("emit")) ) {
		return;
	}
	
	Nan::Callback callback(Nan::New(_emitter)->Get(JS_STR("emit")).As<Function>());
	
	if ( ! callback.IsEmpty() ) {
		callback.Call(argc, argv);
	}
	
}


NAN_METHOD(View::newCtor) {
	
	CTOR_CHECK("View");
	
	REQ_OBJ_ARG(0, emitter);
	REQ_INT32_ARG(1, w);
	REQ_INT32_ARG(2, h);
	
	View *view = new View(w, h);
	view->_emitter.Reset(emitter);
	view->Wrap(info.This());
	
	RET_VALUE(info.This());
	
}


View::View(int w, int h) {
	
	_qmlui = new QmlUi(w, h);
	
	_uis[_qmlui] = this;
	
	_isDestroyed = false;
	
}


View::~View() {
	
	_destroy();
	
}


void View::_destroy() { DES_CHECK;
	
	delete _qmlui;
	_qmlui = NULL;
	
	_isDestroyed = true;
	
	// Emit "destroy"
	Local<Value> argv = JS_STR("destroy");
	_emit(1, &argv);
	
	_uis.erase(_qmlui);
	
}


NAN_METHOD(View::resize) { THIS_VIEW;
	
	REQ_INT32_ARG(1, w);
	REQ_INT32_ARG(2, h);
	
	view->_qmlui->resize(w, h);
	
}


NAN_METHOD(View::mouse) { THIS_VIEW;
	
	REQ_INT32_ARG(1, type);
	REQ_INT32_ARG(2, button);
	REQ_INT32_ARG(3, buttons);
	REQ_INT32_ARG(4, x);
	REQ_INT32_ARG(5, y);
	
	view->_qmlui->mouse(type, button, buttons, x, y);
	
}


NAN_METHOD(View::keyboard) { THIS_VIEW;
	
	REQ_INT32_ARG(1, type);
	REQ_INT32_ARG(2, key);
	REQ_INT32_ARG(3, text);
	
	view->_qmlui->keyboard(type, key, text);
	
}


NAN_METHOD(View::load) { THIS_VIEW;
	
	if (info[1]->IsString()) {
		
		REQ_UTF8_ARG(1, path);
		view->_qmlui->load(*path, true);
		
	} else if (info[1]->IsBoolean() && info[2]->IsString()) {
		
		REQ_BOOL_ARG(1, isFile);
		REQ_UTF8_ARG(2, str);
		view->_qmlui->load(*str, isFile);
		
	} else {
		Nan::ThrowTypeError("NodeQml::load(), Arguments should be (int, [bool,] string)!");
	}
	
}


NAN_METHOD(View::set) { THIS_VIEW;
	
	REQ_UTF8_ARG(1, obj);
	REQ_UTF8_ARG(2, prop);
	REQ_UTF8_ARG(3, json);
	
	view->_qmlui->set(*obj, *prop, *json);
	
}


NAN_METHOD(View::get) { THIS_VIEW;
	
	REQ_UTF8_ARG(1, obj);
	REQ_UTF8_ARG(2, prop);
	
	view->_qmlui->get(*obj, *prop);
	
}


NAN_METHOD(View::invoke) { THIS_VIEW;
	
	REQ_UTF8_ARG(1, obj);
	REQ_UTF8_ARG(2, method);
	REQ_UTF8_ARG(3, json);
	
	view->_qmlui->invoke(*obj, *method, *json);
	
}


NAN_METHOD(View::destroy) { THIS_VIEW; THIS_CHECK;
	
	view->_destroy();
	
}

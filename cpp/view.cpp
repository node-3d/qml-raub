#include <cstdlib>
#include <iostream>

#include "view.hpp"

using namespace v8;
using namespace node;
using namespace std;

#define THIS_VIEW                                                             \
	View *view = ObjectWrap::Unwrap<View>(info.This());

#define THIS_CHECK                                                            \
	if (view->_isDestroyed) return;


Nan::Persistent<v8::Function> View::_constructor;

std::map<QmlUi*, View*> View::_uis;


void View::commonCb(QmlUi *ui, const char *data) { NAN_HS;
	
	View *view = _uis[ui];
	Local<Value> argv = JS_STR(data);
	view->_emit(view, 1, &argv);
	
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


void View::init(Handle<Object> target) {
	
	Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(newCtor);
	
	ctor->InstanceTemplate()->SetInternalFieldCount(1);
	ctor->SetClassName(JS_STR("View"));
	
	// prototype
	Nan::SetPrototypeMethod(ctor, "destroy", destroy);
	
	Local<ObjectTemplate> proto = ctor->PrototypeTemplate();
	
	_constructor.Reset(Nan::GetFunction(ctor).ToLocalChecked());
	Nan::Set(target, JS_STR("View"), Nan::GetFunction(ctor).ToLocalChecked());
	
	Nan::SetMethod(ctor, "init", _init);
	Nan::SetMethod(ctor, "plugins", _init);
	
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
	
}


NAN_METHOD(View::resize) { THIS_VIEW;
	
	REQ_INT32_ARG(1, w);
	REQ_INT32_ARG(2, h);
	
	view->resize(w, h);
	
}


NAN_METHOD(View::mouse) { THIS_VIEW;
	
	REQ_INT32_ARG(1, type);
	REQ_INT32_ARG(2, button);
	REQ_INT32_ARG(3, buttons);
	REQ_INT32_ARG(4, x);
	REQ_INT32_ARG(5, y);
	
	view->mouse(type, button, buttons, x, y);
	
}


NAN_METHOD(View::keyboard) { THIS_VIEW;
	
	REQ_INT32_ARG(1, type);
	REQ_INT32_ARG(2, key);
	REQ_INT32_ARG(3, text);
	
	view->keyboard(type, key, text);
	
}


NAN_METHOD(View::load) { THIS_VIEW;
	
	if (info[1]->IsString()) {
		
		REQ_UTF8_ARG(1, path);
		view->load(*path, true);
		
	} else if (info[1]->IsBoolean() && info[2]->IsString()) {
		
		REQ_BOOL_ARG(1, isFile);
		REQ_UTF8_ARG(2, str);
		view->load(*str, isFile);
		
	} else {
		Nan::ThrowTypeError("NodeQml::load(), Arguments should be (int, [bool,] string)!");
	}
	
}


NAN_METHOD(View::set) { THIS_VIEW;
	
	REQ_UTF8_ARG(1, obj);
	REQ_UTF8_ARG(2, prop);
	REQ_UTF8_ARG(3, json);
	
	view->set(*obj, *prop, *json);
	
}


NAN_METHOD(View::get) { THIS_VIEW;
	
	REQ_UTF8_ARG(1, obj);
	REQ_UTF8_ARG(2, prop);
	
	view->get(*obj, *prop);
	
}


NAN_METHOD(View::invoke) { THIS_VIEW;
	
	REQ_UTF8_ARG(1, obj);
	REQ_UTF8_ARG(2, method);
	REQ_UTF8_ARG(3, json);
	
	view->invoke(*obj, *method, *json);
	
}


NAN_METHOD(View::libs) { THIS_VIEW;
	
	REQ_UTF8_ARG(1, str);
	
	view->libs(*str);
	
}


NAN_METHOD(View::destroy) { THIS_VIEW; THIS_CHECK;
	
	view->_destroy();
	
}

#include <cstdlib>

#include <qml-ui.hpp>

#include "view.hpp"

#ifndef WIN32
	#include <dlfcn.h>
#endif


// ------ Aux macros

using namespace v8;
using namespace node;
using namespace std;

#define THIS_VIEW                                                             \
	View *view = ObjectWrap::Unwrap<View>(info.This());

#define THIS_CHECK                                                            \
	if (view->_isDestroyed) return;

#define DES_CHECK                                                             \
	if (_isDestroyed) return;


map<QmlUi*, View*> _uis;



// ------ Constructor and Destructor

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
	
	_uis.erase(_qmlui);
	
}


// ------ Methods and props

void View::commonCb(QmlUi *ui, const char *type, const char *json) { NAN_HS;
	
	View *view = _uis[ui];
	
	Nan::Callback converter(Nan::New(_converter));
	Nan::AsyncResource async("View::commonCb()");
	V8_VAR_VAL argv = JS_STR(json);
	V8_VAR_VAL objVal = converter.Call(1, &argv, &async).ToLocalChecked();
	view->emit(type, 1, &objVal);
	
}


NAN_METHOD(View::_init) {
	
	REQ_UTF8_ARG(0, cwdOwn);
	REQ_OFFS_ARG(1, wnd);
	REQ_OFFS_ARG(2, ctx);
	
	// Preload the libs with OUR @RPATH, not some junk builtin rpaths
	#ifndef WIN32
	dlopen("libicui18n.so.56", RTLD_LAZY);
	dlopen("libicuuc.so.56", RTLD_LAZY);
	dlopen("libicudata.so.56", RTLD_LAZY);
	dlopen("libicuio.so.56", RTLD_LAZY);
	dlopen("libicule.so.56", RTLD_LAZY);
	dlopen("libicutu.so.56", RTLD_LAZY);
	dlopen("libQt5Core.so.5", RTLD_LAZY);
	dlopen("libQt5Network.so.5", RTLD_LAZY);
	dlopen("libQt5DBus.so.5", RTLD_LAZY);
	dlopen("libQt5Gui.so.5", RTLD_LAZY);
	dlopen("libQt5OpenGL.so.5", RTLD_LAZY);
	dlopen("libQt5Widgets.so.5", RTLD_LAZY);
	dlopen("libQt5XcbQpa.so.5", RTLD_LAZY);
	dlopen("libQt5Qml.so.5", RTLD_LAZY);
	dlopen("libQt5Quick.so.5", RTLD_LAZY);
	dlopen("libQt5QuickControls2.so.5", RTLD_LAZY);
	dlopen("libQt5QuickTemplates2.so.5", RTLD_LAZY);
	dlopen("libQt5QuickWidgets.so.5", RTLD_LAZY);
	#endif
	
	QmlUi::init(*cwdOwn, wnd, ctx, commonCb);
	
}


NAN_METHOD(View::plugins) {
	
	REQ_UTF8_ARG(0, str);
	
	QmlUi::plugins(*str);
	
}


NAN_METHOD(View::update) {
	
	QmlUi::update();
	
}


NAN_METHOD(View::libs) { THIS_VIEW;
	
	REQ_UTF8_ARG(0, str);
	
	view->_qmlui->libs(*str);
	
}


NAN_METHOD(View::resize) { THIS_VIEW;
	
	REQ_INT32_ARG(0, w);
	REQ_INT32_ARG(1, h);
	
	view->_qmlui->resize(w, h);
	
}


NAN_METHOD(View::mouse) { THIS_VIEW;
	
	REQ_INT32_ARG(0, type);
	REQ_INT32_ARG(1, button);
	REQ_INT32_ARG(2, buttons);
	REQ_INT32_ARG(3, x);
	REQ_INT32_ARG(4, y);
	
	view->_qmlui->mouse(type, button, buttons, x, y);
	
}


NAN_METHOD(View::keyboard) { THIS_VIEW;
	
	REQ_INT32_ARG(0, type);
	REQ_INT32_ARG(1, key);
	REQ_UINT32_ARG(2, text);
	
	view->_qmlui->keyboard(type, key, text);
	
}


NAN_METHOD(View::load) { THIS_VIEW;
	
	REQ_BOOL_ARG(0, isFile);
	REQ_UTF8_ARG(1, source);
	
	view->_qmlui->load(*source, isFile);
	
}


NAN_METHOD(View::set) { THIS_VIEW;
	
	REQ_UTF8_ARG(0, obj);
	REQ_UTF8_ARG(1, prop);
	REQ_UTF8_ARG(2, json);
	
	view->_qmlui->set(*obj, *prop, *json);
	
}


NAN_METHOD(View::get) { THIS_VIEW;
	
	REQ_UTF8_ARG(0, obj);
	REQ_UTF8_ARG(1, prop);
	
	view->_qmlui->get(*obj, *prop);
	
}


NAN_METHOD(View::invoke) { THIS_VIEW;
	
	REQ_UTF8_ARG(0, obj);
	REQ_UTF8_ARG(1, method);
	REQ_UTF8_ARG(2, json);
	
	view->_qmlui->invoke(*obj, *method, *json);
	
}


// ------ System methods and props for ObjectWrap

V8_STORE_FT View::_protoView;
V8_STORE_FUNC View::_ctorView;
V8_STORE_FUNC View::_converter;


void View::init(V8_VAR_OBJ target) {
	
	V8_VAR_FT proto = Nan::New<FunctionTemplate>(newCtor);
	
	// class View inherits EventEmitter
	V8_VAR_FT parent = Nan::New(EventEmitter::_protoEventEmitter);
	proto->Inherit(parent);
	
	proto->InstanceTemplate()->SetInternalFieldCount(1);
	proto->SetClassName(JS_STR("View"));
	
	
	// Accessors
	
	V8_VAR_OT obj = proto->PrototypeTemplate();
	
	ACCESSOR_R(obj, isDestroyed);
	
	
	// -------- dynamic
	
	Nan::SetPrototypeMethod(proto, "destroy", destroy);
	Nan::SetPrototypeMethod(proto, "resize", resize);
	Nan::SetPrototypeMethod(proto, "mouse", mouse);
	Nan::SetPrototypeMethod(proto, "keyboard", keyboard);
	Nan::SetPrototypeMethod(proto, "load", load);
	Nan::SetPrototypeMethod(proto, "set", set);
	Nan::SetPrototypeMethod(proto, "get", get);
	Nan::SetPrototypeMethod(proto, "invoke", invoke);
	Nan::SetPrototypeMethod(proto, "libs", libs);
	
	// -------- static
	
	V8_VAR_FUNC ctor = Nan::GetFunction(proto).ToLocalChecked();
	
	_protoView.Reset(proto);
	_ctorView.Reset(ctor);
	
	Nan::Set(target, JS_STR("View"), ctor);
	
	Nan::SetMethod(ctor, "init", View::_init);
	Nan::SetMethod(ctor, "plugins", View::plugins);
	Nan::SetMethod(ctor, "update", View::update);
	
	// ---- helper
	
	V8_VAR_STR code = JS_STR(
		R"(
			(json => {
				try {
					return JSON.parse(json);
				} catch (e) {
					console.error(`Error: Qml event, bad JSON.\n${json}`);
					return null;
				}
			})
		)"
	);
	V8_VAR_FUNC converter = V8_VAR_FUNC::Cast(v8::Script::Compile(code)->Run());
	_converter.Reset(converter);
	
}


bool View::isView(V8_VAR_OBJ obj) {
	return Nan::New(_protoView)->HasInstance(obj);
}


NAN_METHOD(View::newCtor) {
	
	CTOR_CHECK("View");
	
	REQ_INT32_ARG(0, w);
	REQ_INT32_ARG(1, h);
	
	View *view = new View(w, h);
	
	view->Wrap(info.This());
	RET_VALUE(info.This());
	
}


NAN_METHOD(View::destroy) { THIS_VIEW; THIS_CHECK;
	
	view->emit("destroy");
	
	view->_destroy();
	
}


NAN_GETTER(View::isDestroyedGetter) { THIS_VIEW;
	
	RET_VALUE(JS_BOOL(view->_isDestroyed));
	
}


#ifdef __linux__
	#include <dlfcn.h>
#endif

#include <map>
#include <qml-ui.hpp>

#include "view.hpp"


std::map<QmlUi*, View*> _uis;

Napi::FunctionReference View::_converter;

IMPLEMENT_ES5_CLASS(View);


void View::initClass(Napi::Env env, Napi::Object exports) {
	
	Napi::Function ctor = wrap(env);
	
	ctor.DefineProperties({
		Napi::PropertyDescriptor::Function(env, ctor, "init", init),
		Napi::PropertyDescriptor::Function(env, ctor, "plugins", plugins),
		Napi::PropertyDescriptor::Function(env, ctor, "update", update)
	});
	
	JS_ASSIGN_GETTER(isDestroyed);
	
	JS_ASSIGN_METHOD(destroy);
	JS_ASSIGN_METHOD(resize);
	JS_ASSIGN_METHOD(mouse);
	JS_ASSIGN_METHOD(keyboard);
	JS_ASSIGN_METHOD(load);
	JS_ASSIGN_METHOD(set);
	JS_ASSIGN_METHOD(get);
	JS_ASSIGN_METHOD(invoke);
	JS_ASSIGN_METHOD(libs);
	
	exports.Set("View", ctor);
	
}


View::View(const Napi::CallbackInfo &info):
_asyncCtx(info.Env(), "View::commonCb()") { NAPI_ENV;
	
	_that.Reset(info.This().As<Napi::Object>());
	
	super(info);
	
	REQ_INT32_ARG(0, w);
	REQ_INT32_ARG(1, h);
	
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



void View::commonCb(QmlUi *ui, const char *name, const char *json) {
	
	View *view = _uis[ui];
	Napi::Env env = view->_that.Env();
	NAPI_HS;
	
	napi_value argv = JS_STR(json);
	Napi::Value objVal = _converter.MakeCallback(
		view->_that.Value(),
		1,
		&argv,
		view->_asyncCtx
	);
	
	eventEmitAsync(
		view->_that.Value(),
		name,
		1,
		&objVal,
		view->_asyncCtx
	);
	
}


JS_METHOD(View::init) {
	
	Napi::Env env = info.Env();
	
	REQ_STR_ARG(0, cwdOwn);
	REQ_OFFS_ARG(1, wnd);
	REQ_OFFS_ARG(2, ctx);
	REQ_FUN_ARG(3, converter);
	
	_converter.Reset(converter, 1);
	
	// Preload the libs with OUR @RPATH, not some junk builtin rpaths
	#ifdef __linux__
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
	
	QmlUi::init(cwdOwn.c_str(), wnd, ctx, commonCb);
	
	RET_UNDEFINED;
	
}


JS_METHOD(View::plugins) {
	
	Napi::Env env = info.Env();
	
	REQ_STR_ARG(0, str);
	QmlUi::plugins(str.c_str());
	RET_UNDEFINED;
	
}


JS_METHOD(View::update) {
	
	Napi::Env env = info.Env();
	
	QmlUi::update();
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View, libs) { THIS_CHECK;
	
	REQ_STR_ARG(0, str);
	
	_qmlui->libs(str.c_str());
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View, resize) { THIS_CHECK;
	
	REQ_INT32_ARG(0, w);
	REQ_INT32_ARG(1, h);
	
	_qmlui->resize(w, h);
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View, mouse) { THIS_CHECK;
	
	REQ_INT32_ARG(0, type);
	REQ_INT32_ARG(1, button);
	REQ_INT32_ARG(2, buttons);
	REQ_INT32_ARG(3, x);
	REQ_INT32_ARG(4, y);
	
	_qmlui->mouse(type, button, buttons, x, y);
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View, keyboard) { THIS_CHECK;
	
	REQ_INT32_ARG(0, type);
	REQ_INT32_ARG(1, key);
	REQ_UINT32_ARG(2, text);
	
	_qmlui->keyboard(type, key, text);
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View, load) { THIS_CHECK;
	
	REQ_BOOL_ARG(0, isFile);
	REQ_STR_ARG(1, source);
	
	_qmlui->load(source.c_str(), isFile);
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View, set) { THIS_CHECK;
	
	REQ_STR_ARG(0, obj);
	REQ_STR_ARG(1, prop);
	REQ_STR_ARG(2, json);
	
	_qmlui->set(obj.c_str(), prop.c_str(), json.c_str());
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View, get) { THIS_CHECK;
	
	REQ_STR_ARG(0, obj);
	REQ_STR_ARG(1, prop);
	
	_qmlui->get(obj.c_str(), prop.c_str());
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View, invoke) { THIS_CHECK;
	
	REQ_STR_ARG(0, obj);
	REQ_STR_ARG(1, method);
	REQ_STR_ARG(2, json);
	
	_qmlui->invoke(obj.c_str(), method.c_str(), json.c_str());
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View, destroy) { THIS_CHECK;
	
	eventEmit(_that.Value(), "destroy");
	
	_destroy();
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_GETTER(View, isDestroyed) { THIS_CHECK;
	
	RET_BOOL(_isDestroyed);
	
}

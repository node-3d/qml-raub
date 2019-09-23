#ifdef __linux__
	#include <dlfcn.h>
#endif

#include <map>
#include <qml-ui.hpp>

#include "view.hpp"


std::map<QmlUi*, View*> _uis;


IMPLEMENT_ES5_CLASS(View);

void View::initClass(Napi::Env env, Napi::Object exports) {
	
	Napi::Function ctor = wrap(env);
	
	JS_ASSIGN_GETTER(isDestroyed);
	
	JS_ASSIGN_METHOD(destroy);
	JS_ASSIGN_METHOD(init); // make static
	JS_ASSIGN_METHOD(plugins); // make static
	JS_ASSIGN_METHOD(update); // make static
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



void View::commonCb(QmlUi *ui, const char *type, const char *json) {
	
	View *view = _uis[ui];
	Napi::Env env = view->_that.Env();
	STATE_ENV; NAPI_HS;
	
	napi_value argv = JS_STR(json);
	Napi::Value objVal = thatEmit.MakeCallback(view->_that.Value(), 1, &argv, view->_asyncCtx);
	eventEmitAsync(view->_that.Value(), name, 1, &objVal, view->_asyncCtx);
	
}


JS_IMPLEMENT_METHOD(View::init) {
	
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
	
	QmlUi::init(*cwdOwn, wnd, ctx, commonCb);
	
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View::plugins) {
	REQ_STR_ARG(0, str);
	QmlUi::plugins(*str);
	RET_UNDEFINED;
}


JS_IMPLEMENT_METHOD(View::update) {
	
	QmlUi::update();
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View::libs) { THIS_VIEW;
	
	REQ_STR_ARG(0, str);
	
	view->_qmlui->libs(*str);
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View::resize) { THIS_VIEW;
	
	REQ_INT32_ARG(0, w);
	REQ_INT32_ARG(1, h);
	
	view->_qmlui->resize(w, h);
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View::mouse) { THIS_VIEW;
	
	REQ_INT32_ARG(0, type);
	REQ_INT32_ARG(1, button);
	REQ_INT32_ARG(2, buttons);
	REQ_INT32_ARG(3, x);
	REQ_INT32_ARG(4, y);
	
	view->_qmlui->mouse(type, button, buttons, x, y);
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View::keyboard) { THIS_VIEW;
	
	REQ_INT32_ARG(0, type);
	REQ_INT32_ARG(1, key);
	REQ_UINT32_ARG(2, text);
	
	view->_qmlui->keyboard(type, key, text);
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View::load) { THIS_VIEW;
	
	REQ_BOOL_ARG(0, isFile);
	REQ_STR_ARG(1, source);
	
	view->_qmlui->load(*source, isFile);
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View::set) { THIS_VIEW;
	
	REQ_STR_ARG(0, obj);
	REQ_STR_ARG(1, prop);
	REQ_STR_ARG(2, json);
	
	view->_qmlui->set(*obj, *prop, *json);
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View::get) { THIS_VIEW;
	
	REQ_STR_ARG(0, obj);
	REQ_STR_ARG(1, prop);
	
	view->_qmlui->get(*obj, *prop);
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View::invoke) { THIS_VIEW;
	
	REQ_STR_ARG(0, obj);
	REQ_STR_ARG(1, method);
	REQ_STR_ARG(2, json);
	
	view->_qmlui->invoke(*obj, *method, *json);
	RET_UNDEFINED;
	
}


JS_IMPLEMENT_METHOD(View::destroy) { THIS_VIEW; THIS_CHECK;
	
	view->emit("destroy");
	
	view->_destroy();
	RET_UNDEFINED;
	
}


NAN_GETTER(View::isDestroyedGetter) { THIS_VIEW;
	
	RET_BOOL(view->_isDestroyed);
	
}

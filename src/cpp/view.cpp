#include <map>
#include <qml-ui.hpp>

#include "view.hpp"


std::map<QmlUi*, View*> _uis;

Napi::FunctionReference View::_converter;

IMPLEMENT_ES5_CLASS(View);


void View::initClass(Napi::Env env, Napi::Object exports) {
	Napi::Function ctor = wrap(env);
	
	ctor.DefineProperties({
		Napi::PropertyDescriptor::Function(env, ctor, "_init", _init),
		Napi::PropertyDescriptor::Function(env, ctor, "_plugins", _plugins),
		Napi::PropertyDescriptor::Function(env, ctor, "update", update),
		Napi::PropertyDescriptor::Function(env, ctor, "_style", _style),
	});
	
	JS_ASSIGN_GETTER(isDestroyed);
	
	JS_ASSIGN_METHOD(_destroy);
	JS_ASSIGN_METHOD(_resize);
	JS_ASSIGN_METHOD(_mouse);
	JS_ASSIGN_METHOD(_keyboard);
	JS_ASSIGN_METHOD(_load);
	JS_ASSIGN_METHOD(_set);
	JS_ASSIGN_METHOD(_get);
	JS_ASSIGN_METHOD(_invoke);
	JS_ASSIGN_METHOD(_libs);
	
	exports.Set("View", ctor);
}


View::View(const Napi::CallbackInfo &info):
_asyncCtx(info.Env(), "View::commonCb()") { NAPI_ENV;
	_that.Reset(info.This().As<Napi::Object>());
	
	super(info);
	
	if (info.Length() < 2 || ! info[0].IsNumber() || ! info[1].IsNumber()) {
		JS_THROW("Arguments 0 and 1 must be of type `Int32`");
	}
	int w = info[0].ToNumber().Int32Value();
	int h = info[1].ToNumber().Int32Value();
	
	_qmlui = new QmlUi(w, h);
	
	_uis[_qmlui] = this;
	
	_isDestroyed = false;
}


View::~View() {
	_destroyImpl();
}


void View::_destroyImpl() { DES_CHECK;
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
	
	eventEmit(
		view->_that.Value(),
		name,
		1,
		&objVal,
		view->_asyncCtx
	);
}


JS_METHOD(View::_init) { NAPI_ENV;
	REQ_STR_ARG(0, cwdOwn);
	REQ_OFFS_ARG(1, wnd);
	REQ_OFFS_ARG(2, ctx);
	REQ_OFFS_ARG(3, device);
	REQ_FUN_ARG(4, converter);
	
	_converter.Reset(converter, 1);
	_converter.SuppressDestruct();
	
	QmlUi::init2(cwdOwn.c_str(), wnd, ctx, device, commonCb);
	
	RET_UNDEFINED;
}


JS_METHOD(View::_plugins) { NAPI_ENV;
	REQ_STR_ARG(0, str);
	QmlUi::plugins(str.c_str());
	RET_UNDEFINED;
}


JS_METHOD(View::_style) { NAPI_ENV;
	REQ_STR_ARG(0, name);
	LET_STR_ARG(1, def);
	QmlUi::style(name.c_str(), def.size() ? def.c_str() : nullptr);
	RET_UNDEFINED;
}


JS_METHOD(View::update) { NAPI_ENV;
	QmlUi::update();
	RET_UNDEFINED;
}


JS_IMPLEMENT_METHOD(View, _libs) { THIS_CHECK;
	REQ_STR_ARG(0, str);
	
	_qmlui->libs(str.c_str());
	RET_UNDEFINED;
}


JS_IMPLEMENT_METHOD(View, _resize) { THIS_CHECK;
	REQ_INT32_ARG(0, w);
	REQ_INT32_ARG(1, h);
	
	_qmlui->resize(w, h);
	RET_UNDEFINED;
}


JS_IMPLEMENT_METHOD(View, _mouse) { THIS_CHECK;
	REQ_INT32_ARG(0, type);
	REQ_INT32_ARG(1, button);
	REQ_INT32_ARG(2, buttons);
	REQ_INT32_ARG(3, x);
	REQ_INT32_ARG(4, y);
	
	_qmlui->mouse(type, button, buttons, x, y);
	RET_UNDEFINED;
}


JS_IMPLEMENT_METHOD(View, _keyboard) { THIS_CHECK;
	REQ_INT32_ARG(0, type);
	REQ_INT32_ARG(1, key);
	REQ_UINT32_ARG(2, text);
	
	_qmlui->keyboard(type, key, text);
	RET_UNDEFINED;
}


JS_IMPLEMENT_METHOD(View, _load) { THIS_CHECK;
	REQ_BOOL_ARG(0, isFile);
	REQ_STR_ARG(1, source);
	
	_qmlui->load(source.c_str(), isFile);
	RET_UNDEFINED;
}


JS_IMPLEMENT_METHOD(View, _set) { THIS_CHECK;
	REQ_STR_ARG(0, obj);
	REQ_STR_ARG(1, prop);
	REQ_STR_ARG(2, json);
	
	_qmlui->set(obj.c_str(), prop.c_str(), json.c_str());
	RET_UNDEFINED;
}


JS_IMPLEMENT_METHOD(View, _get) { THIS_CHECK;
	REQ_STR_ARG(0, obj);
	REQ_STR_ARG(1, prop);
	
	std::string result = _qmlui->get(obj.c_str(), prop.c_str());
	RET_STR(result);
}


JS_IMPLEMENT_METHOD(View, _invoke) { THIS_CHECK;
	REQ_STR_ARG(0, obj);
	REQ_STR_ARG(1, method);
	REQ_STR_ARG(2, json);
	
	std::string result = _qmlui->invoke(obj.c_str(), method.c_str(), json.c_str());
	RET_STR(result);
}


JS_IMPLEMENT_METHOD(View, _destroy) { THIS_CHECK;
	eventEmit(_that.Value(), "destroy");
	
	_destroyImpl();
	RET_UNDEFINED;
}


JS_IMPLEMENT_GETTER(View, isDestroyed) { THIS_CHECK;
	RET_BOOL(_isDestroyed);
}

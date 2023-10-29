#ifndef VIEW_HPP
#define VIEW_HPP

#include <addon-tools.hpp>


class QmlUi;

class View {
DECLARE_ES5_CLASS(View, View);
	
public:
	static void initClass(Napi::Env env, Napi::Object exports);
	
	~View();
	explicit View(const Napi::CallbackInfo &info);
	
	void _destroyImpl();
	
private:
	Napi::AsyncContext _asyncCtx;
	Napi::ObjectReference _that;
	static Napi::FunctionReference _converter;
	bool _isDestroyed;
	QmlUi *_qmlui;
	
	static void commonCb(QmlUi *ui, const char *type, const char *json);
	
	static JS_METHOD(_init);
	static JS_METHOD(_plugins);
	static JS_METHOD(_style);
	static JS_METHOD(update);
	
	JS_DECLARE_GETTER(View, isDestroyed);
	JS_DECLARE_METHOD(View, _destroy);
	JS_DECLARE_METHOD(View, _resize);
	JS_DECLARE_METHOD(View, _mouse);
	JS_DECLARE_METHOD(View, _keyboard);
	JS_DECLARE_METHOD(View, _load);
	JS_DECLARE_METHOD(View, _set);
	JS_DECLARE_METHOD(View, _get);
	JS_DECLARE_METHOD(View, _invoke);
	JS_DECLARE_METHOD(View, _libs);
};


#endif // VIEW_HPP

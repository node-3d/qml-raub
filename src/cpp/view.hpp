#ifndef _VIEW_HPP_
#define _VIEW_HPP_

#include <addon-tools.hpp>


class QmlUi;

class View {
DECLARE_ES5_CLASS(View, View);
	
public:
	static void initClass(Napi::Env env, Napi::Object exports);
	
	~View();
	explicit View(const Napi::CallbackInfo &info);
	
	void _destroy();
	
	
private:
	Napi::AsyncContext _asyncCtx;
	Napi::ObjectReference _that;
	static Napi::FunctionReference _converter;
	bool _isDestroyed;
	QmlUi *_qmlui;
	
	static void commonCb(QmlUi *ui, const char *type, const char *json);
	
	static JS_METHOD(init);
	static JS_METHOD(plugins);
	static JS_METHOD(update);
	
	JS_DECLARE_GETTER(View, isDestroyed);
	JS_DECLARE_METHOD(View, destroy);
	JS_DECLARE_METHOD(View, resize);
	JS_DECLARE_METHOD(View, mouse);
	JS_DECLARE_METHOD(View, keyboard);
	JS_DECLARE_METHOD(View, load);
	JS_DECLARE_METHOD(View, set);
	JS_DECLARE_METHOD(View, get);
	JS_DECLARE_METHOD(View, invoke);
	JS_DECLARE_METHOD(View, libs);
	
};


#endif // _VIEW_HPP_

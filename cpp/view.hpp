#ifndef _VIEW_HPP_
#define _VIEW_HPP_


#include <map>

#include <node.h>

#ifdef _WIN32
	#pragma warning(push)
	#pragma warning(disable:4244)
#endif
#include <nan.h>
#ifdef _WIN32
	#pragma warning(pop)
#endif

#include <addon-tools.hpp>

#include <qmlui.hpp>


class View : public Nan::ObjectWrap {
	
public:
	
	static void init(v8::Handle<v8::Object> target);
	
	
protected:
	
	View(int w, int h);
	~View();
	
	static NAN_METHOD(newCtor);
	
	static NAN_METHOD(destroy);
	
	static NAN_METHOD(resize);
	static NAN_METHOD(mouse);
	static NAN_METHOD(keyboard);
	static NAN_METHOD(load);
	static NAN_METHOD(set);
	static NAN_METHOD(get);
	static NAN_METHOD(invoke);
	static NAN_METHOD(libs);
	
	
private:
	
	std::map<QmlUi*, View*> View::_uis;
	static Nan::Persistent<v8::Function> _constructor;
	
	Nan::Persistent<v8::Object> _emitter;
	inline void _emit(int argc, v8::Local<v8::Value> argv[]);
	
	void _destroy();
	
	bool _isDestroyed;
	
	QmlUi _qmlui;
	
};


#endif // _VIEW_HPP_

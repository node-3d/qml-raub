#ifndef _VIEW_HPP_
#define _VIEW_HPP_


#include <map>

#include <nan.h>
#include <qmlui.hpp>

#include "common.hpp"


class View : public Nan::ObjectWrap {
	
public:
	
	static void init(v8::Handle<v8::Object> target);
	
	
protected:
	
	explicit View();
	virtual ~View();
	
	static NAN_METHOD(newCtor);
	
	static NAN_METHOD(destroy);
	
	static NAN_METHOD(update);
	static NAN_METHOD(hit);
	static NAN_METHOD(trace);
// init
// view
// close
// exit
// resize
// mouse
// keyboard
// load
// get
// set
// invoke
// libs
// plugins
	
private:
	
	static std::map<int, View*> _views;
	static Nan::Persistent<v8::Function> _constructor;
	
	Nan::Persistent<v8::Object> _emitter;
	inline void _emit(int argc, v8::Local<v8::Value> argv[]);
	
	void _destroy();
	
	bool _isDestroyed;
	
	QmlUi _qmlui;
	
};


#endif // _VIEW_HPP_

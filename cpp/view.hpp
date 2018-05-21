#ifndef _VIEW_HPP_
#define _VIEW_HPP_


#include <map>

#include <event-emitter.hpp>


class QmlUi;


class View : public EventEmitter {
	
public:
	
	static void init(V8_VAR_OBJ target);
	static bool isView(V8_VAR_OBJ obj);
	
	static void commonCb(QmlUi *ui, const char *type, const char *json);
	
	~View();
	
	void _destroy();
	
	
protected:
	
	View(int w, int h);
	
	static V8_STORE_FT _protoView; // for inheritance
	static V8_STORE_FUNC _ctorView;
	
	bool _isDestroyed;
	
	QmlUi *_qmlui;
	
	
private:
	
	static NAN_METHOD(newCtor);
	static NAN_METHOD(destroy);
	static NAN_GETTER(isDestroyedGetter);
	
	static NAN_METHOD(_init);
	static NAN_METHOD(plugins);
	static NAN_METHOD(update);
	static NAN_METHOD(resize);
	static NAN_METHOD(mouse);
	static NAN_METHOD(keyboard);
	static NAN_METHOD(load);
	static NAN_METHOD(set);
	static NAN_METHOD(get);
	static NAN_METHOD(invoke);
	static NAN_METHOD(libs);
	
};


#endif // _VIEW_HPP_

#include <string>
#include <map>

#include <qmlui.hpp>

#include "common.hpp"

using namespace v8;
using namespace node;
using namespace std;

#define JS_QML_SET_METHOD(name) Nan::SetMethod(target, #name , NodeQml::name);

#define THIS_WINDOW                                  \
	REQ_INT32_ARG(0, window);


namespace NodeQml {


// Window info
struct ViewState {
	
	Nan::Persistent<Object> events;
	
	ViewState() {}
	
	const ViewState & operator = (const ViewState &other) { return *this; }
	
};

std::map<int, ViewState> states;


void NAN_INLINE(_emit(int id, const char *data)) { NAN_HS;
	
	ViewState &state = states[id];
	Local<Value> argv = JS_STR(data);
	
	if (Nan::New(state.events)->Has(JS_STR("emit"))) {
		
		Nan::Callback callback(Nan::New(state.events)->Get(JS_STR("emit")).As<Function>());
		
		if ( ! callback.IsEmpty() ) {
			callback.Call(1, &argv);
		}
		
	}
	
}


// -------- METHODS -------- //


NAN_METHOD(init) { NAN_HS;
	
	REQ_UTF8_ARG(0, cwdOwn);
	REQ_OFFS_ARG(1, wnd);
	REQ_OFFS_ARG(2, ctx);
	
	qmlui_init(*cwdOwn, wnd, ctx, _emit);
	
}


NAN_METHOD(view) { NAN_HS;
	
	REQ_INT32_ARG(0, w);
	REQ_INT32_ARG(1, h);
	
	int i = -1;
	qmlui_view(&i, w, h);
	
	if (i < 0) {
		Nan::ThrowTypeError("NodeQml::window(), could not create a new window!");
		return;
	}
	
	info.GetReturnValue().Set(JS_NUM(i));
	
}


NAN_METHOD(close) { NAN_HS; THIS_WINDOW;
	
	qmlui_close(window);
	
}


NAN_METHOD(exit) { NAN_HS;
	
	qmlui_exit();
	
}


NAN_METHOD(resize) { NAN_HS; THIS_WINDOW;
	
	REQ_INT32_ARG(1, w);
	REQ_INT32_ARG(2, h);
	
	qmlui_resize(window, w, h);
	
}


NAN_METHOD(mouse) { NAN_HS; THIS_WINDOW;
	
	REQ_INT32_ARG(1, type);
	REQ_INT32_ARG(2, button);
	REQ_INT32_ARG(3, buttons);
	REQ_INT32_ARG(4, x);
	REQ_INT32_ARG(5, y);
	
	qmlui_mouse(window, type, button, buttons, x, y);
	
}


NAN_METHOD(keyboard) { NAN_HS; THIS_WINDOW;
	
	REQ_INT32_ARG(1, type);
	REQ_INT32_ARG(2, key);
	REQ_INT32_ARG(3, text);
	
	qmlui_keyboard(window, type, key, text);
	
}


NAN_METHOD(load) { NAN_HS; THIS_WINDOW;
	
	if (info[1]->IsString()) {
		
		REQ_UTF8_ARG(1, path);
		qmlui_load(window, *path, true);
		
	} else if (info[1]->IsBoolean() && info[2]->IsString()) {
		
		REQ_BOOL_ARG(1, isFile);
		REQ_UTF8_ARG(2, str);
		qmlui_load(window, *str, isFile);
		
	} else {
		Nan::ThrowTypeError("NodeQml::load(), Arguments should be (int, [bool,] string)!");
	}
	
}


NAN_METHOD(set) { NAN_HS; THIS_WINDOW;
	
	REQ_UTF8_ARG(1, obj);
	REQ_UTF8_ARG(2, prop);
	REQ_UTF8_ARG(3, json);
	
	qmlui_set(window, *obj, *prop, *json);
	
}


NAN_METHOD(get) { NAN_HS; THIS_WINDOW;
	
	REQ_UTF8_ARG(1, obj);
	REQ_UTF8_ARG(2, prop);
	
	qmlui_get(window, *obj, *prop);
	
}


NAN_METHOD(invoke) { NAN_HS; THIS_WINDOW;
	
	REQ_UTF8_ARG(1, obj);
	REQ_UTF8_ARG(2, method);
	REQ_UTF8_ARG(3, json);
	
	qmlui_invoke(window, *obj, *method, *json);
	
}


NAN_METHOD(libs) { NAN_HS; THIS_WINDOW;
	
	REQ_UTF8_ARG(1, str);
	
	qmlui_libs(window, *str);
	
}


NAN_METHOD(plugins) { NAN_HS;
	
	REQ_UTF8_ARG(0, str);
	
	qmlui_plugins(*str);
	
}


} // namespace NodeQml


extern "C" {
	
	NAN_MODULE_INIT(initialize) {
		
		atexit(qmlui_exit);
		
		Nan::HandleScope scope;
		
		JS_QML_SET_METHOD(init    );
		JS_QML_SET_METHOD(view    );
		JS_QML_SET_METHOD(close   );
		JS_QML_SET_METHOD(exit    );
		JS_QML_SET_METHOD(resize  );
		JS_QML_SET_METHOD(mouse   );
		JS_QML_SET_METHOD(keyboard);
		JS_QML_SET_METHOD(load    );
		JS_QML_SET_METHOD(get     );
		JS_QML_SET_METHOD(set     );
		JS_QML_SET_METHOD(invoke  );
		JS_QML_SET_METHOD(libs    );
		JS_QML_SET_METHOD(plugins );
		
	}
	
	NODE_MODULE(qml, initialize)
	
}

#include "view.hpp"


Napi::Object initModule(Napi::Env env, Napi::Object exports) {
	
	View::init(target);
	
	return exports;
	
}


NODE_API_MODULE(qml, initModule)

#include "view.hpp"


Napi::Object initModule(Napi::Env env, Napi::Object exports) {
	
	View::initClass(env, exports);
	
	return exports;
	
}


NODE_API_MODULE(qml, initModule)

#include <cstdlib>

#include "view.hpp"

using namespace v8;
using namespace node;
using namespace std;


NAN_METHOD(_init) {
	
	REQ_UTF8_ARG(0, cwdOwn);
	REQ_OFFS_ARG(1, wnd);
	REQ_OFFS_ARG(2, ctx);
	
	qmlui_init(*cwdOwn, wnd, ctx, _emit);
	
}


extern "C" {


void init(Handle<Object> target) {
	
	View::init(target);
	
	Nan::SetMethod(target, "init", _init)
	
}


NODE_MODULE(NODE_GYP_MODULE_NAME, init);


} // extern "C"

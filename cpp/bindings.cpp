#include "view.hpp"


extern "C" {
	
	void init(Handle<Object> target) { View::init(target); }
	
	NODE_MODULE(NODE_GYP_MODULE_NAME, init);
	
}

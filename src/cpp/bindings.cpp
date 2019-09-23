#include <cstdlib>

#include <event-emitter.hpp>

#include "view.hpp"


extern "C" {


void init(V8_VAR_OBJ target) {
	
	EventEmitter::init(target);
	
	View::init(target);
	
}


NODE_MODULE(qml, init);


} // extern "C"

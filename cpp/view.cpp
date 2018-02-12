#include <cstdlib>
#include <iostream>

#include "view.hpp"

using namespace v8;
using namespace node;
using namespace std;

#define THIS_VIEW                                                             \
	View *view = ObjectWrap::Unwrap<View>(info.This());

#define THIS_CHECK                                                            \
	if (view->_isDestroyed) return;

#define V3_GETTER(NAME, CACHE)                                                \
	NAN_GETTER(View::NAME ## Getter) { THIS_VIEW; THIS_CHECK;                 \
		VEC3_TO_OBJ(view->CACHE, NAME);                                       \
		RET_VALUE(NAME);                                                      \
	}

#define CACHE_CAS(CACHE, V)                                                   \
	if (view->CACHE == V) {                                                   \
		return;                                                               \
	}                                                                         \
	view->CACHE = V;


map<int, View*> View::_views;
Nan::Persistent<v8::Function> View::_constructor;


void View::init(Handle<Object> target) {
	
	Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(newCtor);
	
	ctor->InstanceTemplate()->SetInternalFieldCount(1);
	ctor->SetClassName(JS_STR("View"));
	
	// prototype
	Nan::SetPrototypeMethod(ctor, "destroy", destroy);
	
	Local<ObjectTemplate> proto = ctor->PrototypeTemplate();
	
	_constructor.Reset(Nan::GetFunction(ctor).ToLocalChecked());
	Nan::Set(target, JS_STR("View"), Nan::GetFunction(ctor).ToLocalChecked());
	
}


void View::_emit(int argc, Local<Value> argv[]) {
	
	if ( ! Nan::New(_emitter)->Has(JS_STR("emit")) ) {
		return;
	}
	
	Nan::Callback callback(Nan::New(_emitter)->Get(JS_STR("emit")).As<Function>());
	
	if ( ! callback.IsEmpty() ) {
		callback.Call(argc, argv);
	}
	
}


NAN_METHOD(View::newCtor) {
	
	CTOR_CHECK("View");
	
	REQ_OBJ_ARG(0, emitter);
	
	View *view = new View();
	view->_emitter.Reset(emitter);
	view->Wrap(info.This());
	
	RET_VALUE(info.This());
	
}


View::View() {
	
	_isDestroyed = false;
	
	_clock = new btClock();
	_clock->reset();
	
	_physConfig = new btDefaultCollisionConfiguration();
	_physDispatcher = new btCollisionDispatcher(_physConfig);
	_physBroadphase = new btDbvtBroadphase();
	_physSolver = new btSequentialImpulseConstraintSolver();
	_physWorld = new btDiscreteDynamicsWorld(_physDispatcher, _physBroadphase, _physSolver, _physConfig);
	
	_cacheGrav.setValue(0, -10, 0);
	_physWorld->setGravity(_cacheGrav);
	
}


View::~View() {
	
	_destroy();
	
}


void View::_destroy() { DES_CHECK;
	
	vector<Body*>::iterator it = _bodies.begin();
	while (it != _bodies.end()) {
		delete (*it);
		it++;
	}
	_bodies.clear();
	
	delete _physWorld;
	_physWorld = NULL;
	
	delete _physSolver;
	_physSolver = NULL;
	
	delete _physBroadphase;
	_physBroadphase = NULL;
	
	delete _physDispatcher;
	_physDispatcher = NULL;
	
	delete _physConfig;
	_physConfig = NULL;
	
	_isDestroyed = true;
	
	// Emit "destroy"
	Local<Value> argv = JS_STR("destroy");
	_emit(1, &argv);
	
}


void View::refBody(Body *body) { DES_CHECK;
	_bodies.push_back(body);
}

void View::unrefBody(Body* body) { DES_CHECK;
	
	vector<Body*>::iterator it = _bodies.begin();
	
	while (it != _bodies.end()) {
		
		if (*it == body) {
			_bodies.erase(it);
			break;
		}
		
		it++;
		
	}
	
}


void View::doUpdate(float dt) { DES_CHECK;
	
	_physWorld->stepSimulation(dt, 10, 1.f / 120.f);
	
	vector<Body*>::iterator it = _bodies.begin();
	while (it != _bodies.end()) {
		(*it)->__update();
		it++;
	}
	
	
}


void View::doUpdate() { DES_CHECK;
	
	btScalar dt = static_cast<btScalar>(_clock->getTimeMicroseconds())* 0.000001f;
	_clock->reset();
	
	doUpdate(dt);
	
}


vector< Local<Value> > View::doTrace(const btVector3 &from, const btVector3 &to) {
	
	btCollisionWorld::AllHitsRayResultCallback allResults(from, to);
	_physWorld->rayTest(from, to, allResults);
	
	vector< Local<Value> > list;
	
	for (int i = 0; i < allResults.m_collisionObjects.size(); i++) {
		
		Body *b = reinterpret_cast<Body *>(allResults.m_collisionObjects[i]->getUserPointer());
		
		list.push_back(Trace::instance(
			true, b,
			allResults.m_hitPointWorld[i],
			allResults.m_hitNormalWorld[i]
		));
		
	}
	
	return list;
	
}


V3_GETTER(gravity, _cacheGrav);

NAN_SETTER(View::gravitySetter) { THIS_VIEW; THIS_CHECK; SETTER_VEC3_ARG;
	
	CACHE_CAS(_cacheGrav, v);
	
	view->_physWorld->setGravity(view->_cacheGrav);
	
	// Emit "gravity"
	Local<Value> argv[2] = { JS_STR("gravity"), value };
	view->_emit(2, argv);
	
}


NAN_METHOD(View::update) { THIS_VIEW; THIS_CHECK;
	
	LET_FLOAT_ARG(0, dt);
	
	if (dt > 0.f) {
		view->doUpdate(dt);
	} else {
		view->doUpdate();
	}
	
}


NAN_METHOD(View::hit) { THIS_VIEW; THIS_CHECK;
	
	REQ_VEC3_ARG(0, f);
	REQ_VEC3_ARG(1, t);
	
	Local<Value> trace = Trace::instance(view, f, t);
	
	RET_VALUE(trace);
}


NAN_METHOD(View::trace) { THIS_VIEW; THIS_CHECK;
	
	REQ_VEC3_ARG(0, f);
	REQ_VEC3_ARG(1, t);
	
	const vector< Local<Value> > &traceList = view->doTrace(f, t);
	int size = traceList.size();
	
	Local<Array> result = Nan::New<Array>(size);
	
	for (int i = 0; i < size; i++) {
		SET_I(result, i, traceList[i]);
	}
	
	RET_VALUE(result);
	
}


NAN_METHOD(View::destroy) { THIS_VIEW; THIS_CHECK;
	
	view->_destroy();
	
}

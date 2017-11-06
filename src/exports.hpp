#ifndef EXPORTS_HPP
#define EXPORTS_HPP

#include <node.h>


namespace NodeQml {
	
	NAN_METHOD(init    );
	NAN_METHOD(view    );
	NAN_METHOD(close   );
	NAN_METHOD(exit    );
	NAN_METHOD(resize  );
	NAN_METHOD(mouse   );
	NAN_METHOD(keyboard);
	NAN_METHOD(load    );
	NAN_METHOD(set     );
	NAN_METHOD(get     );
	NAN_METHOD(invoke  );
	NAN_METHOD(libs    );
	NAN_METHOD(plugins );
	
}

#endif // EXPORTS_HPP

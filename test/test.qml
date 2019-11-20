import QtQuick 2.7

Rectangle {
	
	color: 'yellow'
	anchors.fill: parent
	
	Item {
		
		objectName: 'obj1'
		property var prop1: 'value1'
		property var prop2: 'value2'
		
		onProp1Changed: eventEmit('p1c')
		
		function method1() {
			eventEmit('m1c');
		}
		
		function method2(x) {
			eventEmit('m2c', x);
		}
		
	}
	
}

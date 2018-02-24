import QtQuick 2.7

Rectangle {
	
	color: 'yellow'
	anchors.fill: parent
	
	Item {
		objectName: 'obj1'
		property var prop1: 'value1'
		property var prop2: 'value2'
		
		onProp1Changed: cb.call('p1c')
	}
	
}

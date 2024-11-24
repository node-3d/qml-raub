import QtQuick
import QtQuick.Controls.Basic

Rectangle {
	color: 'transparent'
	anchors.fill: parent
	
	Column {
		padding: 16
		spacing: 16
		
		CustomButton {
			objectName: 'myButton1'
			
			text: qsTr('Hello world!')
			onClicked: { eventEmit('press-button1', { text: 'button1' }) }
			
			function func(x) {
				console.log('func called', x);
				return 'returned from func';
			}
		}
		
		CustomButton {
			id: button2
			objectName: 'myButton2'
			
			text: qsTr('Trigger error')
			onClicked: { eventEmit('press-button2', { text: 'button2' }) }
		}
		
		TextArea {
			text: 'Hello'
			color: 'white'
			font.pixelSize: 24
		}
	}
	
}

import QtQuick 2.7

Rectangle {
	
	signal clicked
	
	property alias text : buttonText.text
	
	id : button
	
	width  : buttonText.width + 40
	height : 45
	radius : 2
	antialiasing : true
	
	gradient : Gradient {
		GradientStop {
			position: 0.0
			color: "lightsteelblue"
		}
		GradientStop {
			position : 1.0
			color : mouseArea.pressed ? 'green' : (mouseArea.containsMouse ? 'red' : 'blue')
		}
	}
	
	Text {
		id : buttonText
		text : parent.description
		anchors.centerIn : parent
		font.pixelSize : parent.height * 0.6
		color : "white"
		styleColor : "black"
	}
	
	MouseArea {
		id : mouseArea
		hoverEnabled : true
		anchors.fill : parent
		onClicked : parent.clicked()
	}
	
	Keys.onSpacePressed: clicked()
	
	Accessible.name : text
	Accessible.description : "This button does " + text
	Accessible.role : Accessible.Button
	Accessible.onPressAction : { button.clicked() }
	
}

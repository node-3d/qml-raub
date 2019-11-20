{
	'variables': {
		'rm'             : '<!(node -p "require(\'addon-tools-raub\').rm")',
		'cp'             : '<!(node -p "require(\'addon-tools-raub\').cp")',
		'mkdir'          : '<!(node -p "require(\'addon-tools-raub\').mkdir")',
		'bin'            : '<!(node -p "require(\'addon-tools-raub\').bin")',
		'qt_core_bin'    : '<!(node -p "require(\'deps-qmlui-raub\').core.bin")',
		'qt_gui_bin'     : '<!(node -p "require(\'deps-qmlui-raub\').gui.bin")',
		'qt_qml_bin'     : '<!(node -p "require(\'deps-qmlui-raub\').qml.bin")',
		'qmlui_include'  : '<!(node -p "require(\'deps-qmlui-raub\').include")',
		'qmlui_bin'      : '<!(node -p "require(\'deps-qmlui-raub\').bin")',
	},
	'targets': [
		{
			'target_name'  : 'qml',
			'sources'      : [
				'cpp/bindings.cpp',
				'cpp/view.cpp'
			],
			'include_dirs' : [
				'<!@(node -p "require(\'addon-tools-raub\').include")',
				'<(qmlui_include)',
			],
			'library_dirs' : [ '<(qmlui_bin)' ],
			'conditions'   : [
				
				['OS=="linux"', {
					'libraries': [
						'<(qmlui_bin)/libqmlui.so',
						"-Wl,-rpath,'$$ORIGIN'",
						"-Wl,-rpath,'$$ORIGIN/../node_modules/deps-qt-core-raub/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../node_modules/deps-qt-gui-raub/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../node_modules/deps-qt-qml-raub/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../node_modules/deps-qmlui-raub/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../../deps-qt-core-raub/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../../deps-qt-gui-raub/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../../deps-qt-qml-raub/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../../deps-qmlui-raub/bin-linux'",
						'<(qt_core_bin)/libicui18n.so.56',
						'<(qt_core_bin)/libicuuc.so.56',
						'<(qt_core_bin)/libicudata.so.56',
						'<(qt_core_bin)/libicuio.so.56',
						'<(qt_core_bin)/libicule.so.56',
						'<(qt_core_bin)/libicutu.so.56',
						'<(qt_core_bin)/libQt5Core.so.5',
						'<(qt_core_bin)/libQt5Network.so.5',
						'<(qt_core_bin)/libQt5DBus.so.5',
						'<(qt_gui_bin)/libQt5Gui.so.5',
						'<(qt_gui_bin)/libQt5OpenGL.so.5',
						'<(qt_gui_bin)/libQt5Widgets.so.5',
						'<(qt_gui_bin)/libQt5XcbQpa.so.5',
						'<(qt_qml_bin)/libQt5Qml.so.5',
						'<(qt_qml_bin)/libQt5Quick.so.5',
						'<(qt_qml_bin)/libQt5QuickControls2.so.5',
						'<(qt_qml_bin)/libQt5QuickTemplates2.so.5',
						'<(qt_qml_bin)/libQt5QuickWidgets.so.5',
					],
					'defines': ['__linux__'],
				}],
				
				['OS=="mac"', {
					'libraries': [
						'<(qmlui_bin)/libqmlui.dylib',
						'-Wl,-rpath,@loader_path',
						'-Wl,-rpath,@loader_path/../node_modules/deps-qt-core-raub/bin-osx',
						'-Wl,-rpath,@loader_path/../node_modules/deps-qt-gui-raub/bin-osx',
						'-Wl,-rpath,@loader_path/../node_modules/deps-qt-qml-raub/bin-osx',
						'-Wl,-rpath,@loader_path/../node_modules/deps-qmlui-raub/bin-osx',
						'-Wl,-rpath,@loader_path/../../deps-qt-core-raub/bin-osx',
						'-Wl,-rpath,@loader_path/../../deps-qt-gui-raub/bin-osx',
						'-Wl,-rpath,@loader_path/../../deps-qt-qml-raub/bin-osx',
						'-Wl,-rpath,@loader_path/../../deps-qmlui-raub/bin-osx',
					],
					'defines': ['__APPLE__'],
				}],
				
				['OS=="win"', {
					'defines' : [
						'WIN32_LEAN_AND_MEAN',
						'VC_EXTRALEAN',
						'_WIN32',
					],
					'libraries'     : [ '-lqmlui' ],
					'msvs_settings' : {
						'VCCLCompilerTool' : {
							'AdditionalOptions' : [
								'/GL', '/GF', '/EHsc', '/GS', '/Gy', '/GR-',
							]
						},
						'VCLinkerTool' : {
							'AdditionalOptions' : ['/RELEASE','/OPT:REF','/OPT:ICF','/LTCG'],
						},
					},
				}],
				
			],
		},
	]
}

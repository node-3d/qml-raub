{
	'variables': {
		'qt_core_bin': '<!(node -p "require(\'@node-3d/deps-qmlui\').core.bin")',
		'qt_gui_bin': '<!(node -p "require(\'@node-3d/deps-qmlui\').gui.bin")',
		'qt_qml_bin': '<!(node -p "require(\'@node-3d/deps-qmlui\').qml.bin")',
		'qmlui_include': '<!(node -p "require(\'@node-3d/deps-qmlui\').include")',
		'qmlui_bin': '<!(node -p "require(\'@node-3d/deps-qmlui\').bin")',
	},
	'targets': [
		{
			'target_name': 'qml',
		'includes': ['common.gypi'],
			'sources': [
				'cpp/bindings.cpp',
				'cpp/view.cpp'
			],
			'include_dirs': [
				'<!@(node -e "import(\'@node-3d/addon-tools\').then((m) => m.printInclude())")',
				'<(qmlui_include)',
			],
			'library_dirs': ['<(qmlui_bin)'],
			'conditions': [
				['OS=="linux"', {
					'libraries': [
						"-Wl,--disable-new-dtags",
						"-Wl,-rpath,'$$ORIGIN'",
						"-Wl,-rpath,'$$ORIGIN/../node_modules/@node-3d/deps-qt-core/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../node_modules/@node-3d/deps-qt-gui/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../node_modules/@node-3d/deps-qt-qml/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../node_modules/@node-3d/deps-qmlui/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../../@node-3d/deps-qt-core/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../../@node-3d/deps-qt-gui/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../../@node-3d/deps-qt-qml/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../../@node-3d/deps-qmlui/bin-linux'",
					],
				}],
				
				['OS=="mac"', {
					'target_arch': 'arm',
					'libraries': [
						'<(qmlui_bin)/libqmlui.dylib',
						'-Wl,-rpath,@loader_path',
						'-Wl,-rpath,@loader_path/../node_modules/@node-3d/deps-qt-core/bin-osx',
						'-Wl,-rpath,@loader_path/../node_modules/@node-3d/deps-qt-gui/bin-osx',
						'-Wl,-rpath,@loader_path/../node_modules/@node-3d/deps-qt-qml/bin-osx',
						'-Wl,-rpath,@loader_path/../node_modules/@node-3d/deps-qmlui/bin-osx',
						'-Wl,-rpath,@loader_path/../../@node-3d/deps-qt-core/bin-osx',
						'-Wl,-rpath,@loader_path/../../@node-3d/deps-qt-gui/bin-osx',
						'-Wl,-rpath,@loader_path/../../@node-3d/deps-qt-qml/bin-osx',
						'-Wl,-rpath,@loader_path/../../@node-3d/deps-qmlui/bin-osx',
					],
				}],
				
				['OS=="win"', {
					'libraries': ['-lqmlui'],
				}],
				
			],
		},
	]
}

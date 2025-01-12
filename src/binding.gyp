{
	'variables': {
		'qt_core_bin': '<!(node -p "require(\'deps-qmlui-raub\').core.bin")',
		'qt_gui_bin': '<!(node -p "require(\'deps-qmlui-raub\').gui.bin")',
		'qt_qml_bin': '<!(node -p "require(\'deps-qmlui-raub\').qml.bin")',
		'qmlui_include': '<!(node -p "require(\'deps-qmlui-raub\').include")',
		'qmlui_bin': '<!(node -p "require(\'deps-qmlui-raub\').bin")',
	},
	'targets': [
		{
			'target_name': 'qml',
			'sources': [
				'cpp/bindings.cpp',
				'cpp/view.cpp'
			],
			'include_dirs': [
				'<!@(node -p "require(\'addon-tools-raub\').getInclude()")',
				'<(qmlui_include)',
			],
			'defines': ['UNICODE', '_UNICODE'],
			'cflags_cc': ['-std=c++17', '-fno-exceptions'],
			'cflags': ['-fno-exceptions'],
			'library_dirs': ['<(qmlui_bin)'],
			'conditions': [
				['OS=="linux"', {
					'libraries': [
						"-Wl,--disable-new-dtags",
						"-Wl,-rpath,'$$ORIGIN'",
						"-Wl,-rpath,'$$ORIGIN/../node_modules/deps-qt-core-raub/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../node_modules/deps-qt-gui-raub/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../node_modules/deps-qt-qml-raub/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../node_modules/deps-qmlui-raub/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../../deps-qt-core-raub/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../../deps-qt-gui-raub/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../../deps-qt-qml-raub/bin-linux'",
						"-Wl,-rpath,'$$ORIGIN/../../deps-qmlui-raub/bin-linux'",
					],
					'defines': ['__linux__'],
				}],
				
				['OS=="mac"', {
					'target_arch': 'arm',
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
					'MACOSX_DEPLOYMENT_TARGET': '10.9',
					'defines': ['__APPLE__'],
					'CLANG_CXX_LIBRARY': 'libc++',
					'OTHER_CFLAGS': ['-std=c++17', '-fno-exceptions'],
				}],
				
				['OS=="win"', {
					'defines': [
						'WIN32_LEAN_AND_MEAN', 'VC_EXTRALEAN', '_WIN32', '_HAS_EXCEPTIONS=0',
					],
					'libraries': ['-lqmlui'],
					'msvs_settings': {
						'VCCLCompilerTool' : {
							'AdditionalOptions' : [
								'/O2','/Oy','/GL','/GF','/Gm-', '/std:c++17',
								'/EHa-s-c-','/MT','/GS','/Gy','/GR-','/Gd',
							]
						},
						'VCLinkerTool' : {
							'AdditionalOptions' : ['/DEBUG:NONE', '/LTCG', '/OPT:NOREF'],
						},
					},
				}],
				
			],
		},
	]
}

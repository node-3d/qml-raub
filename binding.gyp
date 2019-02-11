{
	'variables': {
		'rm'             : '<!(node -e "require(\'addon-tools-raub\').rm()")',
		'cp'             : '<!(node -e "require(\'addon-tools-raub\').cp()")',
		'mkdir'          : '<!(node -e "require(\'addon-tools-raub\').mkdir()")',
		'binary'         : '<!(node -e "require(\'addon-tools-raub\').bin()")',
		'qt_core_bin'    : '<!(node -e "require(\'deps-qmlui-raub\').core.bin()")',
		'qt_gui_bin'     : '<!(node -e "require(\'deps-qmlui-raub\').gui.bin()")',
		'qt_qml_bin'     : '<!(node -e "require(\'deps-qmlui-raub\').qml.bin()")',
		'qmlui_include'  : '<!(node -e "require(\'deps-qmlui-raub\').include()")',
		'qmlui_bin'      : '<!(node -e "require(\'deps-qmlui-raub\').bin()")',
	},
	'targets': [
		{
			'target_name'  : 'qml',
			'sources'      : [ 'cpp/bindings.cpp', 'cpp/view.cpp' ],
			'include_dirs' : [
				'<!@(node -e "require(\'addon-tools-raub\').include()")',
				'<(qmlui_include)',
			],
			'library_dirs' : [ '<(qmlui_bin)' ],
			'conditions'   : [
				[
					'OS=="linux"', {
						'libraries': [
							'-Wl,-rpath,<(qmlui_bin):<(qt_qml_bin):<(qt_gui_bin):<(qt_core_bin)',
							'<(qmlui_bin)/libqmlui.so',
						],
					}
				],
				[
					'OS=="mac"', {
						'libraries': [
							'-Wl,-rpath,<(qmlui_bin)',
							'-Wl,-rpath,<(qt_core_bin)',
							'-Wl,-rpath,<(qt_gui_bin)',
							'-Wl,-rpath,<(qt_qml_bin)',
							'<(qmlui_bin)/libqmlui.dylib',
						],
					}
				],
				[
					'OS=="win"', {
						'libraries'     : [ '-lqmlui' ],
						'msvs_settings' : {
							'VCCLCompilerTool' : {
								'AdditionalOptions' : [
									'/O2','/Oy','/GL','/GF','/Gm-', '/Fm-',
									'/EHsc','/MT','/GS','/Gy','/GR-','/Gd',
								]
							},
							'VCLinkerTool' : {
								'AdditionalOptions' : ['/RELEASE','/OPT:REF','/OPT:ICF','/LTCG']
							},
						},
					},
				],
			],
		},
		{
			'target_name'  : 'make_directory',
			'type'         : 'none',
			'dependencies' : ['qml'],
			'actions'      : [{
				'action_name' : 'Directory created.',
				'inputs'      : [],
				'outputs'     : ['build'],
				'action': ['<(mkdir)', '-p', '<(binary)']
			}],
		},
		{
			'target_name'  : 'copy_binary',
			'type'         : 'none',
			'dependencies' : ['make_directory'],
			'actions'      : [{
				'action_name' : 'Module copied.',
				'inputs'      : [],
				'outputs'     : ['binary'],
				'action'      : ['<(cp)', 'build/Release/qml.node', '<(binary)/qml.node'],
			}],
		},
		{
			'target_name'  : 'remove_extras',
			'type'         : 'none',
			'dependencies' : ['copy_binary'],
			'actions'      : [{
				'action_name' : 'Build intermediates removed.',
				'inputs'      : [],
				'outputs'     : ['cpp'],
				'conditions'  : [
					[ 'OS=="linux" or OS=="mac"', { 'action' : [
						'rm',
						'<(module_root_dir)/build/Release/obj.target/qml/cpp/bindings.o',
						'<(module_root_dir)/build/Release/obj.target/qml/cpp/view.o',
						'<(module_root_dir)/build/Release/qml.node'
					] } ],
					[ 'OS=="win"', { 'action' : [
						'<(rm)',
						'<(module_root_dir)/build/Release/qml.*',
						'<(module_root_dir)/build/Release/obj/qml/*.*'
					] } ],
				],
			}],
		},
	]
}

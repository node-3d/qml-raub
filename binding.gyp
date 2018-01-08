{
	'variables': {
		'qmlui_include' : '<!(node -e "console.log(require(\'node-deps-qmlui-raub\').include)")',
		'qmlui_bin'     : '<!(node -e "console.log(require(\'node-deps-qmlui-raub\').bin)")',
	},
	'targets': [
		{
			'target_name'  : 'qml',
			'sources'      : [ 'cpp/exports.cpp' ],
			'libraries'    : [ '-lqmlui' ],
			'include_dirs' : [
				'<!(node -e "require(\'nan\')")',
				'<(qmlui_include)',
				'<!(node -e "require(\'node-addon-tools-raub\')")',
			],
			'library_dirs' : [ '<(qmlui_bin)' ],
			'conditions'   : [
				[
					'OS=="linux"', {
						'libraries': [
							'-Wl,-rpath,<(qmlui_bin)',
						],
					}
				],
				[
					'OS=="mac"', {
						'libraries': [
							'-Wl,-rpath,<(qmlui_bin)',
						],
					}
				],
				[
					'OS=="win"',
					{
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
				'conditions'  : [
					[ 'OS=="linux"', { 'action': ['mkdir', '-p', 'binary'] } ],
					[ 'OS=="mac"', { 'action': ['mkdir', '-p', 'binary'] } ],
					[ 'OS=="win"', { 'action': [
						'<(module_root_dir)/_rd "<(module_root_dir)/binary" && ' +
						'md "<(module_root_dir)/binary"'
					] } ],
				],
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
				'conditions'  : [
					[ 'OS=="linux"', { 'action' : [
						'cp',
						'<(module_root_dir)/build/Release/qml.node',
						'<(module_root_dir)/binary/qml.node'
					] } ],
					[ 'OS=="mac"', { 'action' : [
						'cp',
						'<(module_root_dir)/build/Release/qml.node',
						'<(module_root_dir)/binary/qml.node'
					] } ],
					[ 'OS=="win"', { 'action' : [
						'copy "<(module_root_dir)/build/Release/qml.node"' +
						' "<(module_root_dir)/binary/qml.node"'
					] } ],
				],
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
					[ 'OS=="linux"', { 'action' : [
						'rm',
						'<(module_root_dir)/build/Release/obj.target/qml/cpp/qml.o',
						'<(module_root_dir)/build/Release/obj.target/qml.node',
						'<(module_root_dir)/build/Release/qml.node'
					] } ],
					[ 'OS=="mac"', { 'action' : [
						'rm',
						'<(module_root_dir)/build/Release/obj.target/qml/cpp/qml.o',
						'<(module_root_dir)/build/Release/qml.node'
					] } ],
					[ 'OS=="win"', { 'action' : [
						'<(module_root_dir)/_del "<(module_root_dir)/build/Release/qml.*" && ' +
						'<(module_root_dir)/_del "<(module_root_dir)/build/Release/obj/qml/*.*"'
					] } ],
				],
			}],
		},
	]
}

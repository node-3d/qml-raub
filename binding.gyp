{
	'variables': {
		'platform'      : '<(OS)',
		'qmlui_root'    : '<!(node -e "console.log(require(\'node-deps-qmlui-raub\').root)")',
		'qmlui_include' : '<(qmlui_root)/include',
		'qmlui_bin'     : '<!(node -e "console.log(require(\'node-deps-qmlui-raub\').bin)")',
	},
	'conditions': [
		['platform == "mac"', { 'variables': { 'platform': 'darwin' } }],
		['platform == "win"', { 'variables': { 'platform': 'windows'  } }],
	],
	'targets': [
		
		{
			'target_name'  : 'qml',
			'sources'      : [ 'src/exports.cpp' ],
			'libraries'    : [ '-lqmlui' ],
			'include_dirs' : [
				'<!(node -e "require(\'nan\')")',
				'<(qmlui_include)',
			],
			'library_dirs' : [ '<(qmlui_bin)' ],
			'conditions'   : [
				[
					'OS=="linux"', { }
				],
				[
					'OS=="mac"', { }
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
			'target_name'  : 'copy_binary',
			'type'         : 'none',
			'dependencies' : ['qml'],
			'copies'       : [
				{
					'destination' : '<(module_root_dir)/bin_<(platform)',
					'conditions'  : [
						[
							'OS=="linux"',
							{ 'files' : [] }
						],
						[
							'OS=="mac"',
							{ 'files' : [] }
						],
						[
							'OS=="win"',
							{ 'files' : [ '<(module_root_dir)/build/Release/qml.node' ] },
						],
					]
				}
			],
		},
		
		{
			'target_name'  : 'remove_extras',
			'type'         : 'none',
			'dependencies' : ['copy_binary'],
			'actions'      : [
				{
					'action_name' : 'action_remove1',
					'inputs'      : ['build/Release/qml.*'],
					'outputs'     : ['build'],
					'conditions'  : [
						[ 'OS=="linux"', { 'action' : [ 'rm -rf <@(_inputs)' ] } ],
						[ 'OS=="mac"'  , { 'action' : [ 'rm -rf <@(_inputs)' ] } ],
						[ 'OS=="win"'  , { 'action' : [ '<(module_root_dir)/_del', '<@(_inputs)' ] } ],
					],
				},
				{
					'action_name' : 'action_remove2',
					'inputs'      : ['build/Release/obj/qml/*.obj'],
					'outputs'     : ['build'],
					'conditions'  : [
						[ 'OS=="linux"', { 'action' : [ 'rm -rf <@(_inputs)' ] } ],
						[ 'OS=="mac"'  , { 'action' : [ 'rm -rf <@(_inputs)' ] } ],
						[ 'OS=="win"'  , { 'action' : [ '<(module_root_dir)/_del', '<@(_inputs)' ] } ],
					],
				},
				{
					'action_name' : 'action_remove3',
					'inputs'      : ['build/Release/obj/qml/*.pdb'],
					'outputs'     : ['build'],
					'conditions'  : [
						[ 'OS=="linux"', { 'action' : [ 'rm -rf <@(_inputs)' ] } ],
						[ 'OS=="mac"'  , { 'action' : [ 'rm -rf <@(_inputs)' ] } ],
						[ 'OS=="win"'  , { 'action' : [ '<(module_root_dir)/_del', '<@(_inputs)' ] } ],
					],
				},
			],
		},
		
	]
}

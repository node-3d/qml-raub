{
	'variables': {
		'platform' : '<(OS)',
		'qmlui_root'   : '<!(node -e "console.log(require(\'node-deps-qmlui-raub\').root)")',
		'qmlui_include': '<(qmlui_root)/include',
		'qmlui_bin'    : '<!(node -e "console.log(require(\'node-deps-qmlui-raub\').bin)")',
	},
	'conditions': [
		['platform == "mac"', { 'variables': { 'platform': 'darwin' } }],
		['platform == "win"', { 'variables': { 'platform': 'win32'  } }],
	],
	"targets": [
		{
			"target_name": "qml",
			"sources": [ "src/exports.cpp" ],
			"libraries": ['-lqmlui'],
			"include_dirs": ['<(qmlui_include)'],
			'library_dirs': [ '<(qmlui_bin)' ],
			"variables": { "arch": "Win32" },
			'conditions': [
				[
					'OS=="linux"',
					{
						
					}
				],
				[
					'OS=="mac"',
					{
						
					}
				],
				[
					'OS=="win"',
					{
						'msvs_version'  : '2013',
						'msvs_settings' : {
							'VCCLCompilerTool' : {
								'AdditionalOptions' : [
									'/O2','/Oy','/GL','/GF','/Gm-',
									'/EHsc','/MT','/GS','/Gy','/GR-','/Gd',
								]
							},
							'VCLinkerTool' : {
								'AdditionalOptions' : ['/OPT:REF','/OPT:ICF','/LTCG']
							},
						},
					},
				],
			],
		},
		{
			'target_name': 'copy_binary',
			'type':'none',
			'dependencies' : ['qml'],
			'copies': [
				{
					'destination': '<(module_root_dir)/bin_<(platform)',
					'conditions': [
						[
							'OS=="linux"',
							{
								'files': [ '<(module_root_dir)/build/Release/qml.node' ]
							}
						],
						[
							'OS=="mac"',
							{
								'files': [ '<(module_root_dir)/build/Release/qml.node' ]
							}
						],
						[
							'OS=="win"',
							{
								'files': [ '<(module_root_dir)/build/Release/qml.node' ]
							},
						],
						
					]
				}
			]
			
		}
	]
}

{
	'variables': {
		'platform' : '<(OS)',
		'deps_root': '<!(node -e "console.log(require(\'node-deps-qmlui-raub\'))")',
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
			"include_dirs": ['<(deps_root)/include'],
			"variables": { "arch": "Win32" }
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
						'library_dirs': [ '<(deps_root)/bin_<(platform)' ],
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
			"target_name": "copy_binary",
			"type":"none",
			"dependencies" : [ "qml" ],
			'conditions': [
				[
					'OS=="linux"',
					{
						'copies': [
							{
								'destination': '<(module_root_dir)/bin_linux',
								'files': [
									'<(module_root_dir)/build/Release/qml.node',
								]
							}
						]
					}
				],
				[
					'OS=="mac"',
					{
						'copies': [
							{
								'destination': '<(module_root_dir)/bin_darwin',
								'files': [
									'<(module_root_dir)/build/Release/qml.node',
								]
							}
						]
					}
				],
				[
					'OS=="win"',
					{
						'copies': [
							{
								'destination': '<(module_root_dir)/bin_win32',
								'files': [
									'<(module_root_dir)/build/Release/qml.node',
									'<(deps_root)/bin_<(platform)/qmlui.dll',
								]
							}
						]
					},
				],
				
			],
		}
	]
}

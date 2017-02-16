{
	variables: {
		platform     : '<(OS)',
		qmlui_root   : '<!(node -e "console.log(require(\'node-deps-qmlui-raub\').root)")',
		qmlui_include: '<(qmlui_root)/include',
		qmlui_bin    : '<!(node -e "console.log(require(\'node-deps-qmlui-raub\').bin)")',
	},
	conditions: [
		['platform == "mac"', { variables: { platform: 'darwin' } }],
		['platform == "win"', { variables: { platform: 'win32'  } }],
	],
	targets: [
	
		{
			target_name  : 'qml',
			message      : 'Building the addon.',
			sources      : [ 'src/exports.cpp' ],
			libraries    : ['-lqmlui'],
			include_dirs : ['<(qmlui_include)'],
			library_dirs : [ '<(qmlui_bin)' ],
			variables    : { arch: 'Win32' },
			conditions   : [
				[
					'OS=="linux"', { }
				],
				[
					'OS=="mac"', { }
				],
				[
					'OS=="win"',
					{
						msvs_version  : '2013',
						msvs_settings : {
							VCCLCompilerTool : {
								AdditionalOptions : [
									'/O2','/Oy','/GL','/GF','/Gm-',
									'/EHsc','/MT','/GS','/Gy','/GR-','/Gd',
								]
							},
							VCLinkerTool : {
								AdditionalOptions : ['/OPT:REF','/OPT:ICF','/LTCG']
							},
						},
					},
				],
			],
		},
		
		{
			target_name  : 'copy_binary',
			type         : 'none',
			dependencies : ['qml'],
			message      : 'Copying the addon into the platform-specific directory.',
			copies       : [
				{
					destination : '<(module_root_dir)/bin_<(platform)',
					conditions  : [
						[
							'OS=="linux"',
							{ files: [ '<(module_root_dir)/build/Release/qml.node' ] }
						],
						[
							'OS=="mac"',
							{ files: [] }
						],
						[
							'OS=="win"',
							{ files: [] },
						],
					]
				}
			],
		},
		
		{
			target_name  : 'remove_temporaries',
			type         : 'none',
			dependencies : ['copy_binary'],
			message      : 'Removing temporary files.',
			actions      : [
				{
					action_name : 'do_remove',
					inputs      : [ 'build' ],
					conditions  : [
						[ 'OS=="linux"', { action: ['rm'    , '<@(_inputs)'] } ],
						[ 'OS=="mac"'  , { action: ['rm'    , '<@(_inputs)'] } ],
						[ 'OS=="win"'  , { action: ['remove', '<@(_inputs)'] } ],
					],
				},
			],
		},
		
	]
}

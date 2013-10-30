({		    
                    baseUrl: "public/js-ios/packages",
                    mainConfigFile: "public/js-ios/build.js",
                    dir: "built",
		    name: "main",
                    optimize: "uglify2",
                    uglify2:{
                            output:{
                                    beautify: false,
                            },
                            warnings: true,
                            max_line_length: 32000
                    },
		    paths:{
			requireLib: "../libs/require"
			},
		    include: "requireLib"
})

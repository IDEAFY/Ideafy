({		    
                    baseUrl: "public/js-touch/packages",
                    mainConfigFile: "public/js-touch/build.js",
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

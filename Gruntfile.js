module.exports = function (grunt) {
 
    grunt.initConfig({
        shell: {
            genDoc: {
                command: 'node apidoc/genAPIDoc.js'
            },
            unittest: {
                command: 'node unittest/unittest.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('genDoc', ['shell:genDoc']);
    grunt.registerTask('unittest', ['shell:unittest']);
};
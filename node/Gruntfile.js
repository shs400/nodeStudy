module.exports = function (grunt) {

    // 플러그인 로딩
    [
        'grunt-cafe-mocha',
        'grunt-contrib-jshint',
        'grunt-exec'
    ].forEach(function (task) {
        grunt.loadNpmTasks(task);
    });
    // loadNpmTasks를 여러번 타이핑 하지 않기 위해 배열로 플러그인을 묶은 뒤 forEach 루프로 불러온다.

    // 플러그인 설정
    grunt.initConfig({
       cafemocha: {
           all: { src: 'qa/test-*.js', options: { ui: 'tdd'},} // 모카플러그인 사용할 js 경로 설정, tdd 인터페이스를 사용
       },

        jshint: {
           app: ['app.js', 'public/js/**/*.js', 'qa/**/*.js'],  // 어떤파일이 jshint 대상인지 경로 설정, /**/ - 모든 서브디렉터리의 모든 파일
        },

        exec: {
           linkchecker: { cmd: 'linkchecker http://localhost:3000' }
        }
    });

    // 작업 등록
    grunt.registerTask('default',['cafemocha', 'jshint', 'exec']);  // grunt 라고만 명령해도 기본으로 실행시키게 하는 작업
};
import typescript from 'rollup-plugin-typescript'
import babel from 'rollup-plugin-babel'

export default {
    input: 'src/index.ts',
    output: [
        { name: 'sjs', file: 'lib/sjs.js', format: 'umd', sourcemap: false, exports: 'named' },
        { name: 'sjs', file: 'lib/sjs.esm.mjs', format: 'es', sourcemap: false, exports: 'named' }
    ],
    plugins: [
        typescript({
            exclude: 'node_modules/**',
            typescript: require('typescript')
        }),
        babel()
    ]
}
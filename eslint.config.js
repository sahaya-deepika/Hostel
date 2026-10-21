import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import {defineConfig,globalIgnores} from 'eslint/config'
export default defineConfig([
 globalIgnores(['dist/**','.next/**','node_modules/**','.npm-cache/**','artifacts/**','next-env.d.ts']),
 {files:['src/**/*.{ts,tsx}'],extends:[js.configs.recommended,...tseslint.configs.recommended],languageOptions:{globals:globals.browser},rules:{'@typescript-eslint/no-unused-vars':['error',{varsIgnorePattern:'^[A-Z_]',argsIgnorePattern:'^_',caughtErrorsIgnorePattern:'^_'}]}}
])

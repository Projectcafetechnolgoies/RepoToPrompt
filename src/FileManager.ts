import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import ignore from 'ignore';
import { isBinaryFile } from 'isbinaryfile';
import { encodingForModel } from 'js-tiktoken';
import { FileEntry, SecurityWarning } from './types';

export class FileManager {


    public static countTokens(text: string): number {
        try {
            const enc = encodingForModel('gpt-4');
            const tokens = enc.encode(text);
            return tokens.length;
        } catch (e) {
            console.warn('Token counting fallback:', e);
            return Math.ceil(text.length / 4);
        }
    }

    public static scanForKeys(files: FileEntry[]): SecurityWarning[] {
        const warnings: SecurityWarning[] = [];

        const patterns = [
            { name: 'OpenAI Key', regex: /sk-[a-zA-Z0-9]{48}/g },
            { name: 'AWS Key', regex: /(AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g },
            { name: 'Google Key', regex: /AIza[0-9A-Za-z-_]{35}/g },
            { name: 'Private Key', regex: /-----BEGIN PRIVATE KEY-----/g },
            { name: 'Generic Secret', regex: /((api|secret|access)[_.-]?key)['"]?\s*[:=]\s*['"][a-zA-Z0-9_=-]{20,}['"]/gi } // Додав універсальний пошук
        ];

        files.forEach(file => {
            patterns.forEach(pattern => {
                pattern.regex.lastIndex = 0;

                let match;
                while ((match = pattern.regex.exec(file.content)) !== null) {


                    const textBefore = file.content.substring(0, match.index);
                    const lineNumber = textBefore.split('\n').length;

                    warnings.push({
                        file: file.relativePath,
                        type: pattern.name,
                        line: lineNumber
                    });
                }
            });
        });

        return warnings;
    }

    public static async processPaths(inputPaths: string[]): Promise<FileEntry[]> {
        const entries: FileEntry[] = [];

        for (const inputPath of inputPaths) {
            try {
                const stat = await fs.stat(inputPath);
                if (stat.isFile()) {
                    const content = await this.readFileSafe(inputPath);
                    if (content !== null) {
                        entries.push({ path: inputPath, relativePath: path.basename(inputPath), content });
                    }
                } else if (stat.isDirectory()) {
                    const folderEntries = await this.scanDirectory(inputPath);
                    folderEntries.forEach(e => entries.push(e));
                }
            } catch (error) {
                console.error(`Error processing ${inputPath}:`, error);
            }
        }
        return entries;
    }

    private static async scanDirectory(rootPath: string): Promise<FileEntry[]> {
        const ig = ignore();
        ig.add(['.git', 'node_modules', 'dist', 'build', 'coverage', '.idea', '.vscode', '*.lock', '*.log', '.DS_Store', '*.png', '*.jpg', '*.exe', '*.bin', '.env']);

        try {
            const gitignorePath = path.join(rootPath, '.gitignore');
            const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
            ig.add(gitignoreContent);
        } catch { }

        const rawFiles = await glob('**/*', { cwd: rootPath, nodir: true, dot: true, ignore: 'node_modules/**' });
        const filtered = ig.filter(rawFiles);

        const entries: FileEntry[] = [];
        for (const rel of filtered) {
            const full = path.join(rootPath, rel);
            const content = await this.readFileSafe(full);
            if (content !== null) {
                entries.push({ path: full, relativePath: rel, content });
            }
        }
        return entries;
    }

    private static async readFileSafe(filePath: string): Promise<string | null> {
        try {
            if (await isBinaryFile(filePath)) return null;
            return await fs.readFile(filePath, 'utf-8');
        } catch { return null; }
    }

    public static async writeFile(filePath: string, content: string): Promise<void> {
        await fs.writeFile(filePath, content, 'utf-8');
    }
}
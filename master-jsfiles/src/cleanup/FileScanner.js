import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

export class FileScanner {
    constructor() {
        this.defaultPatterns = ['*_old*', '*_original*'];
        this.defaultExtensions = ['.js'];
    }

    async scanForOldFiles(patterns = this.defaultPatterns, rootPath = process.cwd()) {
        const foundFiles = [];
        
        for (const pattern of patterns) {
            try {
                const globPattern = `**/${pattern}`;
                const files = await glob(globPattern, {
                    cwd: rootPath,
                    ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
                    absolute: true
                });
                foundFiles.push(...files);
            } catch (error) {
                console.error(`Error scanning for pattern ${pattern}:`, error);
            }
        }

        return [...new Set(foundFiles)];
    }

    filterByFileType(files, extensions = this.defaultExtensions) {
        return files.filter(file => {
            const ext = path.extname(file);
            return extensions.includes(ext);
        });
    }

    async validateFileExists(filePath) {
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            return true;
        } catch (error) {
            return false;
        }
    }

    async getFileInfo(filePath) {
        try {
            const stats = await fs.promises.stat(filePath);
            return {
                filePath,
                fileName: path.basename(filePath),
                fileSize: stats.size,
                lastModified: stats.mtime,
                fileType: path.extname(filePath)
            };
        } catch (error) {
            console.error(`Error getting file info for ${filePath}:`, error);
            return null;
        }
    }

    async scanWithInfo(patterns = this.defaultPatterns, extensions = this.defaultExtensions, rootPath = process.cwd()) {
        const allFiles = await this.scanForOldFiles(patterns, rootPath);
        const filteredFiles = this.filterByFileType(allFiles, extensions);
        
        const fileInfos = [];
        for (const file of filteredFiles) {
            const info = await this.getFileInfo(file);
            if (info) {
                fileInfos.push(info);
            }
        }

        return fileInfos;
    }
}
export default function hooksPlugin({ rmFiles, // 需要删除的文件/目录路径数组（默认空数组）
beforeBuild, // 构建开始前执行的钩子函数
afterBuild, }: {
    rmFiles?: string[];
    beforeBuild?: Function;
    afterBuild?: Function;
}): {
    name: string;
    buildStart(): void;
    buildEnd(err?: Error): void;
};

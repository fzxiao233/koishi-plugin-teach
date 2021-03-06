"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./database");
const utils_1 = require("./utils");
async function default_1(parsedOptions, question, answer) {
    const { argc, meta, ctx, options, config } = parsedOptions;
    if (String(question).includes('[CQ:image,'))
        return meta.$send('问题不能包含图片。');
    question = utils_1.simplifyQuestion(question);
    answer = utils_1.simplifyAnswer(answer);
    if (!answer)
        return meta.$send('缺少问题或回答，请检查指令语法。');
    if (argc > 2)
        return meta.$send('存在多余的参数，请检查指令语法或将含有空格或换行的问答置于一对引号内。');
    const [dialogue] = await ctx.database.getDialogues({ question, answer });
    if (dialogue)
        return meta.$send(`问答已存在，编号为 ${dialogue.id}，如要修改请尝试使用 -u 指令。`);
    let { envMode, groups, writer } = parsedOptions;
    if (config.useEnvironment) {
        if (!envMode) {
            envMode = 2;
            groups = [meta.groupId];
        }
        else if (Math.abs(envMode) === 1) {
            return meta.$send('参数 -e, --env 错误，请检查指令语法。');
        }
    }
    if (config.useWriter && writer === undefined) {
        writer = meta.userId;
    }
    const { chance: probability = 1 } = options;
    const flag = Number(!!options.frozen) * database_1.DialogueFlag.frozen
        + Number(!!options.regexp) * database_1.DialogueFlag.regexp
        + Number(!!options.keyword) * database_1.DialogueFlag.keyword
        + Number(!!options.appellation) * database_1.DialogueFlag.appellation;
    const data = { question, answer, writer, flag, probability };
    data.groups = config.useEnvironment ? (envMode === 2 ? '' : '*') + groups.join(',') : '*';
    const { id } = await ctx.database.createDialogue(data);
    return meta.$send(`问答已添加，编号为 ${id}。`);
}
exports.default = default_1;

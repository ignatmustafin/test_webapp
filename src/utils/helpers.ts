import {exec} from "child_process";
import {promisify} from "util";

const execPromisify = promisify(exec)


export const getRandomIntervalValue = () => Math.floor(Math.random() * (300000 - 30000 + 1)) + 30000;

export const getInstanceId = () => execPromisify('echo $HOSTNAME').then(({stdout, stderr}) => stdout.trim())